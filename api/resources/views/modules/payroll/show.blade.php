@extends('layouts.app')
@section('title', __('Payslip'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Payslip') }} - {{ $payroll->period ?? '' }}</h3></div>
  <div class="card-content">
    <div class="grid md:grid-cols-2 gap-6">
      <div><div class="mb-2 font-semibold">{{ __('Employee') }}</div><div>{{ $payroll->worker->name ?? '-' }}</div></div>
      <div><div class="mb-2 font-semibold">{{ __('Net Salary') }}</div><div class="font-bold text-green-600">${{ number_format($payroll->net_salary ?? 0, 2) }}</div></div>
      <div class="md:col-span-2"><div class="mb-2 font-semibold">{{ __('Status') }}</div><div><span class="badge badge-info">{{ ucfirst($payroll->payment_status ?? 'pending') }}</span></div></div>
    </div>
  </div>
</div>
@endsection