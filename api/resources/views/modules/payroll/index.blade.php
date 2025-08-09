@extends('layouts.app')
@section('title', __('Payroll'))
@section('content')
<div class="card">
  <div class="card-header"><div class="flex items-center justify-between"><h3 class="font-semibold text-gray-900">{{ __('Payroll') }}</h3></div></div>
  <div class="card-content">
    <div class="table-container">
      <table class="table">
        <thead><tr>
          <th>{{ __('Employee') }}</th><th>{{ __('Position') }}</th><th>{{ __('Basic Salary') }}</th><th>{{ __('Net Salary') }}</th><th>{{ __('Status') }}</th>
        </tr></thead>
        <tbody>
        @forelse(($payrolls ?? []) as $payroll)
          <tr>
            <td><div class="font-medium">{{ $payroll->worker->name ?? __('Unknown Worker') }}</div><div class="text-xs text-gray-500">{{ $payroll->period ?? __('No Period') }}</div></td>
            <td><span class="badge badge-info">{{ $payroll->worker->specialty ?? __('No Position') }}</span></td>
            <td class="font-semibold">${{ number_format($payroll->basic_salary ?? 0) }}</td>
            <td class="font-bold text-green-600">${{ number_format($payroll->net_salary ?? 0) }}</td>
            <td><span class="badge {{ ($payroll->status ?? 'pending') === 'paid' ? 'badge-success' : 'badge-warning' }}">{{ ucfirst($payroll->status ?? 'pending') }}</span></td>
          </tr>
        @empty
          <tr><td colspan="5"><div class="empty-state"><p>{{ __('No payroll records found') }}</p></div></td></tr>
        @endforelse
        </tbody>
      </table>
    </div>
  </div>
</div>
@endsection