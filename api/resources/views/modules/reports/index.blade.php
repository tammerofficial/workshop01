@extends('layouts.app')

@section('title', 'Reports')

@section('content')
<div class="bg-white rounded-xl border border-gray-200 p-5">
  <div class="flex items-center justify-between">
    <h3 class="font-semibold">Reports</h3>
    <div x-data="{ from: '', to: '' }" class="flex items-center gap-2">
      <input x-model="from" type="date" class="px-3 py-2 rounded border text-sm" />
      <input x-model="to" type="date" class="px-3 py-2 rounded border text-sm" />
      <button class="px-3 py-2 rounded border text-sm">Filter</button>
    </div>
  </div>
  <div class="mt-4 text-sm text-gray-600">Static sample reports table for preview.</div>
  <div class="mt-4 overflow-x-auto">
    <table class="min-w-full text-sm">
      <thead>
        <tr class="text-left text-gray-500">
          <th class="py-2 pr-4">Report</th>
          <th class="py-2 pr-4">Period</th>
          <th class="py-2 pr-4">Generated</th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-t">
          <td class="py-2 pr-4">Orders Summary</td>
          <td class="py-2 pr-4">Last 30 days</td>
          <td class="py-2 pr-4">Today</td>
        </tr>
        <tr class="border-t">
          <td class="py-2 pr-4">Inventory Turnover</td>
          <td class="py-2 pr-4">Q1 2025</td>
          <td class="py-2 pr-4">Yesterday</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
@endsection


