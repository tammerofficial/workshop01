@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
    <div class="space-y-6">
        <!-- Header -->
        <div class="card">
            <div class="card-header">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="card-title">{{ __('Custom Order Details') }}</h2>
                        <p class="text-gray-600">{{ $customOrder->order_number ?? 'CO-2024-000001' }}</p>
                    </div>
                    <div class="flex gap-3">
                        <a href="{{ route('ui.workshop.custom-orders.edit', $customOrder->id ?? 1) }}" class="btn btn-amber">
                            {{ __('Edit Order') }}
                        </a>
                        <a href="{{ route('ui.workshop.custom-orders.index') }}" class="btn btn-secondary">
                            {{ __('Back to List') }}
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Details -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Customer & Order Info -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">{{ __('Order Information') }}</h3>
                    </div>
                    <div class="card-content">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="detail-label">{{ __('Customer') }}</label>
                                <p class="detail-value">{{ optional($customOrder->customer)->name ?? 'John Doe' }}</p>
                            </div>
                            <div>
                                <label class="detail-label">{{ __('Email') }}</label>
                                <p class="detail-value">{{ optional($customOrder->customer)->email ?? 'john@example.com' }}</p>
                            </div>
                            <div>
                                <label class="detail-label">{{ __('Phone') }}</label>
                                <p class="detail-value">{{ optional($customOrder->customer)->phone ?? '+1 (555) 123-4567' }}</p>
                            </div>
                            <div>
                                <label class="detail-label">{{ __('Product Type') }}</label>
                                <p class="detail-value">{{ $customOrder->product_type ?? 'Custom Suit' }}</p>
                            </div>
                            <div>
                                <label class="detail-label">{{ __('Status') }}</label>
                                <span class="badge @switch($customOrder->status ?? 'in_production')
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
                                    {{ ucfirst(str_replace('_', ' ', $customOrder->status ?? 'in_production')) }}
                                </span>
                            </div>
                            <div>
                                <label class="detail-label">{{ __('Priority') }}</label>
                                <span class="badge @switch($customOrder->priority ?? 'normal')
                                    @case('urgent') badge-red @break
                                    @case('high') badge-orange @break
                                    @case('normal') badge-blue @break
                                    @case('low') badge-gray @break
                                    @default badge-blue
                                @endswitch">
                                    {{ ucfirst($customOrder->priority ?? 'normal') }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Measurements -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">{{ __('Measurements') }}</h3>
                    </div>
                    <div class="card-content">
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            @php
                                $measurements = $customOrder->measurements ?? [
                                    'chest' => '102',
                                    'waist' => '86', 
                                    'hip' => '98',
                                    'length' => '72',
                                    'shoulder' => '46',
                                    'sleeve' => '63',
                                    'neck' => '40',
                                    'inseam' => '81'
                                ];
                            @endphp
                            @foreach($measurements as $key => $value)
                            <div class="measurement-item">
                                <label class="detail-label">{{ __(ucfirst($key)) }}</label>
                                <p class="detail-value">{{ $value }} cm</p>
                            </div>
                            @endforeach
                        </div>
                    </div>
                </div>

                <!-- Production Progress -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">{{ __('Production Progress') }}</h3>
                    </div>
                    <div class="card-content">
                        <div class="space-y-4">
                            @php
                                $stages = [
                                    ['name' => 'Pattern Creation', 'status' => 'completed', 'date' => '2024-01-15'],
                                    ['name' => 'Fabric Cutting', 'status' => 'completed', 'date' => '2024-01-16'],
                                    ['name' => 'Initial Assembly', 'status' => 'in_progress', 'date' => null],
                                    ['name' => 'First Fitting', 'status' => 'pending', 'date' => null],
                                    ['name' => 'Final Assembly', 'status' => 'pending', 'date' => null],
                                    ['name' => 'Quality Check', 'status' => 'pending', 'date' => null]
                                ];
                            @endphp
                            
                            @foreach($stages as $index => $stage)
                            <div class="flex items-center space-x-4">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center 
                                        @if($stage['status'] === 'completed') bg-green-100 text-green-600
                                        @elseif($stage['status'] === 'in_progress') bg-blue-100 text-blue-600
                                        @else bg-gray-100 text-gray-400 @endif">
                                        @if($stage['status'] === 'completed')
                                            ✓
                                        @elseif($stage['status'] === 'in_progress')
                                            {{ $index + 1 }}
                                        @else
                                            {{ $index + 1 }}
                                        @endif
                                    </div>
                                </div>
                                <div class="flex-1">
                                    <p class="font-medium @if($stage['status'] === 'completed') text-green-600 @elseif($stage['status'] === 'in_progress') text-blue-600 @else text-gray-500 @endif">
                                        {{ $stage['name'] }}
                                    </p>
                                    @if($stage['date'])
                                        <p class="text-sm text-gray-500">{{ $stage['date'] }}</p>
                                    @endif
                                </div>
                                <div>
                                    <span class="badge @if($stage['status'] === 'completed') badge-green @elseif($stage['status'] === 'in_progress') badge-blue @else badge-gray @endif">
                                        {{ ucfirst(str_replace('_', ' ', $stage['status'])) }}
                                    </span>
                                </div>
                            </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <!-- Pricing -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">{{ __('Pricing') }}</h3>
                    </div>
                    <div class="card-content space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">{{ __('Quoted Price') }}</span>
                            <span class="font-medium">${{ number_format($customOrder->quoted_price ?? 450, 2) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">{{ __('Final Price') }}</span>
                            <span class="font-semibold text-lg">${{ number_format($customOrder->final_price ?? 450, 2) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Timeline -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">{{ __('Timeline') }}</h3>
                    </div>
                    <div class="card-content space-y-3">
                        <div>
                            <label class="detail-label">{{ __('Order Date') }}</label>
                            <p class="detail-value">{{ optional($customOrder->created_at)->format('M d, Y') ?? 'Jan 15, 2024' }}</p>
                        </div>
                        <div>
                            <label class="detail-label">{{ __('Estimated Completion') }}</label>
                            <p class="detail-value">{{ optional($customOrder->estimated_completion_date)->format('M d, Y') ?? 'Feb 15, 2024' }}</p>
                        </div>
                        <div>
                            <label class="detail-label">{{ __('Promised Delivery') }}</label>
                            <p class="detail-value">{{ optional($customOrder->promised_delivery_date)->format('M d, Y') ?? 'Feb 20, 2024' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Assigned Worker -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">{{ __('Assignment') }}</h3>
                    </div>
                    <div class="card-content">
                        <div>
                            <label class="detail-label">{{ __('Assigned To') }}</label>
                            <p class="detail-value">{{ optional($customOrder->assignedTo)->name ?? 'Michael Johnson' }}</p>
                        </div>
                        <div class="mt-3">
                            <label class="detail-label">{{ __('Created By') }}</label>
                            <p class="detail-value">{{ optional($customOrder->createdBy)->name ?? 'Admin User' }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('styles')
<style>
.detail-label {
    @apply block text-sm font-medium text-gray-600 mb-1;
}
.detail-value {
    @apply text-gray-900 font-medium;
}
.measurement-item {
    @apply text-center p-3 bg-gray-50 rounded-lg;
}
</style>
@endpush
