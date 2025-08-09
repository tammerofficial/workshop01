@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
    <header class="page-header">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="page-title">{{ __('Role Management') }}</h2>
                <p class="page-description">{{ __('Manage user roles and permissions for the system.') }}</p>
            </div>
            <a href="{{ route('ui.admin.roles.create') }}" class="btn btn-blue">
                <span class="mr-2">+</span>
                {{ __('Create Role') }}
            </a>
        </div>
    </header>

    <div class="card">
        <div class="card-header">
            <h3 class="card-title">{{ __('System Roles') }}</h3>
        </div>
        <div class="card-content">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ __('Role Name') }}</th>
                            <th>{{ __('Description') }}</th>
                            <th>{{ __('Users') }}</th>
                            <th>{{ __('Permissions') }}</th>
                            <th>{{ __('Created') }}</th>
                            <th>{{ __('Actions') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse(($roles ?? []) as $role)
                            <tr>
                                <td>
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                            {{ substr($role['name'] ?? 'R', 0, 1) }}
                                        </div>
                                        <div>
                                            <p class="font-medium">{{ $role['name'] ?? __('Unknown Role') }}</p>
                                            <p class="text-sm text-gray-600">{{ $role['display_name'] ?? '-' }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>{{ $role['description'] ?? '-' }}</td>
                                <td>
                                    <span class="badge badge-blue">{{ $role['users_count'] ?? 0 }} {{ __('users') }}</span>
                                </td>
                                <td>
                                    <span class="badge badge-green">{{ $role['permissions_count'] ?? 0 }} {{ __('permissions') }}</span>
                                </td>
                                <td>{{ $role['created_at'] ?? now()->format('M d, Y') }}</td>
                                <td>
                                    <div class="flex items-center gap-2">
                                        <a href="{{ route('ui.admin.roles.show', $role['id'] ?? 1) }}" class="btn btn-sm btn-blue">{{ __('View') }}</a>
                                        <a href="{{ route('ui.admin.roles.edit', $role['id'] ?? 1) }}" class="btn btn-sm btn-amber">{{ __('Edit') }}</a>
                                        @if(!($role['is_system'] ?? false))
                                            <form method="POST" action="{{ route('ui.admin.roles.destroy', $role['id'] ?? 1) }}" class="inline">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-sm btn-red" onclick="return confirm('{{ __('Are you sure?') }}')">
                                                    {{ __('Delete') }}
                                                </button>
                                            </form>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="text-center py-8">
                                    <div class="empty-state">
                                        <div class="empty-state-icon">🔐</div>
                                        <h3 class="empty-state-title">{{ __('No Roles Found') }}</h3>
                                        <p class="empty-state-text">{{ __('Create your first role to get started.') }}</p>
                                        <a href="{{ route('ui.admin.roles.create') }}" class="btn btn-blue mt-4">{{ __('Create Role') }}</a>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Permission Summary -->
    <div class="card mt-6">
        <div class="card-header">
            <h3 class="card-title">{{ __('Permission Summary') }}</h3>
            <a href="{{ route('ui.admin.roles.permissions') }}" class="btn btn-sm btn-blue">{{ __('Manage Permissions') }}</a>
        </div>
        <div class="card-content">
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                @foreach(($permission_groups ?? []) as $group)
                    <div class="p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-semibold">{{ $group['name'] ?? __('Group') }}</h4>
                            <span class="text-2xl">{{ $group['icon'] ?? '🔒' }}</span>
                        </div>
                        <p class="text-sm text-gray-600">{{ $group['permissions_count'] ?? 0 }} {{ __('permissions') }}</p>
                        <p class="text-xs text-gray-500 mt-1">{{ $group['description'] ?? __('Permission group') }}</p>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</div>
@endsection
