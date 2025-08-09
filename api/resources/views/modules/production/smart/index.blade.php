@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-title">{{ __('Active Orders') }}</div>
      <div class="stat-value">{{ $overview['active_orders'] ?? 0 }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">{{ __('Busy Stations') }}</div>
      <div class="stat-value">{{ $overview['stations_busy'] ?? 0 }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">{{ __('Avg. Efficiency') }}</div>
      <div class="stat-value">{{ ($overview['avg_efficiency'] ?? 0) }}%</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">{{ __('Bottlenecks') }}</div>
      <div class="stat-value">{{ implode(', ', $overview['bottlenecks'] ?? []) }}</div>
    </div>
  </div>

  <div class="card mt-6">
    <div class="card-header">
      <div class="flex items-center justify-between">
        <h2 class="card-title">{{ __('Smart Production Overview') }}</h2>
        <div class="flex gap-2">
          <a href="{{ route('ui.production.smart.stations') }}" class="btn btn-blue">{{ __('Stations') }}</a>
          <a href="{{ route('ui.production.smart.assignments') }}" class="btn btn-amber">{{ __('Assignments') }}</a>
        </div>
      </div>
    </div>
    <div class="card-content">
      <p class="text-gray-700">{{ __('Visual overview of current production performance and bottlenecks.') }}</p>
    </div>
  </div>
</div>
@endsection


