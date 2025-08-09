@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
  <div class="card">
    <div class="card-header">
      <div class="flex justify-between items-center">
        <h2 class="card-title">{{ __('Products') }}</h2>
        <a href="{{ route('ui.inventory.products.create') }}" class="btn btn-primary">{{ __('Create Product') }}</a>
      </div>
    </div>
    <div class="card-content">
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>{{ __('ID') }}</th>
              <th>{{ __('Name') }}</th>
              <th>{{ __('SKU') }}</th>
              <th>{{ __('Category') }}</th>
              <th>{{ __('Price') }}</th>
              <th>{{ __('Stock') }}</th>
              <th>{{ __('Actions') }}</th>
            </tr>
          </thead>
          <tbody>
            @forelse($products ?? [] as $product)
              <tr>
                <td class="font-mono">{{ $product->id }}</td>
                <td>{{ $product->name }}</td>
                <td class="font-mono">{{ $product->sku }}</td>
                <td>{{ $product->category_name ?? '-' }}</td>
                <td>${{ number_format($product->price ?? 0, 2) }}</td>
                <td>{{ $product->stock_qty ?? 0 }}</td>
                <td class="flex gap-2">
                  <a href="{{ route('ui.inventory.products.show', $product->id) }}" class="btn btn-sm btn-blue">{{ __('View') }}</a>
                  <a href="{{ route('ui.inventory.products.edit', $product->id) }}" class="btn btn-sm btn-amber">{{ __('Edit') }}</a>
                </td>
              </tr>
            @empty
              <tr>
                <td colspan="7" class="text-center py-8">
                  <div class="empty-state">
                    <p>{{ __('No products found') }}</p>
                    <a href="{{ route('ui.inventory.products.create') }}" class="btn btn-primary mt-3">{{ __('Create First Product') }}</a>
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


