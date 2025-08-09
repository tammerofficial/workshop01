@extends('layouts.app')

@section('title', 'لوحة التحكم - Dashboard')

@section('content')
<div x-data="{ 
  loaded: false,
  loading: false,
  error: null,
  lastUpdated: null,
  stats: {
    orders: { total: 0, trend: '+0%', color: 'blue', loading: false },
    production: { total: 0, trend: '+0%', color: 'amber', loading: false },
    completed: { total: 0, trend: '+0%', color: 'emerald', loading: false },
    revenue: { total: 0, trend: '+0%', color: 'purple', loading: false }
  },
  quickStats: {
    todayOrders: 0,
    activeWorkers: 0,
    pendingTasks: 0,
    completionRate: 0
  },
  activities: [],
  
  async fetchDashboardData() {
    this.loading = true
    this.error = null
    
    try {
      const response = await fetch('/api/ui/dashboard-data', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        this.stats = data.data.stats
        this.quickStats = data.data.quickStats
        this.activities = data.data.recentActivities
        this.lastUpdated = new Date(data.data.lastUpdated).toLocaleString('ar-SA')
        this.error = null
      } else {
        throw new Error(data.message || 'فشل في جلب البيانات')
      }
    } catch (error) {
      console.error('Dashboard API Error:', error)
      this.error = 'فشل في الاتصال بالخادم: ' + error.message
      
      // Use fallback data
      this.useFallbackData()
    } finally {
      this.loading = false
    }
  },
  
  async fetchRealTimeUpdates() {
    try {
      const response = await fetch('/api/ui/dashboard-updates', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update only the numbers for smooth real-time updates
          this.stats.orders.total = data.data.orders
          this.stats.production.total = data.data.production
          this.stats.completed.total = data.data.completed
        }
      }
    } catch (error) {
      console.warn('Real-time update failed:', error)
    }
  },
  
  useFallbackData() {
    this.stats = {
      orders: { total: 1284, trend: '+12%', color: 'blue' },
      production: { total: 356, trend: '+5%', color: 'amber' },
      completed: { total: 812, trend: '+8%', color: 'emerald' },
      revenue: { total: 125430, trend: '+15%', color: 'purple' }
    }
    this.quickStats = {
      todayOrders: 23,
      activeWorkers: 12,
      pendingTasks: 7,
      completionRate: 87
    }
    this.activities = [
      { type: 'order', title: 'طلب جديد #1234', time: 'منذ دقيقتين', color: 'blue' },
      { type: 'complete', title: 'تم إنجاز الطلب #1233', time: 'منذ 5 دقائق', color: 'emerald' },
      { type: 'production', title: 'بدء إنتاج المنتج #5678', time: 'منذ 10 دقائق', color: 'amber' },
      { type: 'worker', title: 'عامل جديد انضم للفريق', time: 'منذ 15 دقيقة', color: 'purple' }
    ]
  },
  
  startRealTimeUpdates() {
    // Fetch real-time updates every 5 seconds
    setInterval(() => {
      if (!this.loading) {
        this.fetchRealTimeUpdates()
      }
    }, 5000)
    
    // Refresh full data every 60 seconds
    setInterval(() => {
      if (!this.loading) {
        this.fetchDashboardData()
      }
    }, 60000)
  },
  
  async init() {
    this.loaded = true
    await this.fetchDashboardData()
    this.startRealTimeUpdates()
  }
}" x-init="init"
   x-show="loaded"
   x-transition:enter="transition ease-out duration-500"
   x-transition:enter-start="opacity-0 transform scale-95"
   x-transition:enter-end="opacity-100 transform scale-100">

  <!-- Loading Overlay -->
  <div x-show="loading" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div class="bg-white rounded-xl p-6 shadow-xl border border-gray-200">
      <div class="flex items-center gap-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="text-gray-900 font-medium">جاري تحديث البيانات...</span>
      </div>
    </div>
  </div>

  <!-- Error Alert -->
  <div x-show="error" 
       x-transition:enter="transition ease-out duration-300"
       x-transition:enter-start="opacity-0 transform translate-y-2"
       x-transition:enter-end="opacity-100 transform translate-y-0"
       class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
    <div class="flex items-center gap-3">
      <div class="text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <div class="flex-1">
        <h4 class="text-red-800 font-medium">خطأ في جلب البيانات</h4>
        <p class="text-red-700 text-sm mt-1" x-text="error"></p>
      </div>
      <button @click="error = null; fetchDashboardData()" 
              class="text-red-600 hover:text-red-800 transition-colors duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Status Bar -->
  <div class="mb-6 flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <div class="size-2 rounded-full bg-emerald-400 animate-pulse"></div>
        <span class="text-sm font-medium text-gray-900">النظام نشط</span>
      </div>
      <div x-show="lastUpdated" class="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
        آخر تحديث: <span x-text="lastUpdated"></span>
      </div>
    </div>
    <button @click="fetchDashboardData()" 
            :disabled="loading"
            class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 disabled:opacity-50">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4" :class="{ 'animate-spin': loading }">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
      <span>تحديث</span>
    </button>
  </div>

  <!-- Quick Stats Bar -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-blue-100 text-sm">طلبات اليوم</p>
          <p class="text-2xl font-bold" x-text="quickStats.todayOrders"></p>
        </div>
        <div class="bg-blue-400/30 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </div>
      </div>
    </div>

    <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-emerald-100 text-sm">العمال النشطون</p>
          <p class="text-2xl font-bold" x-text="quickStats.activeWorkers"></p>
        </div>
        <div class="bg-emerald-400/30 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        </div>
      </div>
    </div>

    <div class="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 text-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-amber-100 text-sm">مهام معلقة</p>
          <p class="text-2xl font-bold" x-text="quickStats.pendingTasks"></p>
        </div>
        <div class="bg-amber-400/30 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
      </div>
    </div>

    <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-purple-100 text-sm">معدل الإنجاز</p>
          <p class="text-2xl font-bold"><span x-text="quickStats.completionRate"></span>%</p>
        </div>
        <div class="bg-purple-400/30 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
          </svg>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Stats Cards -->
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
    <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center justify-between mb-3">
        <div class="text-sm text-gray-500 font-medium">إجمالي الطلبات</div>
        <span class="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full border border-blue-200 font-medium" x-text="stats.orders.trend"></span>
      </div>
      <div class="text-3xl font-bold text-gray-900 mb-3" x-text="stats.orders.total.toLocaleString()"></div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <div class="size-2 rounded-full bg-blue-400 animate-pulse"></div>
        <span>تحديث مباشر</span>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center justify-between mb-3">
        <div class="text-sm text-gray-500 font-medium">قيد التنفيذ</div>
        <span class="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 font-medium" x-text="stats.production.trend"></span>
      </div>
      <div class="text-3xl font-bold text-gray-900 mb-3" x-text="stats.production.total.toLocaleString()"></div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <div class="size-2 rounded-full bg-amber-400 animate-pulse"></div>
        <span>تتبع مباشر</span>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center justify-between mb-3">
        <div class="text-sm text-gray-500 font-medium">مكتملة</div>
        <span class="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 font-medium" x-text="stats.completed.trend"></span>
      </div>
      <div class="text-3xl font-bold text-gray-900 mb-3" x-text="stats.completed.total.toLocaleString()"></div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <div class="size-2 rounded-full bg-emerald-400 animate-pulse"></div>
        <span>بيانات فورية</span>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center justify-between mb-3">
        <div class="text-sm text-gray-500 font-medium">الإيرادات</div>
        <span class="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-full border border-purple-200 font-medium" x-text="stats.revenue.trend"></span>
      </div>
      <div class="text-3xl font-bold text-gray-900 mb-3">$<span x-text="stats.revenue.total.toLocaleString()"></span></div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <div class="size-2 rounded-full bg-purple-400 animate-pulse"></div>
        <span>تحديث لحظي</span>
      </div>
    </div>
  </div>

  <div class="mt-6 p-5 bg-white rounded-xl border border-gray-200" x-data="{ 
    range: '7d',
    chart: {
      '7d': [65, 70, 68, 72, 75, 71, 69],
      '30d': [60, 65, 68, 62, 70, 75, 68],
      '90d': [55, 60, 65, 70, 68, 72, 75]
    }
  }">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h3 class="font-semibold">Production Activity</h3>
        <div class="flex items-center gap-1 text-xs">
          <span class="inline-block size-2 rounded-full bg-emerald-500"></span>
          <span class="text-gray-600">Trend</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-3 py-1 text-xs rounded border" :class="{ 'bg-gray-900 text-white': range==='7d' }" @click="range='7d'">7d</button>
        <button class="px-3 py-1 text-xs rounded border" :class="{ 'bg-gray-900 text-white': range==='30d' }" @click="range='30d'">30d</button>
        <button class="px-3 py-1 text-xs rounded border" :class="{ 'bg-gray-900 text-white': range==='90d' }" @click="range='90d'">90d</button>
      </div>
    </div>
    <div class="mt-4">
      <div class="h-[200px] flex items-end gap-2">
        <template x-for="(value, index) in chart[range]" :key="index">
          <div class="flex-1 bg-emerald-50 rounded-t" :style="{ height: value + '%' }"></div>
        </template>
      </div>
      <div class="mt-2 flex text-xs text-gray-500">
        <template x-for="(value, index) in chart[range]" :key="index">
          <div class="flex-1 text-center" x-text="index + 1"></div>
        </template>
      </div>
    </div>
  </div>

  <!-- Recent Activity & Quick Actions -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Recent Activity -->
    <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900">النشاط الأخير</h3>
        <span class="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">مباشر</span>
      </div>
      <div class="space-y-4">
        <template x-for="activity in activities" :key="activity.title">
          <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <div class="size-8 rounded-full flex items-center justify-center text-white"
                 :class="{
                   'bg-blue-500': activity.color === 'blue',
                   'bg-emerald-500': activity.color === 'emerald',
                   'bg-amber-500': activity.color === 'amber',
                   'bg-purple-500': activity.color === 'purple'
                 }">
              <svg x-show="activity.type === 'order'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
              </svg>
              <svg x-show="activity.type === 'complete'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <svg x-show="activity.type === 'production'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655-5.653a2.548 2.548 0 0 1-.1-3.528l.893-.893a2.559 2.559 0 0 1 3.528-.1l5.653 4.655M15.25 9l1.75 1.75" />
              </svg>
              <svg x-show="activity.type === 'worker'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900" x-text="activity.title"></p>
              <p class="text-xs text-gray-500" x-text="activity.time"></p>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <h3 class="font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
      <div class="space-y-3">
        <button class="w-full flex items-center gap-3 px-4 py-3 text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>طلب جديد</span>
        </button>
        
        <button class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <span>عرض التقارير</span>
        </button>
        
        <button class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
          <span>إدارة العمال</span>
        </button>
        
        <button class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          <span>الإعدادات</span>
        </button>
      </div>
    </div>
  </div>
</div>
@endsection


