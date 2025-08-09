@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
    <header class="page-header">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="page-title">{{ __('Materials Management') }}</h2>
                <p class="page-description">{{ __('Manage raw materials and supplies inventory.') }}</p>
            </div>
            <a href="{{ route('ui.inventory.materials.create') }}" class="btn btn-blue">
                <span class="mr-2">+</span>
                {{ __('Add Material') }}
            </a>
        </div>
    </header>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-title">{{ __('Total Materials') }}</div>
            <div class="stat-value">{{ $overview['total_materials'] ?? 0 }}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">{{ __('Low Stock') }}</div>
            <div class="stat-value text-red-600">{{ $overview['low_stock'] ?? 0 }}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">{{ __('Total Value') }}</div>
            <div class="stat-value">${{ number_format($overview['total_value'] ?? 0, 2) }}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">{{ __('Categories') }}</div>
            <div class="stat-value">{{ $overview['categories'] ?? 0 }}</div>
        </div>
    </div>

    <div class="card mt-6">
        <div class="card-header">
            <div class="flex items-center justify-between">
                <h3 class="card-title">{{ __('Materials Inventory') }}</h3>
                <div class="flex items-center gap-2">
                    <select class="form-select text-sm">
                        <option>{{ __('All Categories') }}</option>
                        <option>{{ __('Fabrics') }}</option>
                        <option>{{ __('Threads') }}</option>
                        <option>{{ __('Accessories') }}</option>
                    </select>
                    <button class="btn btn-sm btn-gray">{{ __('Filter') }}</button>
                </div>
            </div>
        </div>
        <div class="card-content">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ __('Material') }}</th>
                            <th>{{ __('Category') }}</th>
                            <th>{{ __('Stock') }}</th>
                            <th>{{ __('Unit') }}</th>
                            <th>{{ __('Unit Cost') }}</th>
                            <th>{{ __('Total Value') }}</th>
                            <th>{{ __('Status') }}</th>
                            <th>{{ __('Actions') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse(($materials ?? []) as $material)
                            <tr>
                                <td>
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center text-white text-sm font-medium mr-3">
                                            {{ substr($material['name'] ?? 'M', 0, 1) }}
                                        </div>
                                        <div>
                                            <p class="font-medium">{{ $material['name'] ?? __('Unknown Material') }}</p>
                                            <p class="text-sm text-gray-600">{{ $material['sku'] ?? '-' }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>{{ $material['category'] ?? '-' }}</td>
                                <td>
                                    <span class="@if(($material['current_stock'] ?? 0) <= ($material['min_stock'] ?? 0)) text-red-600 font-semibold @endif">
                                        {{ number_format($material['current_stock'] ?? 0, 2) }}
                                    </span>
                                </td>
                                <td>{{ $material['unit'] ?? '-' }}</td>
                                <td>${{ number_format($material['unit_cost'] ?? 0, 2) }}</td>
                                <td>${{ number_format(($material['current_stock'] ?? 0) * ($material['unit_cost'] ?? 0), 2) }}</td>
                                <td>
                                    @if(($material['current_stock'] ?? 0) <= ($material['min_stock'] ?? 0))
                                        <span class="badge badge-red">{{ __('Low Stock') }}</span>
                                    @elseif(($material['current_stock'] ?? 0) <= ($material['reorder_level'] ?? 0))
                                        <span class="badge badge-amber">{{ __('Reorder') }}</span>
                                    @else
                                        <span class="badge badge-green">{{ __('In Stock') }}</span>
                                    @endif
                                </td>
                                <td>
                                    <div class="flex items-center gap-2">
                                        <a href="{{ route('ui.inventory.materials.show', $material['id'] ?? 1) }}" class="btn btn-sm btn-blue">{{ __('View') }}</a>
                                        <a href="{{ route('ui.inventory.materials.edit', $material['id'] ?? 1) }}" class="btn btn-sm btn-amber">{{ __('Edit') }}</a>
                                        <form method="POST" action="{{ route('ui.inventory.materials.destroy', $material['id'] ?? 1) }}" class="inline">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-sm btn-red" onclick="return confirm('{{ __('Are you sure?') }}')">
                                                {{ __('Delete') }}
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="text-center py-8">
                                    <div class="empty-state">
                                        <div class="empty-state-icon">🧵</div>
                                        <h3 class="empty-state-title">{{ __('No Materials Found') }}</h3>
                                        <p class="empty-state-text">{{ __('Add your first material to get started.') }}</p>
                                        <a href="{{ route('ui.inventory.materials.create') }}" class="btn btn-blue mt-4">{{ __('Add Material') }}</a>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection
