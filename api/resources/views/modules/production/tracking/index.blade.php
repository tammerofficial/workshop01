@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
    <header class="page-header">
        <h2 class="page-title">{{ __('Production Tracking') }}</h2>
        <p class="page-description">{{ __('Track production progress and workflow stages.') }}</p>
    </header>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-title">{{ __('In Production') }}</div>
            <div class="stat-value">{{ $overview['in_production'] ?? 0 }}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">{{ __('Completed Today') }}</div>
            <div class="stat-value">{{ $overview['completed_today'] ?? 0 }}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">{{ __('Behind Schedule') }}</div>
            <div class="stat-value">{{ $overview['behind_schedule'] ?? 0 }}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">{{ __('Avg. Completion') }}</div>
            <div class="stat-value">{{ $overview['avg_completion'] ?? 0 }}%</div>
        </div>
    </div>

    <div class="card mt-6">
        <div class="card-header">
            <h3 class="card-title">{{ __('Production Orders') }}</h3>
        </div>
        <div class="card-content">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ __('Order') }}</th>
                            <th>{{ __('Client') }}</th>
                            <th>{{ __('Stage') }}</th>
                            <th>{{ __('Progress') }}</th>
                            <th>{{ __('Assigned Worker') }}</th>
                            <th>{{ __('Due Date') }}</th>
                            <th>{{ __('Status') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse(($orders ?? []) as $order)
                            <tr>
                                <td>
                                    <span class="badge badge-blue">{{ $order['order_number'] ?? 'ORD-001' }}</span>
                                </td>
                                <td>{{ $order['client_name'] ?? __('Unknown Client') }}</td>
                                <td>{{ $order['current_stage'] ?? __('Not Started') }}</td>
                                <td>
                                    <div class="flex items-center">
                                        <div class="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                                            <div class="bg-blue-500 h-2 rounded-full" style="width: {{ $order['progress'] ?? 0 }}%"></div>
                                        </div>
                                        <span class="text-sm font-medium">{{ $order['progress'] ?? 0 }}%</span>
                                    </div>
                                </td>
                                <td>{{ $order['assigned_worker'] ?? '-' }}</td>
                                <td>{{ $order['due_date'] ?? '-' }}</td>
                                <td>
                                    <span class="badge @if(($order['status'] ?? 'pending') === 'in_progress') badge-blue @elseif($order['status'] === 'completed') badge-green @elseif($order['status'] === 'delayed') badge-red @else badge-gray @endif">
                                        {{ ucfirst($order['status'] ?? 'pending') }}
                                    </span>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center py-8">
                                    <div class="empty-state">
                                        <div class="empty-state-icon">🏭</div>
                                        <h3 class="empty-state-title">{{ __('No Production Orders') }}</h3>
                                        <p class="empty-state-text">{{ __('Production orders will appear here.') }}</p>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection
