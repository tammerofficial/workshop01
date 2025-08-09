@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
    <header class="page-header">
        <h2 class="page-title">{{ __('System Monitoring') }}</h2>
        <p class="page-description">{{ __('Real-time system health and performance monitoring.') }}</p>
    </header>

    <!-- System Health Status -->
    <div class="stats-grid">
        <div class="stat-card @if(($system_health['overall_status'] ?? 'warning') === 'healthy') bg-green-50 border-green-200 @elseif($system_health['overall_status'] === 'warning') bg-amber-50 border-amber-200 @else bg-red-50 border-red-200 @endif">
            <div class="stat-title">{{ __('System Status') }}</div>
            <div class="stat-value @if(($system_health['overall_status'] ?? 'warning') === 'healthy') text-green-600 @elseif($system_health['overall_status'] === 'warning') text-amber-600 @else text-red-600 @endif">
                {{ ucfirst($system_health['overall_status'] ?? 'Warning') }}
            </div>
            <div class="stat-change">{{ __('Last check') }}: {{ $system_health['last_check'] ?? now()->format('H:i:s') }}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">{{ __('CPU Usage') }}</div>
            <div class="stat-value">{{ $performance['cpu_usage'] ?? 0 }}%</div>
            <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="bg-blue-500 h-2 rounded-full" style="width: {{ $performance['cpu_usage'] ?? 0 }}%"></div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-title">{{ __('Memory Usage') }}</div>
            <div class="stat-value">{{ $performance['memory_usage'] ?? 0 }}%</div>
            <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="bg-green-500 h-2 rounded-full" style="width: {{ $performance['memory_usage'] ?? 0 }}%"></div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-title">{{ __('Active Users') }}</div>
            <div class="stat-value">{{ $performance['active_users'] ?? 0 }}</div>
            <div class="stat-change">{{ $performance['peak_users'] ?? 0 }} {{ __('peak today') }}</div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <!-- Server Performance -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">{{ __('Server Performance') }}</h3>
                <button class="btn btn-sm btn-blue">{{ __('Refresh') }}</button>
            </div>
            <div class="card-content">
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                            <p class="font-medium">{{ __('Response Time') }}</p>
                            <p class="text-sm text-gray-600">{{ __('Average API response') }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-semibold">{{ $performance['response_time'] ?? 0 }}ms</p>
                            <span class="badge @if(($performance['response_time'] ?? 500) < 200) badge-green @elseif($performance['response_time'] < 500) badge-amber @else badge-red @endif">
                                @if($performance['response_time'] < 200) {{ __('Excellent') }} @elseif($performance['response_time'] < 500) {{ __('Good') }} @else {{ __('Slow') }} @endif
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                            <p class="font-medium">{{ __('Database Queries') }}</p>
                            <p class="text-sm text-gray-600">{{ __('Average per request') }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-semibold">{{ $performance['avg_queries'] ?? 0 }}</p>
                            <span class="badge @if(($performance['avg_queries'] ?? 10) < 5) badge-green @elseif($performance['avg_queries'] < 15) badge-amber @else badge-red @endif">
                                @if($performance['avg_queries'] < 5) {{ __('Optimized') }} @elseif($performance['avg_queries'] < 15) {{ __('Normal') }} @else {{ __('High') }} @endif
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                            <p class="font-medium">{{ __('Error Rate') }}</p>
                            <p class="text-sm text-gray-600">{{ __('Last 24 hours') }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-semibold">{{ $performance['error_rate'] ?? 0 }}%</p>
                            <span class="badge @if(($performance['error_rate'] ?? 0) == 0) badge-green @elseif($performance['error_rate'] < 1) badge-amber @else badge-red @endif">
                                @if($performance['error_rate'] == 0) {{ __('None') }} @elseif($performance['error_rate'] < 1) {{ __('Low') }} @else {{ __('High') }} @endif
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Service Status -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">{{ __('Service Status') }}</h3>
            </div>
            <div class="card-content">
                <div class="space-y-3">
                    @foreach(($services ?? []) as $service)
                        <div class="flex items-center justify-between p-3 border rounded">
                            <div class="flex items-center">
                                <div class="w-3 h-3 rounded-full mr-3 @if(($service['status'] ?? 'down') === 'running') bg-green-500 @elseif($service['status'] === 'warning') bg-amber-500 @else bg-red-500 @endif"></div>
                                <div>
                                    <p class="font-medium">{{ $service['name'] ?? __('Service') }}</p>
                                    <p class="text-sm text-gray-600">{{ $service['description'] ?? __('Service description') }}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="badge @if(($service['status'] ?? 'down') === 'running') badge-green @elseif($service['status'] === 'warning') badge-amber @else badge-red @endif">
                                    {{ ucfirst($service['status'] ?? 'down') }}
                                </span>
                                <p class="text-xs text-gray-500 mt-1">{{ $service['uptime'] ?? '0%' }} {{ __('uptime') }}</p>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Alerts -->
    <div class="card mt-6">
        <div class="card-header">
            <h3 class="card-title">{{ __('Recent Alerts') }}</h3>
            <a href="{{ route('ui.system.errors') }}" class="btn btn-sm btn-blue">{{ __('View All') }}</a>
        </div>
        <div class="card-content">
            <div class="space-y-3">
                @forelse(($recent_alerts ?? []) as $alert)
                    <div class="p-3 border-l-4 @if(($alert['severity'] ?? 'info') === 'critical') border-l-red-500 bg-red-50 @elseif($alert['severity'] === 'warning') border-l-amber-500 bg-amber-50 @else border-l-blue-500 bg-blue-50 @endif rounded">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="font-medium">{{ $alert['title'] ?? __('Alert Title') }}</h4>
                                <p class="text-sm text-gray-600">{{ $alert['message'] ?? __('Alert message') }}</p>
                                <p class="text-xs text-gray-500 mt-1">{{ $alert['source'] ?? __('System') }} • {{ $alert['timestamp'] ?? now()->format('M d, Y H:i') }}</p>
                            </div>
                            <span class="badge @if(($alert['severity'] ?? 'info') === 'critical') badge-red @elseif($alert['severity'] === 'warning') badge-amber @else badge-blue @endif">
                                {{ ucfirst($alert['severity'] ?? 'info') }}
                            </span>
                        </div>
                    </div>
                @empty
                    <div class="empty-state">
                        <div class="empty-state-icon">🔔</div>
                        <h4 class="empty-state-title">{{ __('No Recent Alerts') }}</h4>
                        <p class="empty-state-text">{{ __('System is running smoothly.') }}</p>
                    </div>
                @endforelse
            </div>
        </div>
    </div>

    <!-- System Actions -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <button class="btn btn-blue btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">🔄</span>
            <span>{{ __('Restart Services') }}</span>
        </button>
        <button class="btn btn-green btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">🧹</span>
            <span>{{ __('Clear Cache') }}</span>
        </button>
        <button class="btn btn-amber btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">💾</span>
            <span>{{ __('Backup Now') }}</span>
        </button>
        <button class="btn btn-purple btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">📊</span>
            <span>{{ __('Performance Report') }}</span>
        </button>
    </div>
</div>
@endsection
