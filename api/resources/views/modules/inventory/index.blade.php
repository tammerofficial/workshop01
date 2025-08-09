@extends('layouts.app')

@section('title', 'Inventory')

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div class="p-5 bg-white rounded-xl border border-gray-200" x-data="{ qty: 10 }">
    <div class="text-sm text-gray-500">Fabric Rolls</div>
    <div class="mt-2 text-3xl font-bold">{{ 42 }}</div>
    <div class="mt-4 flex items-center gap-2">
      <button class="px-3 py-1 text-xs rounded border" @click="qty++">+</button>
      <button class="px-3 py-1 text-xs rounded border" @click="qty = Math.max(0, qty-1)">-</button>
      <span class="text-sm text-gray-500">Qty: <strong x-text="qty"></strong></span>
    </div>
  </div>
  <div class="p-5 bg-white rounded-xl border border-gray-200">
    <div class="text-sm text-gray-500">Materials</div>
    <ul class="mt-3 space-y-2 text-sm">
      <li class="flex items-center justify-between"><span>Buttons</span><span>150</span></li>
      <li class="flex items-center justify-between"><span>Zippers</span><span>88</span></li>
      <li class="flex items-center justify-between"><span>Thread</span><span>300</span></li>
    </ul>
  </div>
</div>
@endsection


