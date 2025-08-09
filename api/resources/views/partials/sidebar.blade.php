<div class="flex flex-col h-full bg-gradient-to-b from-white to-gray-50/50">
  <!-- Header -->
  <div class="h-16 flex items-center px-4 border-b border-gray-200/70 bg-white/80 backdrop-blur-sm">
    <a href="{{ route('ui.dashboard') }}" class="flex items-center gap-3 text-lg font-bold text-gray-800 hover:text-gray-900 transition-colors duration-200">
      <div class="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
        </svg>
      </div>
      <span class="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">ورشة العمل</span>
    </a>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 p-3 space-y-1">
    <!-- Dashboard -->
    <a href="{{ route('ui.dashboard') }}" 
       class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out {{ request()->routeIs('ui.dashboard') ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' }}">
      <div class="p-1 rounded-lg transition-colors duration-200 {{ request()->routeIs('ui.dashboard') ? 'bg-blue-100' : 'group-hover:bg-gray-100' }}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      </div>
      <span>لوحة التحكم</span>
    </a>

    <!-- Orders -->
    <a href="{{ route('ui.orders') }}" 
       class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out {{ request()->routeIs('ui.orders') ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' }}">
      <div class="p-1 rounded-lg transition-colors duration-200 {{ request()->routeIs('ui.orders') ? 'bg-blue-100' : 'group-hover:bg-gray-100' }}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75m0-2.25h3m-3 0h3m-3 0h.375c.621 0 1.125-.504 1.125-1.125v-9.25m-.375 3.75h.375m-.375 3.75h.375m1.125-3.75h.375m-.375 3.75h.375M9 12h.008v.008H9V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      </div>
      <span>الطلبات</span>
      <span class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 border border-red-200">8</span>
    </a>

    <!-- Inventory -->
    <a href="{{ route('ui.inventory') }}" 
       class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out {{ request()->routeIs('ui.inventory') ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' }}">
      <div class="p-1 rounded-lg transition-colors duration-200 {{ request()->routeIs('ui.inventory') ? 'bg-blue-100' : 'group-hover:bg-gray-100' }}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
        </svg>
      </div>
      <span>المخزون</span>
    </a>

    <!-- Reports -->
    <a href="{{ route('ui.reports') }}" 
       class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out {{ request()->routeIs('ui.reports') ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' }}">
      <div class="p-1 rounded-lg transition-colors duration-200 {{ request()->routeIs('ui.reports') ? 'bg-blue-100' : 'group-hover:bg-gray-100' }}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      </div>
      <span>التقارير</span>
    </a>

    <!-- Divider -->
    <div class="border-t border-gray-200 my-4"></div>

    <!-- Quick Actions -->
    <div class="space-y-1">
      <p class="text-xs font-medium text-gray-500 px-3 mb-2">إجراءات سريعة</p>
      
      <button class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
        <div class="p-1 rounded-lg group-hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <span>طلب جديد</span>
      </button>

      <button class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
        <div class="p-1 rounded-lg group-hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <span>إعدادات النظام</span>
      </button>
    </div>
  </nav>

  <!-- Footer -->
  <div class="p-3 border-t border-gray-200/70 bg-white/50">
    <div class="flex items-center justify-between text-xs">
      <span class="text-gray-500">© {{ date('Y') }} ورشة العمل</span>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">Blade UI</span>
        <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
      </div>
    </div>
  </div>
</div>