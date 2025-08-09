# PowerShell - Generate Blade Files in Bulk (English-only, DB-ready)
# Usage: powershell -ExecutionPolicy Bypass -File ps_generate_blade_files.ps1 [-Force]

param(
  [switch]$Force
)

$ErrorActionPreference = 'Stop'

function Log([string]$msg) {
  $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  $logDir = Join-Path (Get-Location) 'storage\logs'
  if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
  $logFile = Join-Path $logDir ("cursor_log_{0}.txt" -f (Get-Date -Format 'yyyyMMdd'))
  Add-Content -Path $logFile -Value "[$ts] $msg"
}

function Write-TextFile($relativePath, [string]$content, [switch]$overwrite) {
  $fullPath = Join-Path (Get-Location) $relativePath
  $dir = Split-Path -Parent $fullPath
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  if ((Test-Path $fullPath) -and -not $overwrite) {
    Log "SKIP (exists): $relativePath"
    return $false
  }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($fullPath, $content, $utf8NoBom)
  Log "WROTE: $relativePath"
  return $true
}

try {
  Log '=== Generate Blade Files: START ==='

  $files = @()

  # Dashboard index
  $files += @{ Path = 'resources/views/modules/dashboard/index.blade.php'; Content = @'
@extends('layouts.app')

@section('title', __('Dashboard'))

@section('content')
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-header">
      <div class="stat-title">{{ __('Total Orders') }}</div>
      <span class="stat-badge badge-info">+12%</span>
    </div>
    <div class="stat-value">{{ number_format($stats['total_orders'] ?? 0) }}</div>
    <div class="stat-indicator"><div class="stat-dot" style="background:#3b82f6"></div><span>{{ __('Live updates') }}</span></div>
  </div>
  <div class="stat-card">
    <div class="stat-header">
      <div class="stat-title">{{ __('In Production') }}</div>
      <span class="stat-badge badge-warning">+5%</span>
    </div>
    <div class="stat-value">{{ number_format($stats['in_production'] ?? 0) }}</div>
    <div class="stat-indicator"><div class="stat-dot" style="background:#f59e0b"></div><span>{{ __('Live tracking') }}</span></div>
  </div>
  <div class="stat-card">
    <div class="stat-header">
      <div class="stat-title">{{ __('Completed') }}</div>
      <span class="stat-badge badge-success">+8%</span>
    </div>
    <div class="stat-value">{{ number_format($stats['completed'] ?? 0) }}</div>
    <div class="stat-indicator"><div class="stat-dot" style="background:#10b981"></div><span>{{ __('Real-time data') }}</span></div>
  </div>
  <div class="stat-card">
    <div class="stat-header">
      <div class="stat-title">{{ __('Revenue') }}</div>
      <span class="stat-badge" style="background:rgba(168,85,247,.1);color:#7c3aed;border-color:rgba(168,85,247,.2)">+15%</span>
    </div>
    <div class="stat-value">${{ number_format($stats['revenue'] ?? 0) }}</div>
    <div class="stat-indicator"><div class="stat-dot" style="background:#8b5cf6"></div><span>{{ __('Instant updates') }}</span></div>
  </div>
</div>

<div class="card">
  <div class="card-header">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-gray-900">{{ __('Recent Activity') }}</h3>
      <span class="badge badge-info">{{ __('Live') }}</span>
    </div>
  </div>
  <div class="card-content">
    @forelse(($recentOrders ?? []) as $order)
    <div class="activity-item">
      <div class="activity-icon {{ $order->status === 'completed' ? 'bg-emerald-500' : ($order->status === 'in_progress' ? 'bg-amber-500' : 'bg-blue-500') }}">📦</div>
      <div class="activity-content">
        <div class="activity-title">{{ __('Order') }} #{{ $order->id }} - {{ $order->client->name ?? __('No Client') }}</div>
        <div class="activity-time">{{ optional($order->created_at)->diffForHumans() }}</div>
      </div>
    </div>
    @empty
    <div class="empty-state">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2"/></svg>
      <p>{{ __('No recent orders found') }}</p>
    </div>
    @endforelse
  </div>
</div>
@endsection
'@ }

  # Orders index
  $files += @{ Path = 'resources/views/modules/orders/index.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Orders'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Orders') }}</h3></div>
  <div class="card-content">
    <div class="table-container">
      <table class="table">
        <thead><tr>
          <th>#</th><th>{{ __('Client') }}</th><th>{{ __('Status') }}</th><th>{{ __('Total') }}</th><th>{{ __('Date') }}</th><th>{{ __('Actions') }}</th>
        </tr></thead>
        <tbody>
        @forelse(($orders ?? []) as $order)
          <tr>
            <td>#{{ $order->id }}</td>
            <td><div class="font-medium">{{ $order->client->name ?? __('No Client') }}</div><div class="text-xs text-gray-500">{{ $order->title ?? __('No Title') }}</div></td>
            <td><span class="badge {{ $order->status==='completed' ? 'badge-success' : ($order->status==='in_progress' ? 'badge-info' : ($order->status==='pending' ? 'badge-warning' : 'badge-danger')) }}">{{ ucfirst($order->status ?? 'unknown') }}</span></td>
            <td class="font-semibold">${{ number_format($order->final_amount ?? 0) }}</td>
            <td>{{ optional($order->created_at)->format('Y-m-d') }}</td>
            <td><div class="flex gap-2"><button class="btn btn-primary">{{ __('View') }}</button></div></td>
          </tr>
        @empty
          <tr><td colspan="6"><div class="empty-state"><p>{{ __('No orders found') }}</p></div></td></tr>
        @endforelse
        </tbody>
      </table>
    </div>
  </div>
</div>
@endsection
'@ }

  # Workers index
  $files += @{ Path = 'resources/views/modules/workers/index.blade.php'; Content = @'
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
'@ }

  # Inventory index
  $files += @{ Path = 'resources/views/modules/inventory/index.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Inventory'))
@section('content')
<div class="card">
  <div class="card-header"><div class="flex items-center justify-between"><h3 class="font-semibold text-gray-900">{{ __('Inventory') }}</h3></div></div>
  <div class="card-content">
    @if(($inventoryItems ?? collect())->count() > 0)
    <div class="table-container">
      <table class="table">
        <thead><tr>
          <th>{{ __('Name') }}</th><th>{{ __('Category') }}</th><th>{{ __('Quantity') }}</th><th>{{ __('Unit') }}</th><th>{{ __('Status') }}</th>
        </tr></thead>
        <tbody>
        @foreach($inventoryItems as $item)
          <tr>
            <td><div class="font-medium">{{ $item->name }}</div><div class="text-xs text-gray-500">{{ $item->description ?? __('No Description') }}</div></td>
            <td><span class="badge badge-info">{{ $item->category->name ?? __('No Category') }}</span></td>
            <td class="font-semibold">{{ number_format($item->quantity ?? 0) }}</td>
            <td>{{ $item->unit ?? __('Unit') }}</td>
            <td><span class="badge {{ $item->quantity <= 0 ? 'badge-danger' : ($item->quantity <= ($item->minimum_quantity ?? 0) ? 'badge-warning' : 'badge-success') }}">{{ $item->quantity <= 0 ? __('Out of Stock') : ($item->quantity <= ($item->minimum_quantity ?? 0) ? __('Low Stock') : __('In Stock')) }}</span></td>
          </tr>
        @endforeach
        </tbody>
      </table>
    </div>
    @else
      <div class="empty-state"><p>{{ __('No inventory items found') }}</p></div>
    @endif
  </div>
</div>
@endsection
'@ }

  # Reports index
  $files += @{ Path = 'resources/views/modules/reports/index.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Reports'))
@section('content')
<div class="stats-grid mb-8">
  <div class="stat-card"><div class="stat-header"><div class="stat-title">{{ __('Total Orders') }}</div><span class="stat-badge badge-info">{{ __('All Time') }}</span></div><div class="stat-value">{{ number_format($ordersCount ?? 0) }}</div></div>
  <div class="stat-card"><div class="stat-header"><div class="stat-title">{{ __('Total Workers') }}</div><span class="stat-badge badge-success">{{ __('Active') }}</span></div><div class="stat-value">{{ number_format($workersCount ?? 0) }}</div></div>
  <div class="stat-card"><div class="stat-header"><div class="stat-title">{{ __('Inventory Items') }}</div><span class="stat-badge" style="background:rgba(168,85,247,.1);color:#7c3aed;border-color:rgba(168,85,247,.2)">{{ __('Available') }}</span></div><div class="stat-value">{{ number_format($inventoryCount ?? 0) }}</div></div>
</div>
@endsection
'@ }

  # Payroll index
  $files += @{ Path = 'resources/views/modules/payroll/index.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Payroll'))
@section('content')
<div class="card">
  <div class="card-header"><div class="flex items-center justify-between"><h3 class="font-semibold text-gray-900">{{ __('Payroll') }}</h3></div></div>
  <div class="card-content">
    <div class="table-container">
      <table class="table">
        <thead><tr>
          <th>{{ __('Employee') }}</th><th>{{ __('Position') }}</th><th>{{ __('Basic Salary') }}</th><th>{{ __('Net Salary') }}</th><th>{{ __('Status') }}</th>
        </tr></thead>
        <tbody>
        @forelse(($payrolls ?? []) as $payroll)
          <tr>
            <td><div class="font-medium">{{ $payroll->worker->name ?? __('Unknown Worker') }}</div><div class="text-xs text-gray-500">{{ $payroll->period ?? __('No Period') }}</div></td>
            <td><span class="badge badge-info">{{ $payroll->worker->specialty ?? __('No Position') }}</span></td>
            <td class="font-semibold">${{ number_format($payroll->basic_salary ?? 0) }}</td>
            <td class="font-bold text-green-600">${{ number_format($payroll->net_salary ?? 0) }}</td>
            <td><span class="badge {{ ($payroll->status ?? 'pending') === 'paid' ? 'badge-success' : 'badge-warning' }}">{{ ucfirst($payroll->status ?? 'pending') }}</span></td>
          </tr>
        @empty
          <tr><td colspan="5"><div class="empty-state"><p>{{ __('No payroll records found') }}</p></div></td></tr>
        @endforelse
        </tbody>
      </table>
    </div>
  </div>
</div>
@endsection
'@ }

  # Biometrics index
  $files += @{ Path = 'resources/views/modules/biometrics/index.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Biometric Records'))
