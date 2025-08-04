const CACHE_NAME = 'workshop-scanner-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/html5-qrcode'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request).then(
          (response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline scanning
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-scan-sync') {
    event.waitUntil(syncOfflineScans());
  }
});

// Push notifications for scan updates
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Workshop Scanner';
  const options = {
    body: data.body || 'تحديث جديد من الماسح الضوئي',
    icon: 'icon-192.png',
    badge: 'icon-72.png',
    tag: 'scan-update',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'عرض',
        icon: 'icon-72.png'
      },
      {
        action: 'dismiss',
        title: 'إغلاق',
        icon: 'icon-72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Function to sync offline scans
async function syncOfflineScans() {
  try {
    const offlineScans = await getOfflineScans();
    
    for (const scan of offlineScans) {
      try {
        const response = await fetch('http://localhost:8000/api/barcode-qr/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scan)
        });
        
        if (response.ok) {
          await removeOfflineScan(scan.id);
          console.log('Synced offline scan:', scan.id);
        }
      } catch (error) {
        console.error('Failed to sync scan:', scan.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for offline scan management
async function getOfflineScans() {
  const cache = await caches.open('offline-scans');
  const requests = await cache.keys();
  const scans = [];
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const scan = await response.json();
      scans.push(scan);
    }
  }
  
  return scans;
}

async function removeOfflineScan(scanId) {
  const cache = await caches.open('offline-scans');
  await cache.delete(`/offline-scan/${scanId}`);
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME
    });
  }
  
  if (event.data && event.data.type === 'STORE_OFFLINE_SCAN') {
    storeOfflineScan(event.data.scan);
  }
});

// Store scan for offline sync
async function storeOfflineScan(scan) {
  try {
    const cache = await caches.open('offline-scans');
    const scanId = Date.now().toString();
    const scanData = {
      ...scan,
      id: scanId,
      timestamp: new Date().toISOString(),
      offline: true
    };
    
    const response = new Response(JSON.stringify(scanData));
    await cache.put(`/offline-scan/${scanId}`, response);
    
    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      self.registration.sync.register('background-scan-sync');
    }
    
    console.log('Stored offline scan:', scanId);
  } catch (error) {
    console.error('Failed to store offline scan:', error);
  }
}