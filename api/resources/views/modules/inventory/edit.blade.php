@extends('layouts.app')
@section('title', __('Edit Item'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Edit Item') }}</h3></div>
  <div class="card-content">
    <form method="post" action="{{ url()->current() }}" class="grid md:grid-cols-2 gap-4">
      @csrf
      @method('put')
      <div><label class="block text-sm font-medium">{{ __('Name') }}</label><input name="name" value="{{ old('name', $item->name ?? '') }}" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Quantity') }}</label><input name="quantity" type="number" step="0.001" value="{{ old('quantity', $item->quantity ?? 0) }}" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Unit') }}</label><input name="unit" value="{{ old('unit', $item->unit ?? '') }}" class="w-full rounded-lg border p-2" /></div>
      <div class="md:col-span-2"><label class="block text-sm font-medium">{{ __('Description') }}</label><textarea name="description" class="w-full rounded-lg border p-2" rows="4">{{ old('description', $item->description ?? '') }}</textarea></div>
      <div class="md:col-span-2 mt-4"><button class="btn btn-primary">{{ __('Update') }}</button></div>
    </form>
  </div>
</div>
@endsection