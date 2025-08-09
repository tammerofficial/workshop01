@extends('layouts.app')

@section('title', __('Dashboard'))

@section('content')
<div dir="ltr" class="ltr">
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-header">
      <div class="stat-title">{{ __('Total Orders') }}</div>
      <span class="stat-badge badge-info">+12%</span>
    </div>
    <div class="stat-value">{{ number_format($stats['total_orders'] ?? 0) }}</div>
    <div class="stat-indicator"><div class="stat-dot" style="background:#3b82f6"></div><span>{{ __('Live updates') }}</span></div>
  </div>
  <div class="stat-card">
    <div class="stat-header">
      <div class="stat-title">{{ __('In Production') }}</div>
      <span class="stat-badge badge-warning">+5%</span>
    </div>
    <div class="stat-value">{{ number_format($stats['in_production'] ?? 0) }}</div>
    <div class="stat-indicator"><div class="stat-dot" style="background:#f59e0b"></div><span>{{ __('Live tracking') }}</span></div>
  </div>
  <div class="stat-card">
    <div class="stat-header">
      <div class="stat-title">{{ __('Completed') }}</div>
      <span class="stat-badge badge-success">+8%</span>
    </div>
    <div class="stat-value">{{ number_format($stats['completed'] ?? 0) }}</div>
    <div class="stat-indicator"><div class="stat-dot" style="background:#10b981"></div><span>{{ __('Real-time data') }}</span></div>
  </div>
  <div class="stat-card">
    <div class="stat-header">
      <div class="stat-title">{{ __('Revenue') }}</div>
      <span class="stat-badge" style="background:rgba(168,85,247,.1);color:#7c3aed;border-color:rgba(168,85,247,.2)">+15%</span>
    </div>
    <div class="stat-value">${{ number_format($stats['revenue'] ?? 0) }}</div>
    <div class="stat-indicator"><div class="stat-dot" style="background:#8b5cf6"></div><span>{{ __('Instant updates') }}</span></div>
  </div>
 </div>

<!-- Quick Actions -->
<div class="card mb-6">
  <div class="card-header">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-gray-900">{{ __('Quick Actions') }}</h3>
    </div>
  </div>
  <div class="card-content">
    <div class="flex flex-wrap gap-4">
      <a href="{{ route('ui.orders.create') }}" class="btn btn-primary">{{ __('New Order') }}</a>
      <a href="{{ route('ui.workers.create') }}" class="btn btn-primary">{{ __('Add Worker') }}</a>
      <a href="{{ route('ui.inventory.create') }}" class="btn btn-primary">{{ __('Add Item') }}</a>
    </div>
  </div>
 </div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <div class="card">
        <div class="card-header">
            <h3 class="font-semibold text-gray-900">{{ __('Orders Overview') }}</h3>
        </div>
        <div class="card-content">
            <div class="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded">
                <div class="text-center">
                    <div class="text-4xl mb-2">📈</div>
                    <p class="text-gray-700 font-medium">{{ __('Orders Analytics Chart') }}</p>
                    <p class="text-sm text-gray-500">{{ __('Chart.js integration pending') }}</p>
                </div>
            </div>
        </div>
    </div>
    <div class="card">
        <div class="card-header">
            <h3 class="font-semibold text-gray-900">{{ __('Revenue Overview') }}</h3>
        </div>
        <div class="card-content">
             <div class="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded">
                <div class="text-center">
                    <div class="text-4xl mb-2">💰</div>
                    <p class="text-gray-700 font-medium">{{ __('Revenue Analytics Chart') }}</p>
                    <p class="text-sm text-gray-500">{{ __('Chart.js integration pending') }}</p>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="card">
  <div class="card-header">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-gray-900">{{ __('Recent Orders') }}</h3>
      <span class="badge badge-info">{{ __('Live') }}</span>
    </div>
  </div>
  <div class="card-content">
    @forelse(($recentOrders ?? []) as $order)
    <div class="activity-item">
      <div class="activity-icon {{ $order->status === 'completed' ? 'bg-emerald-500' : ($order->status === 'in_progress' ? 'bg-amber-500' : 'bg-blue-500') }}">📦</div>
      <div class="activity-content">
        <div class="activity-title">{{ __('Order') }} #{{ $order->id }} - {{ $order->client->name ?? __('No Client') }}</div>
        <div class="activity-time">{{ optional($order->created_at)->diffForHumans() }}</div>
      </div>
    </div>
    @empty
    <div class="empty-state">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2"/></svg>
      <p>{{ __('No recent orders found') }}</p>
    </div>
    @endforelse
  </div>
 </div>
</div>
@endsection