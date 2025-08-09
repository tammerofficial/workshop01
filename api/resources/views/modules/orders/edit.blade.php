@extends('layouts.app')
@section('title', __('Edit Order'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Edit Order') }}</h3></div>
  <div class="card-content">
    <form method="post" action="{{ url()->current() }}" class="space-y-4">
      @csrf
      @method('put')
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium">{{ __('Title') }}</label>
          <input type="text" name="title" value="{{ old('title', $order->title ?? '') }}" class="w-full rounded-lg border p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium">{{ __('Delivery Date') }}</label>
          <input type="date" name="delivery_date" value="{{ old('delivery_date', optional($order->delivery_date)->format('Y-m-d')) }}" class="w-full rounded-lg border p-2" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">{{ __('Description') }}</label>
          <textarea name="description" class="w-full rounded-lg border p-2" rows="4">{{ old('description', $order->description ?? '') }}</textarea>
        </div>
      </div>
      <div class="mt-6"><button class="btn btn-primary">{{ __('Update') }}</button></div>
    </form>
  </div>
</div>
@endsection