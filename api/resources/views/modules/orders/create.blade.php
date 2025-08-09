@extends('layouts.app')
@section('title', __('Create Order'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Create Order') }}</h3></div>
  <div class="card-content">
    <form method="post" action="{{ url()->current() }}" class="space-y-4">
      @csrf
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium">{{ __('Client ID') }}</label>
          <input type="number" name="client_id" class="w-full rounded-lg border p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium">{{ __('Assigned Worker ID') }}</label>
          <input type="number" name="assigned_worker_id" class="w-full rounded-lg border p-2" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">{{ __('Title') }}</label>
          <input type="text" name="title" class="w-full rounded-lg border p-2" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">{{ __('Description') }}</label>
          <textarea name="description" class="w-full rounded-lg border p-2" rows="4"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium">{{ __('Delivery Date') }}</label>
          <input type="date" name="delivery_date" class="w-full rounded-lg border p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium">{{ __('Deposit Amount') }}</label>
          <input type="number" step="0.01" name="deposit_amount" class="w-full rounded-lg border p-2" />
        </div>
      </div>
      <div class="mt-6"><button class="btn btn-primary">{{ __('Save') }}</button></div>
    </form>
  </div>
</div>
@endsection