@section('content')
<div class="card">
  <div class="card-header"><div class="flex items-center justify-between"><h3 class="font-semibold text-gray-900">{{ __('Biometric Records') }}</h3></div></div>
  <div class="card-content">
    <div class="table-container">
      <table class="table">
        <thead><tr>
          <th>{{ __('Employee') }}</th><th>{{ __('Date') }}</th><th>{{ __('Check In') }}</th><th>{{ __('Check Out') }}</th><th>{{ __('Total Hours') }}</th><th>{{ __('Status') }}</th>
        </tr></thead>
        <tbody>
        @forelse(($records ?? []) as $record)
          <tr>
            <td><div class="font-medium">{{ $record->worker->name ?? __('Unknown Worker') }}</div><div class="text-xs text-gray-500">{{ $record->worker->department ?? __('No Department') }}</div></td>
            <td>{{ $record->attendance_date ?? __('No Date') }}</td>
            <td class="font-mono">{{ $record->check_in_time ?? __('--:--') }}</td>
            <td class="font-mono">{{ $record->check_out_time ?? __('--:--') }}</td>
            <td class="font-semibold">{{ $record->total_hours ?? '0' }}</td>
            <td><span class="badge {{ ($record->attendance_status ?? 'absent') === 'present' ? 'badge-success' : (($record->attendance_status ?? 'absent') === 'late' ? 'badge-warning' : 'badge-danger') }}">{{ ucfirst($record->attendance_status ?? 'absent') }}</span></td>
          </tr>
        @empty
          <tr><td colspan="6"><div class="empty-state"><p>{{ __('No biometric records found') }}</p></div></td></tr>
        @endforelse
        </tbody>
      </table>
    </div>
  </div>
