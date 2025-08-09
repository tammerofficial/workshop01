@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
    <header class="page-header">
        <h2 class="page-title">{{ __('Management Dashboard') }}</h2>
        <p class="page-description">{{ __('Executive overview of workshop operations and performance.') }}</p>
    </header>

    <!-- Executive KPIs -->
    <div class="stats-grid">
        <div class="stat-card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div class="stat-title opacity-90">{{ __('Total Revenue') }}</div>
            <div class="stat-value">${{ number_format($kpis['total_revenue'] ?? 0, 2) }}</div>
            <div class="stat-change">{{ $kpis['revenue_growth'] ?? 0 }}% {{ __('vs last month') }}</div>
        </div>
        <div class="stat-card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div class="stat-title opacity-90">{{ __('Orders Completed') }}</div>
            <div class="stat-value">{{ number_format($kpis['completed_orders'] ?? 0) }}</div>
            <div class="stat-change">{{ $kpis['completion_rate'] ?? 0 }}% {{ __('completion rate') }}</div>
        </div>
        <div class="stat-card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div class="stat-title opacity-90">{{ __('Active Workers') }}</div>
            <div class="stat-value">{{ $kpis['active_workers'] ?? 0 }}</div>
            <div class="stat-change">{{ $kpis['productivity'] ?? 0 }}% {{ __('productivity') }}</div>
        </div>
        <div class="stat-card bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <div class="stat-title opacity-90">{{ __('Customer Satisfaction') }}</div>
            <div class="stat-value">{{ $kpis['satisfaction_rate'] ?? 0 }}%</div>
            <div class="stat-change">{{ $kpis['satisfaction_trend'] ?? 0 }}% {{ __('trend') }}</div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <!-- Performance Chart -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">{{ __('Performance Trends') }}</h3>
                <select class="form-select text-sm">
                    <option>{{ __('Last 12 months') }}</option>
                    <option>{{ __('Last 6 months') }}</option>
                    <option>{{ __('Last 3 months') }}</option>
                </select>
            </div>
            <div class="card-content">
                <div class="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded">
                    <div class="text-center">
                        <div class="text-4xl mb-2">📊</div>
                        <p class="text-gray-700 font-medium">{{ __('Performance Analytics Chart') }}</p>
                        <p class="text-sm text-gray-500">{{ __('Revenue, Orders, Efficiency trends') }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Top Issues -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">{{ __('Priority Issues') }}</h3>
                <button class="btn btn-sm btn-blue">{{ __('View All') }}</button>
            </div>
            <div class="card-content">
                <div class="space-y-3">
                    @forelse(($priority_issues ?? []) as $issue)
                        <div class="p-3 border-l-4 @if(($issue['priority'] ?? 'medium') === 'high') border-l-red-500 bg-red-50 @elseif($issue['priority'] === 'medium') border-l-amber-500 bg-amber-50 @else border-l-blue-500 bg-blue-50 @endif rounded">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-medium">{{ $issue['title'] ?? __('Issue Title') }}</h4>
                                    <p class="text-sm text-gray-600">{{ $issue['description'] ?? __('Issue description') }}</p>
                                    <p class="text-xs text-gray-500 mt-1">{{ $issue['department'] ?? __('General') }} • {{ $issue['created_at'] ?? now()->format('M d, Y') }}</p>
                                </div>
                                <span class="badge @if(($issue['priority'] ?? 'medium') === 'high') badge-red @elseif($issue['priority'] === 'medium') badge-amber @else badge-blue @endif">
                                    {{ ucfirst($issue['priority'] ?? 'medium') }}
                                </span>
                            </div>
                        </div>
                    @empty
                        <div class="empty-state">
                            <div class="empty-state-icon">✅</div>
                            <h4 class="empty-state-title">{{ __('No Priority Issues') }}</h4>
                            <p class="empty-state-text">{{ __('All systems operating normally.') }}</p>
                        </div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>

    <!-- Department Performance -->
    <div class="card mt-6">
        <div class="card-header">
            <h3 class="card-title">{{ __('Department Performance') }}</h3>
        </div>
        <div class="card-content">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                @foreach(($departments ?? []) as $dept)
                    <div class="p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="font-semibold">{{ $dept['name'] ?? __('Department') }}</h4>
                            <span class="text-2xl">{{ $dept['icon'] ?? '🏢' }}</span>
                        </div>
                        <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                                <span>{{ __('Efficiency') }}</span>
                                <span class="font-medium">{{ $dept['efficiency'] ?? 0 }}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full" style="width: {{ $dept['efficiency'] ?? 0 }}%"></div>
                            </div>
                            <div class="flex justify-between text-xs text-gray-600">
                                <span>{{ __('Workers') }}: {{ $dept['workers'] ?? 0 }}</span>
                                <span>{{ __('Tasks') }}: {{ $dept['active_tasks'] ?? 0 }}</span>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <a href="{{ route('ui.reports.analytics') }}" class="btn btn-blue btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">📈</span>
            <span>{{ __('Analytics') }}</span>
        </a>
        <a href="{{ route('ui.management.performance') }}" class="btn btn-green btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">⚡</span>
            <span>{{ __('Performance') }}</span>
        </a>
        <a href="{{ route('ui.management.planning') }}" class="btn btn-purple btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">📋</span>
            <span>{{ __('Planning') }}</span>
        </a>
        <a href="{{ route('ui.management.costs') }}" class="btn btn-amber btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">💰</span>
            <span>{{ __('Cost Analysis') }}</span>
        </a>
    </div>
</div>
@endsection
