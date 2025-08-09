@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
    <div class="card">
        <div class="card-header">
            <div class="flex justify-between items-center">
                <h2 class="card-title">{{ __('Custom Orders') }}</h2>
                <div class="flex gap-3">
                    <a href="{{ route('ui.workshop.custom-orders.create') }}" class="btn btn-primary">
                        {{ __('New Custom Order') }}
                    </a>
                </div>
            </div>
        </div>
        
        <div class="card-content">
            <!-- Filters -->
            <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <select class="form-select">
                    <option value="">{{ __('All Statuses') }}</option>
                    <option value="pending_quote">{{ __('Pending Quote') }}</option>
                    <option value="quoted">{{ __('Quoted') }}</option>
                    <option value="confirmed">{{ __('Confirmed') }}</option>
                    <option value="in_production">{{ __('In Production') }}</option>
                    <option value="quality_check">{{ __('Quality Check') }}</option>
                    <option value="completed">{{ __('Completed') }}</option>
                    <option value="delivered">{{ __('Delivered') }}</option>
                    <option value="cancelled">{{ __('Cancelled') }}</option>
                </select>
                
                <select class="form-select">
                    <option value="">{{ __('All Priorities') }}</option>
                    <option value="urgent">{{ __('Urgent') }}</option>
                    <option value="high">{{ __('High') }}</option>
                    <option value="normal">{{ __('Normal') }}</option>
                    <option value="low">{{ __('Low') }}</option>
                </select>
                
                <input type="date" class="form-input" placeholder="{{ __('Date From') }}">
                <input type="search" class="form-input" placeholder="{{ __('Search orders...') }}">
            </div>

            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ __('Order #') }}</th>
                            <th>{{ __('Customer') }}</th>
                            <th>{{ __('Product Type') }}</th>
                            <th>{{ __('Status') }}</th>
                            <th>{{ __('Priority') }}</th>
                            <th>{{ __('Assigned To') }}</th>
                            <th>{{ __('Due Date') }}</th>
                            <th>{{ __('Price') }}</th>
                            <th>{{ __('Actions') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($customOrders ?? [] as $order)
                        <tr>
                            <td class="font-mono">{{ $order->order_number ?? 'CO-2024-000001' }}</td>
                            <td>{{ optional($order->customer)->name ?? 'John Doe' }}</td>
                            <td>{{ $order->product_type ?? 'Custom Suit' }}</td>
                            <td>
                                <span class="badge @switch($order->status ?? 'pending_quote')
                                    @case('pending_quote') badge-yellow @break
                                    @case('quoted') badge-blue @break
                                    @case('confirmed') badge-purple @break
                                    @case('in_production') badge-amber @break
                                    @case('quality_check') badge-orange @break
                                    @case('completed') badge-green @break
                                    @case('delivered') badge-emerald @break
                                    @case('cancelled') badge-red @break
                                    @default badge-gray
                                @endswitch">
                                    {{ ucfirst(str_replace('_', ' ', $order->status ?? 'pending_quote')) }}
                                </span>
                            </td>
                            <td>
                                <span class="badge @switch($order->priority ?? 'normal')
                                    @case('urgent') badge-red @break
                                    @case('high') badge-orange @break
                                    @case('normal') badge-blue @break
                                    @case('low') badge-gray @break
                                    @default badge-blue
                                @endswitch">
                                    {{ ucfirst($order->priority ?? 'normal') }}
                                </span>
                            </td>
                            <td>{{ optional($order->assignedTo)->name ?? '-' }}</td>
                            <td>{{ optional($order->promised_delivery_date)->format('M d, Y') ?? '-' }}</td>
                            <td>{{ $order->final_price ? '$' . number_format($order->final_price, 2) : ($order->quoted_price ? '$' . number_format($order->quoted_price, 2) : '-') }}</td>
                            <td class="flex gap-2">
                                <a href="{{ route('ui.workshop.custom-orders.show', $order->id ?? 1) }}" class="btn btn-sm btn-blue">
                                    {{ __('View') }}
                                </a>
                                <a href="{{ route('ui.workshop.custom-orders.edit', $order->id ?? 1) }}" class="btn btn-sm btn-amber">
                                    {{ __('Edit') }}
                                </a>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="9" class="text-center py-8">
                                <div class="empty-state">
                                    <p>{{ __('No custom orders found') }}</p>
                                    <a href="{{ route('ui.workshop.custom-orders.create') }}" class="btn btn-primary mt-3">
                                        {{ __('Create First Order') }}
                                    </a>
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

@push('styles')
<style>
.form-select, .form-input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
</style>
@endpush
