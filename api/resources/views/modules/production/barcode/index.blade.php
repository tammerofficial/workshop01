@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
    <header class="page-header">
        <h2 class="page-title">{{ __('Barcode & QR Management') }}</h2>
        <p class="page-description">{{ __('Generate and manage barcodes and QR codes for orders and products.') }}</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Generate New -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">{{ __('Generate New Code') }}</h3>
            </div>
            <div class="card-content">
                <form class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">{{ __('Type') }}</label>
                        <select class="form-select">
                            <option value="order">{{ __('Order Barcode') }}</option>
                            <option value="product">{{ __('Product QR Code') }}</option>
                            <option value="worker">{{ __('Worker ID') }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">{{ __('Reference ID') }}</label>
                        <input type="text" class="form-input" placeholder="{{ __('Enter order/product ID') }}">
                    </div>
                    <button type="submit" class="btn btn-blue w-full">{{ __('Generate Code') }}</button>
                </form>
            </div>
        </div>

        <!-- Recent Codes -->
        <div class="lg:col-span-2 card">
            <div class="card-header">
                <h3 class="card-title">{{ __('Recent Generated Codes') }}</h3>
            </div>
            <div class="card-content">
                <div class="space-y-3">
                    @forelse(($recent_codes ?? []) as $code)
                        <div class="flex items-center justify-between p-3 border rounded">
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-gray-100 border rounded flex items-center justify-center mr-3">
                                    <span class="text-xs">{{ $code['type'] === 'qr' ? 'QR' : 'BC' }}</span>
                                </div>
                                <div>
                                    <p class="font-medium">{{ $code['reference'] ?? __('Code Reference') }}</p>
                                    <p class="text-sm text-gray-600">{{ ucfirst($code['type'] ?? 'barcode') }} • {{ $code['created_at'] ?? now()->format('M d, Y') }}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button class="btn btn-sm btn-blue">{{ __('View') }}</button>
                                <button class="btn btn-sm btn-green">{{ __('Print') }}</button>
                                <button class="btn btn-sm btn-gray">{{ __('Download') }}</button>
                            </div>
                        </div>
                    @empty
                        <div class="empty-state">
                            <div class="empty-state-icon">📱</div>
                            <h4 class="empty-state-title">{{ __('No Codes Generated') }}</h4>
                            <p class="empty-state-text">{{ __('Generated codes will appear here.') }}</p>
                        </div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <button class="btn btn-blue btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">📦</span>
            <span>{{ __('Batch Generate') }}</span>
        </button>
        <button class="btn btn-green btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">🖨️</span>
            <span>{{ __('Bulk Print') }}</span>
        </button>
        <button class="btn btn-purple btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">📊</span>
            <span>{{ __('Scan History') }}</span>
        </button>
        <button class="btn btn-amber btn-lg h-20 flex flex-col items-center justify-center">
            <span class="text-2xl mb-1">⚙️</span>
            <span>{{ __('Settings') }}</span>
        </button>
    </div>
</div>
@endsection
