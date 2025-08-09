@extends('layouts.app')
@section('title', __('Edit Client'))
@section('content')
<div class="card"><div class="card-header"><h3 class="font-semibold">{{ __('Edit Client') }}</h3></div>
<div class="card-content"><form method="post" action="{{ url()->current() }}" class="grid md:grid-cols-2 gap-4">@csrf @method('put')
<div><label class="block text-sm font-medium">{{ __('Name') }}</label><input name="name" value="{{ old('name',$client->name ?? '') }}" class="w-full rounded-lg border p-2" /></div>
<div><label class="block text-sm font-medium">{{ __('Email') }}</label><input name="email" type="email" value="{{ old('email',$client->email ?? '') }}" class="w-full rounded-lg border p-2" /></div>
<div class="md:col-span-2"><label class="block text-sm font-medium">{{ __('Address') }}</label><textarea name="address" class="w-full rounded-lg border p-2" rows="3">{{ old('address',$client->address ?? '') }}</textarea></div>
<div class="md:col-span-2 mt-4"><button class="btn btn-primary">{{ __('Update') }}</button></div>
</form></div></div>
@endsection