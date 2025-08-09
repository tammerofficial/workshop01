@extends('layouts.app')
@section('title', __('Biometric Records'))
@section('content')
<div class="card">
  <div class="card-header"><div class="flex items-center justify-between"><h3 class="font-semibold text-gray-900">{{ __('Biometric Records') }}</h3></div></div>
  <div class="card-content">
    <div class="table-container">
      <table class="table">
        <thead><tr>
          <th>{{ __('Employee') }}</th><th>{{ __('Date') }}</th><th>{{ __('Check In') }}</th><th>{{ __('Check Out') }}</th><th>{{ __('Total Hours') }}</th><th>{{ __('Status') }}</th>
        </tr></thead>
        <tbody>
        @forelse(($records ?? []) as $record)
          <tr>
            <td><div class="font-medium">{{ $record->worker->name ?? __('Unknown Worker') }}</div><div class="text-xs text-gray-500">{{ $record->worker->department ?? __('No Department') }}</div></td>
            <td>{{ $record->attendance_date ?? __('No Date') }}</td>
            <td class="font-mono">{{ $record->check_in_time ?? __('--:--') }}</td>
            <td class="font-mono">{{ $record->check_out_time ?? __('--:--') }}</td>
            <td class="font-semibold">{{ $record->total_hours ?? '0' }}</td>
            <td><span class="badge {{ ($record->attendance_status ?? 'absent') === 'present' ? 'badge-success' : (($record->attendance_status ?? 'absent') === 'late' ? 'badge-warning' : 'badge-danger') }}">{{ ucfirst($record->attendance_status ?? 'absent') }}</span></td>
          </tr>
        @empty
          <tr><td colspan="6"><div class="empty-state"><p>{{ __('No biometric records found') }}</p></div></td></tr>
        @endforelse
        </tbody>
      </table>
    </div>
  </div>
</div>
@endsection