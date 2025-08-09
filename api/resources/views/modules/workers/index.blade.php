@extends('layouts.app')
@section('title', __('Workers'))
@section('content')
<div class="card">
  <div class="card-header"><div class="flex items-center justify-between"><h3 class="font-semibold text-gray-900">{{ __('Workers') }}</h3></div></div>
  <div class="card-content">
    <div class="table-container">
      <table class="table">
        <thead><tr>
          <th>{{ __('ID') }}</th><th>{{ __('Name') }}</th><th>{{ __('Role') }}</th><th>{{ __('Department') }}</th><th>{{ __('Status') }}</th>
        </tr></thead>
        <tbody>
        @forelse(($workers ?? []) as $worker)
          <tr>
            <td class="font-medium">#{{ $worker->id }}</td>
            <td><div class="font-medium">{{ $worker->name }}</div><div class="text-xs text-gray-500">{{ $worker->email ?? __('No Email') }}</div></td>
            <td><span class="badge badge-info">{{ $worker->specialty ?? __('No Specialty') }}</span></td>
            <td>{{ $worker->department ?? __('No Department') }}</td>
            <td><span class="badge {{ ($worker->is_active ?? false) ? 'badge-success' : 'badge-danger' }}">{{ ($worker->is_active ?? false) ? __('Active') : __('Inactive') }}</span></td>
          </tr>
        @empty
          <tr><td colspan="5"><div class="empty-state"><p>{{ __('No workers found') }}</p></div></td></tr>
        @endforelse
        </tbody>
      </table>
    </div>
  </div>
</div>
@endsection