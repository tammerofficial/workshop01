@extends('layouts.app')
@section('title', __('Client Details'))
@section('content')
<div class="card"><div class="card-header"><h3 class="font-semibold">{{ $client->name ?? __('Client') }}</h3></div>
<div class="card-content"><div class="grid md:grid-cols-2 gap-6">
<div><div class="font-semibold mb-1">{{ __('Email') }}</div><div>{{ $client->email ?? '-' }}</div></div>
<div class="md:col-span-2"><div class="font-semibold mb-1">{{ __('Address') }}</div><div>{{ $client->address ?? '-' }}</div></div>
</div></div></div>
@endsection