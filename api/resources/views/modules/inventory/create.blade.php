@extends('layouts.app')
@section('title', __('Add Item'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Add Item') }}</h3></div>
  <div class="card-content">
    <form method="post" action="{{ url()->current() }}" class="grid md:grid-cols-2 gap-4">
      @csrf
      <div><label class="block text-sm font-medium">{{ __('Name') }}</label><input name="name" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Quantity') }}</label><input name="quantity" type="number" step="0.001" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Unit') }}</label><input name="unit" class="w-full rounded-lg border p-2" /></div>
      <div class="md:col-span-2"><label class="block text-sm font-medium">{{ __('Description') }}</label><textarea name="description" class="w-full rounded-lg border p-2" rows="4"></textarea></div>
      <div class="md:col-span-2 mt-4"><button class="btn btn-primary">{{ __('Save') }}</button></div>
    </form>
  </div>
</div>
@endsection