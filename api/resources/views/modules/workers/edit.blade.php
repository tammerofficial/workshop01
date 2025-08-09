@extends('layouts.app')
@section('title', __('Edit Worker'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Edit Worker') }}</h3></div>
  <div class="card-content">
    <form method="post" action="{{ url()->current() }}" class="grid md:grid-cols-2 gap-4">
      @csrf
      @method('put')
      <div><label class="block text-sm font-medium">{{ __('Name') }}</label><input name="name" value="{{ old('name', $worker->name ?? '') }}" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Email') }}</label><input name="email" type="email" value="{{ old('email', $worker->email ?? '') }}" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Department') }}</label><input name="department" value="{{ old('department', $worker->department ?? '') }}" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Specialty') }}</label><input name="specialty" value="{{ old('specialty', $worker->specialty ?? '') }}" class="w-full rounded-lg border p-2" /></div>
      <div class="md:col-span-2 mt-4"><button class="btn btn-primary">{{ __('Update') }}</button></div>
    </form>
  </div>
</div>
@endsection