@extends('layouts.app')
@section('title', __('Worker Details'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Worker') }} #{{ $worker->id ?? '-' }}</h3></div>
  <div class="card-content">
    <div class="grid md:grid-cols-2 gap-6">
      <div><div class="mb-2 font-semibold">{{ __('Name') }}</div><div>{{ $worker->name ?? '-' }}</div></div>
      <div><div class="mb-2 font-semibold">{{ __('Email') }}</div><div>{{ $worker->email ?? '-' }}</div></div>
      <div><div class="mb-2 font-semibold">{{ __('Department') }}</div><div>{{ $worker->department ?? '-' }}</div></div>
      <div><div class="mb-2 font-semibold">{{ __('Specialty') }}</div><div>{{ $worker->specialty ?? '-' }}</div></div>
    </div>
  </div>
</div>
@endsection