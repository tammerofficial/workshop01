@extends('layouts.app')
@section('title', __('Add Worker'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Add Worker') }}</h3></div>
  <div class="card-content">
    <form method="post" action="{{ url()->current() }}" class="grid md:grid-cols-2 gap-4">
      @csrf
      <div><label class="block text-sm font-medium">{{ __('Name') }}</label><input name="name" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Email') }}</label><input name="email" type="email" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Department') }}</label><input name="department" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Specialty') }}</label><input name="specialty" class="w-full rounded-lg border p-2" /></div>
      <div class="md:col-span-2 mt-4"><button class="btn btn-primary">{{ __('Save') }}</button></div>
    </form>
  </div>
</div>
@endsection