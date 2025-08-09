<aside class="sidebar">
  <nav class="sidebar-nav">
    <a href="{{ route('ui.dashboard') }}" class="sidebar-link {{ request()->routeIs('ui.dashboard') ? 'sidebar-active' : '' }}">{{ __('Dashboard') }}</a>
    <a href="{{ route('ui.orders') }}" class="sidebar-link {{ request()->routeIs('ui.orders*') ? 'sidebar-active' : '' }}">{{ __('Orders') }}</a>
    <a href="{{ route('ui.workshop.custom-orders.index') }}" class="sidebar-link {{ request()->routeIs('ui.workshop*') ? 'sidebar-active' : '' }}">{{ __('Custom Orders') }}</a>
    <a href="{{ route('ui.workers.index') }}" class="sidebar-link {{ request()->routeIs('ui.workers*') ? 'sidebar-active' : '' }}">{{ __('Workers') }}</a>
    <a href="{{ route('ui.inventory') }}" class="sidebar-link {{ request()->routeIs('ui.inventory*') ? 'sidebar-active' : '' }}">{{ __('Inventory') }}</a>
    <a href="{{ route('ui.reports') }}" class="sidebar-link {{ request()->routeIs('ui.reports') ? 'sidebar-active' : '' }}">{{ __('Reports') }}</a>
    <div class="sidebar-sep"></div>
    <a href="{{ route('ui.payroll.index') }}" class="sidebar-link {{ request()->routeIs('ui.payroll*') ? 'sidebar-active' : '' }}">{{ __('Payroll') }}</a>
    <a href="{{ route('ui.biometrics.index') }}" class="sidebar-link {{ request()->routeIs('ui.biometrics*') ? 'sidebar-active' : '' }}">{{ __('Biometrics') }}</a>
  </nav>
</aside>
