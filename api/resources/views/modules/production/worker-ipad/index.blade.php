@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
    <header class="page-header">
        <h2 class="page-title">{{ __('Worker iPad Interface') }}</h2>
        <p class="page-description">{{ __('Simplified interface for workers using iPad devices.') }}</p>
    </header>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-title">{{ __('Active Workers') }}</div>
            <div class="stat-value">{{ $overview['active_workers'] ?? 0 }}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">{{ __('Today Tasks') }}</div>
            <div class="stat-value">{{ $overview['today_tasks'] ?? 0 }}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">{{ __('Completed') }}</div>
            <div class="stat-value">{{ $overview['completed_tasks'] ?? 0 }}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">{{ __('Pending') }}</div>
            <div class="stat-value">{{ $overview['pending_tasks'] ?? 0 }}</div>
        </div>
    </div>

    <div class="card mt-6">
        <div class="card-header">
            <h3 class="card-title">{{ __('Worker Stations') }}</h3>
        </div>
        <div class="card-content">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @forelse(($workers ?? []) as $worker)
                    <a href="{{ route('ui.production.worker-ipad.show', $worker['id'] ?? 1) }}" class="block">
                        <div class="p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="text-lg font-semibold text-gray-900">{{ $worker['name'] ?? __('Unknown Worker') }}</h4>
                                    <p class="text-sm text-gray-600">{{ $worker['specialty'] ?? __('General') }}</p>
                                    <p class="text-xs text-gray-500 mt-1">{{ __('Station') }}: {{ $worker['station'] ?? '-' }}</p>
                                </div>
                                <div class="text-right">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium @if(($worker['status'] ?? 'idle') === 'working') bg-green-100 text-green-800 @elseif($worker['status'] === 'break') bg-yellow-100 text-yellow-800 @else bg-gray-100 text-gray-800 @endif">
                                        {{ ucfirst($worker['status'] ?? 'idle') }}
                                    </span>
                                    <p class="text-sm text-gray-600 mt-1">{{ $worker['current_task'] ?? __('No task') }}</p>
                                </div>
                            </div>
                        </div>
                    </a>
                @empty
                    <div class="col-span-full">
                        <div class="empty-state">
                            <div class="empty-state-icon">👷</div>
                            <h3 class="empty-state-title">{{ __('No Workers Available') }}</h3>
                            <p class="empty-state-text">{{ __('Add workers to see their iPad interfaces.') }}</p>
                        </div>
                    </div>
                @endforelse
            </div>
        </div>
    </div>
</div>
@endsection
