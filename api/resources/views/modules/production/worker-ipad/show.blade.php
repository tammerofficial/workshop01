@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
    <header class="page-header">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="page-title">{{ $worker['name'] ?? __('Worker Interface') }}</h2>
                <p class="page-description">{{ __('iPad interface for') }} {{ $worker['specialty'] ?? __('worker') }}</p>
            </div>
            <div class="flex items-center gap-4">
                <span class="badge @if(($worker['status'] ?? 'idle') === 'working') badge-green @elseif($worker['status'] === 'break') badge-amber @else badge-gray @endif text-lg px-4 py-2">
                    {{ ucfirst($worker['status'] ?? 'idle') }}
                </span>
                <button class="btn btn-blue btn-lg">{{ __('Clock In/Out') }}</button>
            </div>
        </div>
    </header>

    <!-- Current Task -->
    @if(!empty($worker['current_task']))
    <div class="card mb-6 border-l-4 border-l-blue-500">
        <div class="card-header">
            <h3 class="card-title text-blue-700">{{ __('Current Task') }}</h3>
        </div>
        <div class="card-content">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ __('Order Number') }}</label>
                    <p class="text-lg font-semibold">{{ $worker['current_task']['order_number'] ?? '-' }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ __('Task') }}</label>
                    <p class="text-lg">{{ $worker['current_task']['task_name'] ?? '-' }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ __('Progress') }}</label>
                    <div class="flex items-center">
                        <div class="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                            <div class="bg-blue-500 h-3 rounded-full" style="width: {{ $worker['current_task']['progress'] ?? 0 }}%"></div>
                        </div>
                        <span class="text-sm font-medium">{{ $worker['current_task']['progress'] ?? 0 }}%</span>
                    </div>
                </div>
            </div>
            <div class="mt-6 flex justify-center gap-4">
                <button class="btn btn-green btn-lg px-8">{{ __('Mark Complete') }}</button>
                <button class="btn btn-amber btn-lg px-8">{{ __('Report Issue') }}</button>
                <button class="btn btn-gray btn-lg px-8">{{ __('Take Break') }}</button>
            </div>
        </div>
    </div>
    @endif

    <!-- Today's Tasks -->
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">{{ __('Today\'s Tasks') }}</h3>
        </div>
        <div class="card-content">
            <div class="space-y-4">
                @forelse(($worker['tasks'] ?? []) as $task)
                    <div class="p-4 border rounded-lg @if($task['status'] === 'completed') bg-green-50 border-green-200 @elseif($task['status'] === 'in_progress') bg-blue-50 border-blue-200 @else bg-gray-50 border-gray-200 @endif">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="font-semibold">{{ $task['task_name'] ?? __('Unknown Task') }}</h4>
                                <p class="text-sm text-gray-600">{{ __('Order') }}: {{ $task['order_number'] ?? '-' }}</p>
                                <p class="text-xs text-gray-500">{{ __('Estimated time') }}: {{ $task['estimated_time'] ?? '-' }}</p>
                            </div>
                            <div class="text-right">
                                <span class="badge @if($task['status'] === 'completed') badge-green @elseif($task['status'] === 'in_progress') badge-blue @else badge-gray @endif">
                                    {{ ucfirst($task['status'] ?? 'pending') }}
                                </span>
                                @if($task['status'] === 'pending')
                                    <button class="btn btn-sm btn-blue mt-2">{{ __('Start') }}</button>
                                @endif
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="empty-state">
                        <div class="empty-state-icon">✅</div>
                        <h3 class="empty-state-title">{{ __('No Tasks Today') }}</h3>
                        <p class="empty-state-text">{{ __('All tasks completed or no tasks assigned.') }}</p>
                    </div>
                @endforelse
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <button class="btn btn-blue btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">📊</span>
            <span>{{ __('View Stats') }}</span>
        </button>
        <button class="btn btn-green btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">✅</span>
            <span>{{ __('Quality Check') }}</span>
        </button>
        <button class="btn btn-amber btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">⚠️</span>
            <span>{{ __('Report Issue') }}</span>
        </button>
        <button class="btn btn-gray btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">☕</span>
            <span>{{ __('Break Time') }}</span>
        </button>
    </div>
</div>
@endsection
