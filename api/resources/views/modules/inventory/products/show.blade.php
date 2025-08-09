@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
  <div class="space-y-6">
    <div class="card">
      <div class="card-header">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="card-title">{{ __('Product Details') }}</h2>
            <p class="text-gray-600">{{ $product->name ?? '' }} — <span class="font-mono">{{ $product->sku ?? '' }}</span></p>
          </div>
          <div class="flex gap-2">
            <a href="{{ route('ui.inventory.products.edit', $product->id) }}" class="btn btn-amber">{{ __('Edit') }}</a>
            <a href="{{ route('ui.inventory.products.index') }}" class="btn btn-secondary">{{ __('Back') }}</a>
          </div>
        </div>
      </div>
      <div class="card-content">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="detail-label">{{ __('Name') }}</label>
            <p class="detail-value">{{ $product->name ?? '-' }}</p>
          </div>
          <div>
            <label class="detail-label">{{ __('SKU') }}</label>
            <p class="detail-value font-mono">{{ $product->sku ?? '-' }}</p>
          </div>
          <div>
            <label class="detail-label">{{ __('Category') }}</label>
            <p class="detail-value">{{ $product->category_name ?? '-' }}</p>
          </div>
          <div>
            <label class="detail-label">{{ __('Price') }}</label>
            <p class="detail-value">${{ number_format($product->price ?? 0, 2) }}</p>
          </div>
        </div>
        <div class="mt-6">
          <label class="detail-label">{{ __('Description') }}</label>
          <p class="text-gray-700">{{ $product->description ?? '-' }}</p>
        </div>
      </div>
    </div>
  </div>
</div>
@endsection


