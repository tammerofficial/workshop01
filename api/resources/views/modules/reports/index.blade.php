@extends('layouts.app')
@section('title', __('Reports'))
@section('content')
<div class="stats-grid mb-8">
  <div class="stat-card"><div class="stat-header"><div class="stat-title">{{ __('Total Orders') }}</div><span class="stat-badge badge-info">{{ __('All Time') }}</span></div><div class="stat-value">{{ number_format($ordersCount ?? 0) }}</div></div>
  <div class="stat-card"><div class="stat-header"><div class="stat-title">{{ __('Total Workers') }}</div><span class="stat-badge badge-success">{{ __('Active') }}</span></div><div class="stat-value">{{ number_format($workersCount ?? 0) }}</div></div>
  <div class="stat-card"><div class="stat-header"><div class="stat-title">{{ __('Inventory Items') }}</div><span class="stat-badge" style="background:rgba(168,85,247,.1);color:#7c3aed;border-color:rgba(168,85,247,.2)">{{ __('Available') }}</span></div><div class="stat-value">{{ number_format($inventoryCount ?? 0) }}</div></div>
</div>
@endsection