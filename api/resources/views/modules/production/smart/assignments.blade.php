@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
    <header class="page-header">
        <h2 class="page-title">{{ __('Production Assignments') }}</h2>
        <p class="page-description">{{ __('Manage worker assignments to production stations and orders.') }}</p>
    </header>

    <div class="card">
        <div class="card-header">
            <div class="flex items-center justify-between">
                <h3 class="card-title">{{ __('Current Assignments') }}</h3>
                <button class="btn btn-blue">{{ __('New Assignment') }}</button>
            </div>
        </div>
        <div class="card-content">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ __('Worker') }}</th>
                            <th>{{ __('Station') }}</th>
                            <th>{{ __('Order') }}</th>
                            <th>{{ __('Start Time') }}</th>
                            <th>{{ __('Estimated End') }}</th>
                            <th>{{ __('Status') }}</th>
                            <th>{{ __('Actions') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse(($assignments ?? []) as $assignment)
                            <tr>
                                <td>
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                            {{ substr($assignment['worker_name'] ?? 'W', 0, 1) }}
                                        </div>
                                        {{ $assignment['worker_name'] ?? __('Unknown Worker') }}
                                    </div>
                                </td>
                                <td>{{ $assignment['station_name'] ?? '-' }}</td>
                                <td>
                                    <span class="badge badge-blue">
                                        {{ $assignment['order_number'] ?? '-' }}
                                    </span>
                                </td>
                                <td>{{ $assignment['start_time'] ?? '-' }}</td>
                                <td>{{ $assignment['estimated_end'] ?? '-' }}</td>
                                <td>
                                    <span class="badge @if(($assignment['status'] ?? 'pending') === 'active') badge-green @elseif($assignment['status'] === 'completed') badge-gray @else badge-amber @endif">
                                        {{ ucfirst($assignment['status'] ?? 'pending') }}
                                    </span>
                                </td>
                                <td>
                                    <div class="flex items-center gap-2">
                                        <button class="btn btn-sm btn-blue">{{ __('Edit') }}</button>
                                        <button class="btn btn-sm btn-red">{{ __('End') }}</button>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center py-8">
                                    <div class="empty-state">
                                        <div class="empty-state-icon">📋</div>
                                        <h3 class="empty-state-title">{{ __('No Active Assignments') }}</h3>
                                        <p class="empty-state-text">{{ __('Start by creating new production assignments.') }}</p>
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
