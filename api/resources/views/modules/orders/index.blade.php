@extends('layouts.app')
@section('title', __('Orders'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Orders') }}</h3></div>
  <div class="card-content">
    <div class="table-container">
      <table class="table">
        <thead><tr>
          <th>#</th><th>{{ __('Client') }}</th><th>{{ __('Status') }}</th><th>{{ __('Total') }}</th><th>{{ __('Date') }}</th><th>{{ __('Actions') }}</th>
        </tr></thead>
        <tbody>
        @forelse(($orders ?? []) as $order)
          <tr>
            <td>#{{ $order->id }}</td>
            <td><div class="font-medium">{{ $order->client->name ?? __('No Client') }}</div><div class="text-xs text-gray-500">{{ $order->title ?? __('No Title') }}</div></td>
            <td><span class="badge {{ $order->status==='completed' ? 'badge-success' : ($order->status==='in_progress' ? 'badge-info' : ($order->status==='pending' ? 'badge-warning' : 'badge-danger')) }}">{{ ucfirst($order->status ?? 'unknown') }}</span></td>
            <td class="font-semibold">${{ number_format($order->final_amount ?? 0) }}</td>
            <td>{{ optional($order->created_at)->format('Y-m-d') }}</td>
            <td><div class="flex gap-2"><button class="btn btn-primary">{{ __('View') }}</button></div></td>
          </tr>
        @empty
          <tr><td colspan="6"><div class="empty-state"><p>{{ __('No orders found') }}</p></div></td></tr>
        @endforelse
        </tbody>
      </table>
    </div>
  </div>
</div>
@endsection