</div>
@endsection
'@ }

  # -------------------- CRUD: Orders --------------------
  $files += @{ Path = 'resources/views/modules/orders/create.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Create Order'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Create Order') }}</h3></div>
  <div class="card-content">
    <form method="post" action="{{ url()->current() }}" class="space-y-4">
      @csrf
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium">{{ __('Client ID') }}</label>
          <input type="number" name="client_id" class="w-full rounded-lg border p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium">{{ __('Assigned Worker ID') }}</label>
          <input type="number" name="assigned_worker_id" class="w-full rounded-lg border p-2" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">{{ __('Title') }}</label>
          <input type="text" name="title" class="w-full rounded-lg border p-2" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">{{ __('Description') }}</label>
          <textarea name="description" class="w-full rounded-lg border p-2" rows="4"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium">{{ __('Delivery Date') }}</label>
          <input type="date" name="delivery_date" class="w-full rounded-lg border p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium">{{ __('Deposit Amount') }}</label>
          <input type="number" step="0.01" name="deposit_amount" class="w-full rounded-lg border p-2" />
        </div>
      </div>
      <div class="mt-6"><button class="btn btn-primary">{{ __('Save') }}</button></div>
    </form>
  </div>
</div>
@endsection
'@ }
  $files += @{ Path = 'resources/views/modules/orders/edit.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Edit Order'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Edit Order') }}</h3></div>
  <div class="card-content">
    <form method="post" action="{{ url()->current() }}" class="space-y-4">
      @csrf
      @method('put')
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium">{{ __('Title') }}</label>
          <input type="text" name="title" value="{{ old('title', $order->title ?? '') }}" class="w-full rounded-lg border p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium">{{ __('Delivery Date') }}</label>
          <input type="date" name="delivery_date" value="{{ old('delivery_date', optional($order->delivery_date)->format('Y-m-d')) }}" class="w-full rounded-lg border p-2" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">{{ __('Description') }}</label>
          <textarea name="description" class="w-full rounded-lg border p-2" rows="4">{{ old('description', $order->description ?? '') }}</textarea>
        </div>
      </div>
      <div class="mt-6"><button class="btn btn-primary">{{ __('Update') }}</button></div>
    </form>
  </div>
</div>
@endsection
'@ }
  $files += @{ Path = 'resources/views/modules/orders/show.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Order Details'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Order') }} #{{ $order->id ?? '-' }}</h3></div>
  <div class="card-content">
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <div class="mb-2 font-semibold">{{ __('Client') }}</div>
        <div>{{ $order->client->name ?? __('No Client') }}</div>
      </div>
      <div>
        <div class="mb-2 font-semibold">{{ __('Status') }}</div>
        <div><span class="badge badge-info">{{ ucfirst($order->status ?? 'unknown') }}</span></div>
      </div>
      <div>
        <div class="mb-2 font-semibold">{{ __('Final Amount') }}</div>
        <div>${{ number_format($order->final_amount ?? 0, 2) }}</div>
      </div>
      <div>
        <div class="mb-2 font-semibold">{{ __('Delivery Date') }}</div>
        <div>{{ optional($order->delivery_date)->format('Y-m-d') }}</div>
      </div>
      <div class="md:col-span-2">
        <div class="mb-2 font-semibold">{{ __('Description') }}</div>
        <div class="text-gray-700">{{ $order->description ?? '-' }}</div>
      </div>
    </div>
  </div>
</div>
@endsection
'@ }

  # -------------------- CRUD: Workers --------------------
  $files += @{ Path = 'resources/views/modules/workers/create.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Add Worker'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Add Worker') }}</h3></div>
  <div class="card-content">
    <form method="post" action="{{ url()->current() }}" class="grid md:grid-cols-2 gap-4">
      @csrf
      <div><label class="block text-sm font-medium">{{ __('Name') }}</label><input name="name" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Email') }}</label><input name="email" type="email" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Department') }}</label><input name="department" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Specialty') }}</label><input name="specialty" class="w-full rounded-lg border p-2" /></div>
      <div class="md:col-span-2 mt-4"><button class="btn btn-primary">{{ __('Save') }}</button></div>
    </form>
  </div>
</div>
@endsection
'@ }
  $files += @{ Path = 'resources/views/modules/workers/edit.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Edit Worker'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Edit Worker') }}</h3></div>
  <div class="card-content">
    <form method="post" action="{{ url()->current() }}" class="grid md:grid-cols-2 gap-4">
      @csrf
      @method('put')
      <div><label class="block text-sm font-medium">{{ __('Name') }}</label><input name="name" value="{{ old('name', $worker->name ?? '') }}" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Email') }}</label><input name="email" type="email" value="{{ old('email', $worker->email ?? '') }}" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Department') }}</label><input name="department" value="{{ old('department', $worker->department ?? '') }}" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Specialty') }}</label><input name="specialty" value="{{ old('specialty', $worker->specialty ?? '') }}" class="w-full rounded-lg border p-2" /></div>
      <div class="md:col-span-2 mt-4"><button class="btn btn-primary">{{ __('Update') }}</button></div>
    </form>
  </div>
