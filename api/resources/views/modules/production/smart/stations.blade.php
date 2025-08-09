@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">{{ __('Stations Status') }}</h2>
    </div>
    <div class="card-content">
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>{{ __('Station') }}</th>
              <th>{{ __('Status') }}</th>
              <th>{{ __('Efficiency') }}</th>
              <th>{{ __('Current Order') }}</th>
            </tr>
          </thead>
          <tbody>
            @forelse(($stations ?? []) as $st)
              <tr>
                <td>{{ $st['name'] }}</td>
                <td>
                  <span class="badge @if(($st['status'] ?? 'idle') === 'busy') badge-blue @else badge-gray @endif">
                    {{ ucfirst($st['status'] ?? 'idle') }}
                  </span>
                </td>
                <td>{{ $st['efficiency'] ?? 0 }}%</td>
                <td>{{ $st['current_order'] ?? '-' }}</td>
              </tr>
            @empty
              <tr>
                <td colspan="4" class="text-center py-6">{{ __('No stations data') }}</td>
              </tr>
            @endforelse
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
@endsection


