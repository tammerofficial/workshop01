<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>داشبورد API - نظام الورشة</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <style>
        body { font-family: 'Tajawal', sans-serif; }
        .rtl { direction: rtl; }
        .status-healthy { @apply bg-green-100 text-green-800 border-green-200; }
        .status-warning { @apply bg-yellow-100 text-yellow-800 border-yellow-200; }
        .status-error { @apply bg-red-100 text-red-800 border-red-200; }
        .metric-card { @apply bg-white rounded-lg shadow-md p-6 border border-gray-200; }
        .metric-value { @apply text-3xl font-bold text-gray-900; }
        .metric-label { @apply text-sm text-gray-600 mt-1; }
        .refresh-btn { transition: transform 0.2s; }
        .refresh-btn:hover { transform: rotate(180deg); }
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        
        /* Endpoint badges */
        .badge-get { @apply px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800; }
        .badge-post { @apply px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800; }
        .badge-put { @apply px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800; }
        .badge-delete { @apply px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800; }
        
        .endpoint-item { @apply border-b border-gray-100 pb-2 mb-2; }
        .endpoint-item:last-child { @apply border-b-0 mb-0; }
        
        code { @apply font-mono text-xs; }
    </style>
</head>
<body class="bg-gray-50 rtl" x-data="apiDashboard()">
    <div class="min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-6">
                    <div class="flex items-center">
                        <h1 class="text-3xl font-bold text-gray-900">📊 داشبورد API</h1>
                        <span class="mr-4 px-3 py-1 text-sm rounded-full"
                              :class="overallStatus === 'healthy' ? 'status-healthy' : overallStatus === 'warning' ? 'status-warning' : 'status-error'">
                            <span x-text="overallStatus === 'healthy' ? '✅ صحي' : overallStatus === 'warning' ? '⚠️ تحذير' : '❌ خطأ'"></span>
                        </span>
                    </div>
                    <div class="flex items-center space-x-4 space-x-reverse">
                        <a href="/dashboard/docs" 
                           class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors">
                            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                            مركز الوثائق
                        </a>
                        <button @click="refreshData()" 
                                class="refresh-btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                                :disabled="loading">
                            <svg class="w-4 h-4 ml-2" :class="{'animate-spin': loading}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            تحديث
                        </button>
                        <div class="text-sm text-gray-500">
                            آخر تحديث: <span x-text="lastUpdate"></span>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <!-- System Status Overview -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">🔍 حالة النظام العامة</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="metric-card">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                    <span class="text-blue-600">🌐</span>
                                </div>
                            </div>
                            <div class="mr-4">
                                <div class="metric-value" x-text="systemStatus.environment"></div>
                                <div class="metric-label">البيئة</div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                    <span class="text-green-600">⏱️</span>
                                </div>
                            </div>
                            <div class="mr-4">
                                <div class="metric-value" x-text="systemStatus.server_time"></div>
                                <div class="metric-label">وقت الخادم</div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                                    <span class="text-purple-600">🐘</span>
                                </div>
                            </div>
                            <div class="mr-4">
                                <div class="metric-value" x-text="systemStatus.php_version"></div>
                                <div class="metric-label">إصدار PHP</div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                                    <span class="text-red-600">🔧</span>
                                </div>
                            </div>
                            <div class="mr-4">
                                <div class="metric-value" x-text="systemStatus.laravel_version"></div>
                                <div class="metric-label">إصدار Laravel</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- API Statistics -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">📈 إحصائيات API</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="metric-card">
                        <div class="metric-value text-blue-600" x-text="apiStats.total_users"></div>
                        <div class="metric-label">إجمالي المستخدمين</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-value text-green-600" x-text="apiStats.active_users"></div>
                        <div class="metric-label">المستخدمون النشطون</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-value text-purple-600" x-text="apiStats.api_endpoints"></div>
                        <div class="metric-label">نقاط API</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-value text-yellow-600" x-text="apiStats.requests_today"></div>
                        <div class="metric-label">طلبات اليوم</div>
                    </div>
                </div>
            </div>

            <!-- API Endpoints -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">🔗 API Endpoints</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Authentication Endpoints -->
                    <div class="metric-card">
                        <h3 class="text-lg font-semibold mb-4 text-blue-600">🔐 المصادقة والتفويض</h3>
                        <div class="space-y-3">
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">تسجيل الدخول</span>
                                    <span class="badge-post">POST</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/auth/login</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">تسجيل الخروج</span>
                                    <span class="badge-post">POST</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/auth/logout</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">بيانات المستخدم</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/auth/me</code>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Orders Endpoints -->
                    <div class="metric-card">
                        <h3 class="text-lg font-semibold mb-4 text-green-600">📋 إدارة الطلبات</h3>
                        <div class="space-y-3">
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">جميع الطلبات</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/orders</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">إحصائيات الطلبات</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/orders/stats</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">إنشاء طلب</span>
                                    <span class="badge-post">POST</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/orders</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">تحديث الطلب</span>
                                    <span class="badge-put">PUT</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/orders/{id}</code>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Users & Roles Endpoints -->
                    <div class="metric-card">
                        <h3 class="text-lg font-semibold mb-4 text-purple-600">👥 المستخدمين والأدوار</h3>
                        <div class="space-y-3">
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">جميع المستخدمين</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/users</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">الأدوار</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/simple-roles</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">الصلاحيات</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/permissions/grouped</code>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Business Endpoints -->
                    <div class="metric-card">
                        <h3 class="text-lg font-semibold mb-4 text-orange-600">💼 العمليات التجارية</h3>
                        <div class="space-y-3">
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">العملاء</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/clients</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">الفواتير</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/invoices</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">المنتجات</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/products</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">المواد</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/materials</code>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Production & Workers Endpoints -->
                    <div class="metric-card">
                        <h3 class="text-lg font-semibold mb-4 text-red-600">🏭 الإنتاج والعمال</h3>
                        <div class="space-y-3">
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">العمال</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/workers</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">تتبع الإنتاج</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/production-tracking</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">الحضور والغياب</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/biometric/workers</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">كشوف المرتبات</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/payroll</code>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- System & Settings Endpoints -->
                    <div class="metric-card">
                        <h3 class="text-lg font-semibold mb-4 text-indigo-600">⚙️ النظام والإعدادات</h3>
                        <div class="space-y-3">
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">حالة النظام</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/dashboard/health</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">إعدادات المظهر</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/system-settings/theme</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">الإشعارات</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/notifications</code>
                                </div>
                            </div>
                            
                            <div class="endpoint-item">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">تحليلات متقدمة</span>
                                    <span class="badge-get">GET</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    <code class="bg-gray-100 px-2 py-1 rounded">/api/advanced/analytics</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick API Testing -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">🧪 اختبار API السريع</h2>
                <div class="metric-card">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-blue-600">📋 اختبار الطلبات</h3>
                            <div class="space-y-2">
                                <button onclick="testApiEndpoint('/api/orders')" 
                                        class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                                    جلب جميع الطلبات
                                </button>
                                <button onclick="testApiEndpoint('/api/orders/stats')" 
                                        class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">
                                    إحصائيات الطلبات
                                </button>
                                <div id="orders-result" class="text-xs bg-gray-100 p-2 rounded mt-2 max-h-32 overflow-auto hidden"></div>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-purple-600">👥 اختبار المستخدمين</h3>
                            <div class="space-y-2">
                                <button onclick="testApiEndpoint('/api/users')" 
                                        class="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm">
                                    جلب المستخدمين
                                </button>
                                <button onclick="testApiEndpoint('/api/simple-roles')" 
                                        class="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm">
                                    جلب الأدوار
                                </button>
                                <div id="users-result" class="text-xs bg-gray-100 p-2 rounded mt-2 max-h-32 overflow-auto hidden"></div>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-red-600">⚙️ اختبار النظام</h3>
                            <div class="space-y-2">
                                <button onclick="testApiEndpoint('/api/dashboard/health')" 
                                        class="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm">
                                    فحص صحة النظام
                                </button>
                                <button onclick="testApiEndpoint('/api/dashboard/status')" 
                                        class="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm">
                                    حالة API
                                </button>
                                <div id="system-result" class="text-xs bg-gray-100 p-2 rounded mt-2 max-h-32 overflow-auto hidden"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Popular Endpoints Quick Links -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">⚡ روابط سريعة</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <a href="/api/orders" target="_blank" 
                       class="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border">
                        <span class="text-2xl mb-2">📋</span>
                        <span class="text-sm font-medium text-center">الطلبات</span>
                    </a>
                    
                    <a href="/api/orders/stats" target="_blank" 
                       class="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border">
                        <span class="text-2xl mb-2">📊</span>
                        <span class="text-sm font-medium text-center">إحصائيات الطلبات</span>
                    </a>
                    
                    <a href="/api/users" target="_blank" 
                       class="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border">
                        <span class="text-2xl mb-2">👥</span>
                        <span class="text-sm font-medium text-center">المستخدمين</span>
                    </a>
                    
                    <a href="/api/clients" target="_blank" 
                       class="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border">
                        <span class="text-2xl mb-2">🏢</span>
                        <span class="text-sm font-medium text-center">العملاء</span>
                    </a>
                    
                    <a href="/api/dashboard/health" target="_blank" 
                       class="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border">
                        <span class="text-2xl mb-2">💚</span>
                        <span class="text-sm font-medium text-center">صحة النظام</span>
                    </a>
                    
                    <a href="/dashboard/docs" 
                       class="flex flex-col items-center p-4 bg-green-50 rounded-lg shadow hover:shadow-md transition-shadow border border-green-200">
                        <span class="text-2xl mb-2">📖</span>
                        <span class="text-sm font-medium text-center text-green-600">مركز الوثائق</span>
                    </a>
                    
                    <a href="http://localhost:5173" target="_blank" 
                       class="flex flex-col items-center p-4 bg-blue-50 rounded-lg shadow hover:shadow-md transition-shadow border border-blue-200">
                        <span class="text-2xl mb-2">🖥️</span>
                        <span class="text-sm font-medium text-center text-blue-600">واجهة المستخدم</span>
                    </a>
                </div>
            </div>

            <!-- Performance Metrics -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">⚡ مقاييس الأداء</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="metric-card">
                        <h3 class="text-lg font-semibold mb-4">💾 استخدام الذاكرة</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span>الاستخدام الحالي:</span>
                                <span x-text="performanceMetrics.memory_usage"></span>
                            </div>
                            <div class="flex justify-between">
                                <span>الذروة:</span>
                                <span x-text="performanceMetrics.memory_peak"></span>
                            </div>
                            <div class="flex justify-between">
                                <span>الحد الأقصى:</span>
                                <span x-text="performanceMetrics.memory_limit"></span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-600 h-2 rounded-full" 
                                     :style="`width: ${performanceMetrics.memory_percentage}%`"></div>
                            </div>
                            <div class="text-sm text-gray-600 text-center" 
                                 x-text="`${performanceMetrics.memory_percentage}% مستخدم`"></div>
                        </div>
                    </div>

                    <div class="metric-card">
                        <h3 class="text-lg font-semibold mb-4">💿 استخدام القرص</h3>
                        <div class="space-y-3" x-data="{ disk: performanceMetrics.disk_usage }">
                            <div class="flex justify-between">
                                <span>المساحة المستخدمة:</span>
                                <span x-text="disk.used"></span>
                            </div>
                            <div class="flex justify-between">
                                <span>المساحة المتاحة:</span>
                                <span x-text="disk.free"></span>
                            </div>
                            <div class="flex justify-between">
                                <span>المساحة الإجمالية:</span>
                                <span x-text="disk.total"></span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-green-600 h-2 rounded-full" 
                                     :style="`width: ${disk.percentage}%`"></div>
                            </div>
                            <div class="text-sm text-gray-600 text-center" 
                                 x-text="`${disk.percentage}% مستخدم`"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Database Status -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">🗄️ حالة قاعدة البيانات</h2>
                <div class="bg-white rounded-lg shadow-md">
                    <div class="p-6 border-b border-gray-200">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div class="text-center">
                                <div class="metric-value text-blue-600" x-text="databaseStatus.total_tables"></div>
                                <div class="metric-label">عدد الجداول</div>
                            </div>
                            <div class="text-center">
                                <div class="metric-value text-green-600" x-text="databaseStatus.total_rows"></div>
                                <div class="metric-label">إجمالي الصفوف</div>
                            </div>
                            <div class="text-center">
                                <div class="metric-value text-purple-600" x-text="databaseStatus.total_size"></div>
                                <div class="metric-label">حجم قاعدة البيانات</div>
                            </div>
                            <div class="text-center">
                                <div class="metric-value text-gray-600" x-text="databaseStatus.server_version"></div>
                                <div class="metric-label">إصدار الخادم</div>
                            </div>
                        </div>
                    </div>
                    <div class="p-6">
                        <h4 class="font-semibold mb-4">تفاصيل الجداول</h4>
                        <div class="overflow-x-auto">
                            <table class="min-w-full table-auto">
                                <thead>
                                    <tr class="bg-gray-50">
                                        <th class="px-4 py-2 text-right">اسم الجدول</th>
                                        <th class="px-4 py-2 text-right">عدد الصفوف</th>
                                        <th class="px-4 py-2 text-right">الحجم</th>
                                        <th class="px-4 py-2 text-right">المحرك</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template x-for="table in databaseStatus.tables" :key="table.name">
                                        <tr class="border-b border-gray-100">
                                            <td class="px-4 py-2" x-text="table.name"></td>
                                            <td class="px-4 py-2" x-text="table.rows"></td>
                                            <td class="px-4 py-2" x-text="table.size"></td>
                                            <td class="px-4 py-2" x-text="table.engine"></td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Security Status -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">🔒 حالة الأمان</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="metric-card">
                        <div class="flex items-center justify-between">
                            <span>SSL مُفعّل</span>
                            <span :class="securityStatus.ssl_enabled ? 'text-green-600' : 'text-red-600'">
                                <span x-text="securityStatus.ssl_enabled ? '✅' : '❌'"></span>
                            </span>
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="flex items-center justify-between">
                            <span>البيئة آمنة</span>
                            <span :class="securityStatus.environment_secure ? 'text-green-600' : 'text-red-600'">
                                <span x-text="securityStatus.environment_secure ? '✅' : '❌'"></span>
                            </span>
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="flex items-center justify-between">
                            <span>Debug معطل</span>
                            <span :class="securityStatus.debug_disabled ? 'text-green-600' : 'text-red-600'">
                                <span x-text="securityStatus.debug_disabled ? '✅' : '❌'"></span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">📋 النشاط الحديث</h2>
                <div class="bg-white rounded-lg shadow-md">
                    <div class="overflow-hidden">
                        <table class="min-w-full table-auto">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستخدم</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التوقيت</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <template x-for="activity in recentActivity" :key="activity.id">
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="activity.description"></td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600" x-text="activity.causer_name"></td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" x-text="activity.created_at"></td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        function apiDashboard() {
            return {
                loading: false,
                lastUpdate: '',
                overallStatus: '{{ $systemStatus["overall"] }}',
                systemStatus: @json($systemStatus),
                apiStats: @json($apiStats),
                databaseStatus: @json($databaseStatus),
                performanceMetrics: @json($performanceMetrics),
                securityStatus: @json($securityStatus),
                recentActivity: @json($recentActivity),

                init() {
                    this.updateLastUpdateTime();
                    // Auto-refresh every 30 seconds
                    setInterval(() => {
                        this.refreshData();
                    }, 30000);
                },

                async refreshData() {
                    this.loading = true;
                    try {
                        const response = await fetch('/api/dashboard/status');
                        const data = await response.json();
                        
                        if (data.success) {
                            this.systemStatus = data.data.system_status;
                            this.apiStats = data.data.api_stats;
                            this.databaseStatus = data.data.database_status;
                            this.performanceMetrics = data.data.performance_metrics;
                            this.securityStatus = data.data.security_status;
                            this.overallStatus = data.data.system_status.overall;
                        }
                    } catch (error) {
                        console.error('خطأ في تحديث البيانات:', error);
                    } finally {
                        this.loading = false;
                        this.updateLastUpdateTime();
                    }
                },

                updateLastUpdateTime() {
                    this.lastUpdate = new Date().toLocaleString('ar-SA');
                }
            }
        }

        // API Testing Function
        async function testApiEndpoint(endpoint) {
            const section = endpoint.includes('/orders') ? 'orders' : 
                           endpoint.includes('/users') || endpoint.includes('/roles') ? 'users' : 'system';
            const resultDiv = document.getElementById(`${section}-result`);
            
            try {
                resultDiv.classList.remove('hidden');
                resultDiv.innerHTML = '<div class="text-blue-600">جاري تحميل البيانات...</div>';
                
                const response = await fetch(endpoint, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Format the JSON data nicely
                    let formattedData = JSON.stringify(data, null, 2);
                    if (formattedData.length > 500) {
                        formattedData = formattedData.substring(0, 500) + '...';
                    }
                    
                    resultDiv.innerHTML = `
                        <div class="text-green-600 font-bold mb-2">✅ نجح الطلب (${response.status})</div>
                        <div class="text-gray-700">
                            <strong>Endpoint:</strong> ${endpoint}<br>
                            <strong>Response:</strong><br>
                            <pre class="whitespace-pre-wrap">${formattedData}</pre>
                        </div>
                    `;
                } else {
                    resultDiv.innerHTML = `
                        <div class="text-red-600 font-bold mb-2">❌ فشل الطلب (${response.status})</div>
                        <div class="text-gray-700">
                            <strong>Endpoint:</strong> ${endpoint}<br>
                            <strong>Error:</strong><br>
                            <pre class="whitespace-pre-wrap">${JSON.stringify(data, null, 2)}</pre>
                        </div>
                    `;
                }
            } catch (error) {
                resultDiv.innerHTML = `
                    <div class="text-red-600 font-bold mb-2">❌ خطأ في الاتصال</div>
                    <div class="text-gray-700">
                        <strong>Endpoint:</strong> ${endpoint}<br>
                        <strong>Error:</strong> ${error.message}
                    </div>
                `;
            }
        }
    </script>
</body>
</html>