</div>
@endsection
'@ }
  $files += @{ Path = 'resources/views/modules/workers/show.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Worker Details'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Worker') }} #{{ $worker->id ?? '-' }}</h3></div>
  <div class="card-content">
    <div class="grid md:grid-cols-2 gap-6">
      <div><div class="mb-2 font-semibold">{{ __('Name') }}</div><div>{{ $worker->name ?? '-' }}</div></div>
      <div><div class="mb-2 font-semibold">{{ __('Email') }}</div><div>{{ $worker->email ?? '-' }}</div></div>
      <div><div class="mb-2 font-semibold">{{ __('Department') }}</div><div>{{ $worker->department ?? '-' }}</div></div>
      <div><div class="mb-2 font-semibold">{{ __('Specialty') }}</div><div>{{ $worker->specialty ?? '-' }}</div></div>
    </div>
  </div>
</div>
@endsection
'@ }

  # -------------------- CRUD: Inventory --------------------
  $files += @{ Path = 'resources/views/modules/inventory/create.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Add Item'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Add Item') }}</h3></div>
  <div class="card-content">
    <form method="post" action="{{ url()->current() }}" class="grid md:grid-cols-2 gap-4">
      @csrf
      <div><label class="block text-sm font-medium">{{ __('Name') }}</label><input name="name" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Quantity') }}</label><input name="quantity" type="number" step="0.001" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Unit') }}</label><input name="unit" class="w-full rounded-lg border p-2" /></div>
      <div class="md:col-span-2"><label class="block text-sm font-medium">{{ __('Description') }}</label><textarea name="description" class="w-full rounded-lg border p-2" rows="4"></textarea></div>
      <div class="md:col-span-2 mt-4"><button class="btn btn-primary">{{ __('Save') }}</button></div>
    </form>
  </div>
