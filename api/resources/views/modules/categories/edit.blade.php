@extends('layouts.app')
@section('title', __('Edit Category'))
@section('content')
<div class="card"><div class="card-header"><h3 class="font-semibold">{{ __('Edit Category') }}</h3></div>
<div class="card-content"><form method="post" action="{{ url()->current() }}" class="grid md:grid-cols-2 gap-4">@csrf @method('put')
<div class="md:col-span-2"><label class="block text-sm font-medium">{{ __('Name') }}</label><input name="name" value="{{ old('name',$category->name ?? '') }}" class="w-full rounded-lg border p-2" /></div>
<div><label class="block text-sm font-medium">{{ __('Color') }}</label><input name="color" value="{{ old('color',$category->color ?? '#3b82f6') }}" class="w-full rounded-lg border p-2" /></div>
<div class="md:col-span-2 mt-4"><button class="btn btn-primary">{{ __('Update') }}</button></div>
</form></div></div>
@endsection