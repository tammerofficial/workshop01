@extends('layouts.app')
@section('title', __('Item Details'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ $item->name ?? __('Item') }}</h3></div>
  <div class="card-content">
    <div class="grid md:grid-cols-2 gap-6">
      <div><div class="mb-2 font-semibold">{{ __('Quantity') }}</div><div>{{ number_format($item->quantity ?? 0) }} {{ $item->unit ?? '' }}</div></div>
      <div><div class="mb-2 font-semibold">{{ __('Status') }}</div><div><span class="badge badge-info">{{ $item->status ?? '-' }}</span></div></div>
      <div class="md:col-span-2"><div class="mb-2 font-semibold">{{ __('Description') }}</div><div class="text-gray-700">{{ $item->description ?? '-' }}</div></div>
    </div>
  </div>
</div>
@endsection