</div>
@endsection
'@ }
  $files += @{ Path = 'resources/views/modules/inventory/edit.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Edit Item'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Edit Item') }}</h3></div>
  <div class="card-content">
    <form method="post" action="{{ url()->current() }}" class="grid md:grid-cols-2 gap-4">
      @csrf
      @method('put')
      <div><label class="block text-sm font-medium">{{ __('Name') }}</label><input name="name" value="{{ old('name', $item->name ?? '') }}" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Quantity') }}</label><input name="quantity" type="number" step="0.001" value="{{ old('quantity', $item->quantity ?? 0) }}" class="w-full rounded-lg border p-2" /></div>
      <div><label class="block text-sm font-medium">{{ __('Unit') }}</label><input name="unit" value="{{ old('unit', $item->unit ?? '') }}" class="w-full rounded-lg border p-2" /></div>
      <div class="md:col-span-2"><label class="block text-sm font-medium">{{ __('Description') }}</label><textarea name="description" class="w-full rounded-lg border p-2" rows="4">{{ old('description', $item->description ?? '') }}</textarea></div>
      <div class="md:col-span-2 mt-4"><button class="btn btn-primary">{{ __('Update') }}</button></div>
    </form>
  </div>
</div>
@endsection
'@ }
  $files += @{ Path = 'resources/views/modules/inventory/show.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Item Details'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ $item->name ?? __('Item') }}</h3></div>
  <div class="card-content">
    <div class="grid md:grid-cols-2 gap-6">
      <div><div class="mb-2 font-semibold">{{ __('Quantity') }}</div><div>{{ number_format($item->quantity ?? 0) }} {{ $item->unit ?? '' }}</div></div>
      <div><div class="mb-2 font-semibold">{{ __('Status') }}</div><div><span class="badge badge-info">{{ $item->status ?? '-' }}</span></div></div>
      <div class="md:col-span-2"><div class="mb-2 font-semibold">{{ __('Description') }}</div><div class="text-gray-700">{{ $item->description ?? '-' }}</div></div>
    </div>
  </div>
