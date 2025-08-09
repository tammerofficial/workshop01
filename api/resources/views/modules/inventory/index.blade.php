@extends('layouts.app')
@section('title', __('Inventory'))
@section('content')
<div class="card">
  <div class="card-header"><div class="flex items-center justify-between"><h3 class="font-semibold text-gray-900">{{ __('Inventory') }}</h3></div></div>
  <div class="card-content">
    @if(($inventoryItems ?? collect())->count() > 0)
    <div class="table-container">
      <table class="table">
        <thead><tr>
          <th>{{ __('Name') }}</th><th>{{ __('Category') }}</th><th>{{ __('Quantity') }}</th><th>{{ __('Unit') }}</th><th>{{ __('Status') }}</th>
        </tr></thead>
        <tbody>
        @foreach($inventoryItems as $item)
          <tr>
            <td><div class="font-medium">{{ $item->name }}</div><div class="text-xs text-gray-500">{{ $item->description ?? __('No Description') }}</div></td>
            <td><span class="badge badge-info">{{ $item->category->name ?? __('No Category') }}</span></td>
            <td class="font-semibold">{{ number_format($item->quantity ?? 0) }}</td>
            <td>{{ $item->unit ?? __('Unit') }}</td>
            <td><span class="badge {{ $item->quantity <= 0 ? 'badge-danger' : ($item->quantity <= ($item->minimum_quantity ?? 0) ? 'badge-warning' : 'badge-success') }}">{{ $item->quantity <= 0 ? __('Out of Stock') : ($item->quantity <= ($item->minimum_quantity ?? 0) ? __('Low Stock') : __('In Stock')) }}</span></td>
          </tr>
        @endforeach
        </tbody>
      </table>
    </div>
    @else
      <div class="empty-state"><p>{{ __('No inventory items found') }}</p></div>
    @endif
  </div>
</div>
@endsection