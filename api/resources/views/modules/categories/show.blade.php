@extends('layouts.app')
@section('title', __('Category Details'))
@section('content')
<div class="card"><div class="card-header"><h3 class="font-semibold">{{ $category->name ?? __('Category') }}</h3></div>
<div class="card-content"><div class="grid md:grid-cols-2 gap-6">
<div><div class="font-semibold mb-1">{{ __('Color') }}</div><div><span class="badge" style="border-color:{{ $category->color ?? '#3b82f6' }};color:{{ $category->color ?? '#3b82f6' }}">{{ $category->color ?? '-' }}</span></div></div>
</div></div></div>
@endsection