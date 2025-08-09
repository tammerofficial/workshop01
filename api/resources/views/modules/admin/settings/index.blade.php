@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
    <header class="page-header">
        <h2 class="page-title">{{ __('System Settings') }}</h2>
        <p class="page-description">{{ __('Configure system-wide settings and preferences.') }}</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Settings Navigation -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">{{ __('Settings Categories') }}</h3>
            </div>
            <div class="card-content">
                <nav class="space-y-2">
                    <a href="{{ route('ui.admin.settings.general') }}" class="block px-3 py-2 rounded @if(request()->routeIs('ui.admin.settings.general')) bg-blue-100 text-blue-700 @else text-gray-700 hover:bg-gray-100 @endif">
                        <span class="mr-2">⚙️</span>
                        {{ __('General') }}
                    </a>
                    <a href="{{ route('ui.admin.settings.email') }}" class="block px-3 py-2 rounded @if(request()->routeIs('ui.admin.settings.email')) bg-blue-100 text-blue-700 @else text-gray-700 hover:bg-gray-100 @endif">
                        <span class="mr-2">📧</span>
                        {{ __('Email') }}
                    </a>
                    <a href="{{ route('ui.admin.settings.notifications') }}" class="block px-3 py-2 rounded @if(request()->routeIs('ui.admin.settings.notifications')) bg-blue-100 text-blue-700 @else text-gray-700 hover:bg-gray-100 @endif">
                        <span class="mr-2">🔔</span>
                        {{ __('Notifications') }}
                    </a>
                    <a href="{{ route('ui.admin.settings.backup') }}" class="block px-3 py-2 rounded @if(request()->routeIs('ui.admin.settings.backup')) bg-blue-100 text-blue-700 @else text-gray-700 hover:bg-gray-100 @endif">
                        <span class="mr-2">💾</span>
                        {{ __('Backup') }}
                    </a>
                    <a href="{{ route('ui.admin.settings.security') }}" class="block px-3 py-2 rounded @if(request()->routeIs('ui.admin.settings.security')) bg-blue-100 text-blue-700 @else text-gray-700 hover:bg-gray-100 @endif">
                        <span class="mr-2">🔒</span>
                        {{ __('Security') }}
                    </a>
                </nav>
            </div>
        </div>

        <!-- Settings Content -->
        <div class="lg:col-span-3">
            <!-- General Settings -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">{{ __('General Settings') }}</h3>
                    <button class="btn btn-blue">{{ __('Save Changes') }}</button>
                </div>
                <div class="card-content">
                    <form class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">{{ __('Application Name') }}</label>
                                <input type="text" class="form-input" value="{{ $settings['app_name'] ?? 'Workshop Pro' }}" placeholder="{{ __('Enter application name') }}">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">{{ __('Default Language') }}</label>
                                <select class="form-select">
                                    <option value="en" @if(($settings['default_language'] ?? 'en') === 'en') selected @endif>{{ __('English') }}</option>
                                    <option value="ar" @if(($settings['default_language'] ?? 'en') === 'ar') selected @endif>{{ __('Arabic') }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">{{ __('Default Currency') }}</label>
                                <select class="form-select">
                                    <option value="USD" @if(($settings['default_currency'] ?? 'USD') === 'USD') selected @endif>{{ __('US Dollar (USD)') }}</option>
                                    <option value="KWD" @if(($settings['default_currency'] ?? 'USD') === 'KWD') selected @endif>{{ __('Kuwaiti Dinar (KWD)') }}</option>
                                    <option value="EUR" @if(($settings['default_currency'] ?? 'USD') === 'EUR') selected @endif>{{ __('Euro (EUR)') }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">{{ __('Timezone') }}</label>
                                <select class="form-select">
                                    <option value="UTC" @if(($settings['timezone'] ?? 'UTC') === 'UTC') selected @endif>{{ __('UTC') }}</option>
                                    <option value="Asia/Kuwait" @if(($settings['timezone'] ?? 'UTC') === 'Asia/Kuwait') selected @endif>{{ __('Kuwait') }}</option>
                                    <option value="America/New_York" @if(($settings['timezone'] ?? 'UTC') === 'America/New_York') selected @endif>{{ __('New York') }}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ __('Company Description') }}</label>
                            <textarea class="form-textarea" rows="3" placeholder="{{ __('Enter company description') }}">{{ $settings['company_description'] ?? '' }}</textarea>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" class="form-checkbox" @if($settings['maintenance_mode'] ?? false) checked @endif>
                                    <span class="ml-2 text-sm font-medium text-gray-700">{{ __('Maintenance Mode') }}</span>
                                </label>
                                <p class="text-xs text-gray-500 mt-1">{{ __('Enable to put the system in maintenance mode') }}</p>
                            </div>
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" class="form-checkbox" @if($settings['registration_enabled'] ?? true) checked @endif>
                                    <span class="ml-2 text-sm font-medium text-gray-700">{{ __('Allow Registration') }}</span>
                                </label>
                                <p class="text-xs text-gray-500 mt-1">{{ __('Allow new users to register') }}</p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Recent Activities -->
            <div class="card mt-6">
                <div class="card-header">
                    <h3 class="card-title">{{ __('Recent Configuration Changes') }}</h3>
                </div>
                <div class="card-content">
                    <div class="space-y-3">
                        @forelse(($recent_changes ?? []) as $change)
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div>
                                    <p class="font-medium">{{ $change['setting'] ?? __('Setting Changed') }}</p>
                                    <p class="text-sm text-gray-600">{{ $change['description'] ?? __('Configuration updated') }}</p>
                                    <p class="text-xs text-gray-500">{{ __('By') }} {{ $change['user'] ?? __('Unknown') }} • {{ $change['timestamp'] ?? now()->format('M d, Y H:i') }}</p>
                                </div>
                                <span class="badge badge-blue">{{ __('Updated') }}</span>
                            </div>
                        @empty
                            <div class="empty-state">
                                <div class="empty-state-icon">📝</div>
                                <h4 class="empty-state-title">{{ __('No Recent Changes') }}</h4>
                                <p class="empty-state-text">{{ __('Configuration changes will appear here.') }}</p>
                            </div>
                        @endforelse
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
