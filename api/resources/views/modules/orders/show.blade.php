@extends('layouts.app')
@section('title', __('Order Details'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Order') }} #{{ $order->id ?? '-' }}</h3></div>
  <div class="card-content">
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <div class="mb-2 font-semibold">{{ __('Client') }}</div>
        <div>{{ $order->client->name ?? __('No Client') }}</div>
      </div>
      <div>
        <div class="mb-2 font-semibold">{{ __('Status') }}</div>
        <div><span class="badge badge-info">{{ ucfirst($order->status ?? 'unknown') }}</span></div>
      </div>
      <div>
        <div class="mb-2 font-semibold">{{ __('Final Amount') }}</div>
        <div>${{ number_format($order->final_amount ?? 0, 2) }}</div>
      </div>
      <div>
        <div class="mb-2 font-semibold">{{ __('Delivery Date') }}</div>
        <div>{{ optional($order->delivery_date)->format('Y-m-d') }}</div>
      </div>
      <div class="md:col-span-2">
        <div class="mb-2 font-semibold">{{ __('Description') }}</div>
        <div class="text-gray-700">{{ $order->description ?? '-' }}</div>
      </div>
    </div>
  </div>
</div>
@endsection