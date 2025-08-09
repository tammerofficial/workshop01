@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
    <header class="page-header">
        <h2 class="page-title">{{ __('Loyalty Reports') }}</h2>
        <p class="page-description">{{ __('Comprehensive analytics for the loyalty program performance.') }}</p>
    </header>

    <!-- KPI Cards -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-title">{{ __('Total Members') }}</div>
            <div class="stat-value">{{ number_format($overview['total_members'] ?? 0) }}</div>
            <div class="stat-change positive">+{{ $overview['new_members_this_month'] ?? 0 }} {{ __('this month') }}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">{{ __('Active Members') }}</div>
            <div class="stat-value">{{ number_format($overview['active_members'] ?? 0) }}</div>
            <div class="stat-change">{{ $overview['activity_rate'] ?? 0 }}% {{ __('activity rate') }}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">{{ __('Points Earned') }}</div>
            <div class="stat-value">{{ number_format($overview['total_points_earned'] ?? 0) }}</div>
            <div class="stat-change positive">+{{ number_format($overview['points_this_month'] ?? 0) }} {{ __('this month') }}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">{{ __('Points Redeemed') }}</div>
            <div class="stat-value">{{ number_format($overview['total_points_redeemed'] ?? 0) }}</div>
            <div class="stat-change">{{ $overview['redemption_rate'] ?? 0 }}% {{ __('redemption rate') }}</div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <!-- Member Growth Chart -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">{{ __('Member Growth') }}</h3>
                <select class="form-select text-sm">
                    <option>{{ __('Last 12 months') }}</option>
                    <option>{{ __('Last 6 months') }}</option>
                    <option>{{ __('Last 3 months') }}</option>
                </select>
            </div>
            <div class="card-content">
                <div class="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <div class="text-center">
                        <div class="text-4xl mb-2">📈</div>
                        <p class="text-gray-600">{{ __('Member growth chart would appear here') }}</p>
                        <p class="text-sm text-gray-500">{{ __('Chart.js integration needed') }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Points Activity -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">{{ __('Points Activity') }}</h3>
                <select class="form-select text-sm">
                    <option>{{ __('This month') }}</option>
                    <option>{{ __('Last month') }}</option>
                    <option>{{ __('Last 3 months') }}</option>
                </select>
            </div>
            <div class="card-content">
                <div class="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <div class="text-center">
                        <div class="text-4xl mb-2">⭐</div>
                        <p class="text-gray-600">{{ __('Points activity chart would appear here') }}</p>
                        <p class="text-sm text-gray-500">{{ __('Earned vs Redeemed comparison') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Top Performers -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">{{ __('Top Members by Points') }}</h3>
            </div>
            <div class="card-content">
                <div class="space-y-3">
                    @forelse(($top_members ?? []) as $index => $member)
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                    {{ $index + 1 }}
                                </div>
                                <div>
                                    <p class="font-medium">{{ $member['name'] ?? __('Unknown Member') }}</p>
                                    <p class="text-sm text-gray-600">{{ $member['tier'] ?? __('Regular') }} {{ __('Member') }}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="font-semibold text-blue-600">{{ number_format($member['points'] ?? 0) }}</p>
                                <p class="text-xs text-gray-500">{{ __('points') }}</p>
                            </div>
                        </div>
                    @empty
                        <div class="empty-state">
                            <div class="empty-state-icon">🏆</div>
                            <h4 class="empty-state-title">{{ __('No Top Members') }}</h4>
                            <p class="empty-state-text">{{ __('Member activity data will appear here.') }}</p>
                        </div>
                    @endforelse
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">{{ __('Recent Transactions') }}</h3>
            </div>
            <div class="card-content">
                <div class="space-y-3">
                    @forelse(($recent_transactions ?? []) as $transaction)
                        <div class="flex items-center justify-between p-3 border-l-4 @if(($transaction['type'] ?? 'earned') === 'earned') border-l-green-500 bg-green-50 @else border-l-red-500 bg-red-50 @endif rounded">
                            <div>
                                <p class="font-medium">{{ $transaction['member_name'] ?? __('Unknown Member') }}</p>
                                <p class="text-sm text-gray-600">{{ $transaction['description'] ?? __('Transaction') }}</p>
                                <p class="text-xs text-gray-500">{{ $transaction['date'] ?? now()->format('Y-m-d H:i') }}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-semibold @if(($transaction['type'] ?? 'earned') === 'earned') text-green-600 @else text-red-600 @endif">
                                    @if($transaction['type'] === 'earned') + @else - @endif{{ number_format($transaction['points'] ?? 0) }}
                                </p>
                                <p class="text-xs text-gray-500">{{ __('points') }}</p>
                            </div>
                        </div>
                    @empty
                        <div class="empty-state">
                            <div class="empty-state-icon">💳</div>
                            <h4 class="empty-state-title">{{ __('No Recent Transactions') }}</h4>
                            <p class="empty-state-text">{{ __('Transaction history will appear here.') }}</p>
                        </div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>

    <!-- Export Options -->
    <div class="card mt-6">
        <div class="card-header">
            <h3 class="card-title">{{ __('Export Reports') }}</h3>
        </div>
        <div class="card-content">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button class="btn btn-blue">
                    <span class="mr-2">📊</span>
                    {{ __('Member Report') }}
                </button>
                <button class="btn btn-green">
                    <span class="mr-2">⭐</span>
                    {{ __('Points Report') }}
                </button>
                <button class="btn btn-purple">
                    <span class="mr-2">💳</span>
                    {{ __('Transaction Report') }}
                </button>
                <button class="btn btn-gray">
                    <span class="mr-2">📈</span>
                    {{ __('Analytics Report') }}
                </button>
            </div>
        </div>
    </div>
</div>
@endsection