</div>
@endsection
'@ }

  # -------------------- CRUD: Payroll --------------------
  $files += @{ Path = 'resources/views/modules/payroll/show.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Payslip'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Payslip') }} - {{ $payroll->period ?? '' }}</h3></div>
  <div class="card-content">
    <div class="grid md:grid-cols-2 gap-6">
      <div><div class="mb-2 font-semibold">{{ __('Employee') }}</div><div>{{ $payroll->worker->name ?? '-' }}</div></div>
      <div><div class="mb-2 font-semibold">{{ __('Net Salary') }}</div><div class="font-bold text-green-600">${{ number_format($payroll->net_salary ?? 0, 2) }}</div></div>
      <div class="md:col-span-2"><div class="mb-2 font-semibold">{{ __('Status') }}</div><div><span class="badge badge-info">{{ ucfirst($payroll->payment_status ?? 'pending') }}</span></div></div>
    </div>
  </div>
</div>
@endsection
'@ }

  # -------------------- CRUD: Biometrics --------------------
  $files += @{ Path = 'resources/views/modules/biometrics/show.blade.php'; Content = @'
@extends('layouts.app')
@section('title', __('Attendance Day'))
@section('content')
<div class="card">
  <div class="card-header"><h3 class="font-semibold">{{ __('Attendance') }} - {{ optional($record->attendance_date)->format('Y-m-d') }}</h3></div>
  <div class="card-content">
    <div class="grid md:grid-cols-2 gap-6">
      <div><div class="mb-2 font-semibold">{{ __('Employee') }}</div><div>{{ $record->worker->name ?? '-' }}</div></div>
      <div><div class="mb-2 font-semibold">{{ __('Status') }}</div><div><span class="badge badge-info">{{ ucfirst($record->attendance_status ?? 'unknown') }}</span></div></div>
      <div><div class="mb-2 font-semibold">{{ __('Check In') }}</div><div class="font-mono">{{ $record->check_in_time ?? '--:--' }}</div></div>
      <div><div class="mb-2 font-semibold">{{ __('Check Out') }}</div><div class="font-mono">{{ $record->check_out_time ?? '--:--' }}</div></div>
      <div class="md:col-span-2"><div class="mb-2 font-semibold">{{ __('Total Hours') }}</div><div>{{ $record->total_hours ?? '0' }}</div></div>
    </div>
  </div>
</div>
@endsection
'@ }

  # Write files
  $created = 0
  foreach ($f in $files) {
    if (Write-TextFile -relativePath $f.Path -content $f.Content -overwrite:$Force) { $created++ }
  }

  Log ("Blade files created: $created; force: " + ($Force.IsPresent))

  # Clear views cache
  Log 'Running php artisan view:clear'
  & php artisan view:clear | Out-Null

  Log '=== Generate Blade Files: DONE ==='
  Write-Output ("Blade generation completed. Created: {0}, Force: {1}" -f $created, $Force.IsPresent)
}
catch {
  Log "ERROR: $($_.Exception.Message)"
  Write-Error $_.Exception.Message
  exit 1
}
