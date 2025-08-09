@extends('layouts.app')
@section('title', __('Attendance Day'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Attendance') }} - {{ optional($record->attendance_date)->format('Y-m-d') }}</h3></div>
  <div class="card-content">
    <div class="grid md:grid-cols-2 gap-6">
      <div><div class="mb-2 font-semibold">{{ __('Employee') }}</div><div>{{ $record->worker->name ?? '-' }}</div></div>
      <div><div class="mb-2 font-semibold">{{ __('Status') }}</div><div><span class="badge badge-info">{{ ucfirst($record->attendance_status ?? 'unknown') }}</span></div></div>
      <div><div class="mb-2 font-semibold">{{ __('Check In') }}</div><div class="font-mono">{{ $record->check_in_time ?? '--:--' }}</div></div>
      <div><div class="mb-2 font-semibold">{{ __('Check Out') }}</div><div class="font-mono">{{ $record->check_out_time ?? '--:--' }}</div></div>
      <div class="md:col-span-2"><div class="mb-2 font-semibold">{{ __('Total Hours') }}</div><div>{{ $record->total_hours ?? '0' }}</div></div>
    </div>
  </div>
</div>
@endsection