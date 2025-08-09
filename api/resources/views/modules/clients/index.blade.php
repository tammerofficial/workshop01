@extends('layouts.app')
@section('title', __('Clients'))
@section('content')
<div class="card">
  <div class="card-header"><div class="flex items-center justify-between"><h3 class="font-semibold">{{ __('Clients') }}</h3><a href="{{ route('ui.clients.create') }}" class="btn btn-primary">{{ __('Add Client') }}</a></div></div>
  <div class="card-content">
    <div class="table-container"><table class="table"><thead><tr><th>#</th><th>{{ __('Name') }}</th><th>{{ __('Email') }}</th><th>{{ __('Actions') }}</th></tr></thead><tbody>
    @forelse(($clients ?? []) as $client)
      <tr><td>#{{ $client->id }}</td><td>{{ $client->name }}</td><td>{{ $client->email ?? '-' }}</td><td><a class="btn btn-primary" href="{{ route('ui.clients.show',$client) }}">{{ __('View') }}</a></td></tr>
    @empty
      <tr><td colspan="4"><div class="empty-state"><p>{{ __('No clients found') }}</p></div></td></tr>
    @endforelse
    </tbody></table></div>
  </div>
</div>
@endsection