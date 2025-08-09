@extends('layouts.app')

@section('title', 'Orders')

@section('content')
<div x-data="{
  q: '',
  status: 'all',
  sort: { field: 'id', dir: 'asc' },
  orders: [
    { id: 1, client: 'Ahmed Ali', status: 'pending', total: 150, date: '2024-01-15', items: 3 },
    { id: 2, client: 'Sara Mohamed', status: 'in_progress', total: 280, date: '2024-01-14', items: 2 },
    { id: 3, client: 'Khalid Hassan', status: 'completed', total: 420, date: '2024-01-13', items: 4 },
    { id: 4, client: 'Fatima Ahmed', status: 'pending', total: 190, date: '2024-01-12', items: 1 },
    { id: 5, client: 'Omar Youssef', status: 'in_progress', total: 340, date: '2024-01-11', items: 3 },
    { id: 6, client: 'Noor Ibrahim', status: 'completed', total: 560, date: '2024-01-10', items: 5 },
    { id: 7, client: 'Hassan Ali', status: 'pending', total: 230, date: '2024-01-09', items: 2 },
    { id: 8, client: 'Layla Mahmoud', status: 'in_progress', total: 470, date: '2024-01-08', items: 4 }
  ],
  get filteredOrders() {
    return this.orders
      .filter(order => 
        (this.status === 'all' || order.status === this.status) &&
        (this.q === '' || 
         order.client.toLowerCase().includes(this.q.toLowerCase()) ||
         order.id.toString().includes(this.q))
      )
      .sort((a, b) => {
        const aVal = a[this.sort.field]
        const bVal = b[this.sort.field]
        return this.sort.dir === 'asc' 
          ? (aVal > bVal ? 1 : -1)
          : (aVal < bVal ? 1 : -1)
      })
  },
  toggleSort(field) {
    if (this.sort.field === field) {
      this.sort.dir = this.sort.dir === 'asc' ? 'desc' : 'asc'
    } else {
      this.sort.field = field
      this.sort.dir = 'asc'
    }
  },
  statusBadgeClass(status) {
    return {
      'pending': 'bg-amber-50 text-amber-700 border-amber-200',
      'in_progress': 'bg-blue-50 text-blue-700 border-blue-200',
      'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }[status]
  },
  statusText(status) {
    return {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed'
    }[status]
  }
}">
  <div class="bg-white rounded-xl border border-gray-200">
    <div class="p-4 border-b border-gray-200">
      <div class="flex flex-wrap items-center gap-3">
        <h3 class="font-semibold">Orders</h3>
        
        <!-- Status Filter -->
        <div class="flex items-center gap-2">
          <button 
            @click="status = 'all'"
            class="px-2 py-1 text-xs rounded border"
            :class="{ 'bg-gray-900 text-white': status === 'all' }">
            All
          </button>
          <button 
            @click="status = 'pending'"
            class="px-2 py-1 text-xs rounded border"
            :class="{ 'bg-gray-900 text-white': status === 'pending' }">
            Pending
          </button>
          <button 
            @click="status = 'in_progress'"
            class="px-2 py-1 text-xs rounded border"
            :class="{ 'bg-gray-900 text-white': status === 'in_progress' }">
            In Progress
          </button>
          <button 
            @click="status = 'completed'"
            class="px-2 py-1 text-xs rounded border"
            :class="{ 'bg-gray-900 text-white': status === 'completed' }">
            Completed
          </button>
        </div>

        <!-- Search -->
        <div class="ml-auto">
          <div class="relative">
            <input 
              x-model="q" 
              type="text" 
              placeholder="Search orders..." 
              class="pl-8 pr-3 py-2 rounded border text-sm" 
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b">
              <th class="py-3 pr-4">
                <button @click="toggleSort('id')" class="flex items-center gap-1 hover:text-gray-700">
                  #
                  <svg x-show="sort.field === 'id'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3" :class="{ 'rotate-180': sort.dir === 'desc' }">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </th>
              <th class="py-3 pr-4">
                <button @click="toggleSort('client')" class="flex items-center gap-1 hover:text-gray-700">
                  Client
                  <svg x-show="sort.field === 'client'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3" :class="{ 'rotate-180': sort.dir === 'desc' }">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </th>
              <th class="py-3 pr-4">Status</th>
              <th class="py-3 pr-4">
                <button @click="toggleSort('total')" class="flex items-center gap-1 hover:text-gray-700">
                  Total
                  <svg x-show="sort.field === 'total'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3" :class="{ 'rotate-180': sort.dir === 'desc' }">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </th>
              <th class="py-3 pr-4">
                <button @click="toggleSort('date')" class="flex items-center gap-1 hover:text-gray-700">
                  Date
                  <svg x-show="sort.field === 'date'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3" :class="{ 'rotate-180': sort.dir === 'desc' }">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </th>
              <th class="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <template x-for="order in filteredOrders" :key="order.id">
              <tr class="border-b">
                <td class="py-3 pr-4" x-text="'#' + order.id"></td>
                <td class="py-3 pr-4">
                  <div x-text="order.client"></div>
                  <div class="text-xs text-gray-500" x-text="order.items + ' items'"></div>
                </td>
                <td class="py-3 pr-4">
                  <span 
                    class="inline-flex items-center px-2 py-1 text-xs rounded border" 
                    :class="statusBadgeClass(order.status)"
                    x-text="statusText(order.status)">
                  </span>
                </td>
                <td class="py-3 pr-4" x-text="'$' + order.total"></td>
                <td class="py-3 pr-4" x-text="order.date"></td>
                <td class="py-3 pr-4">
                  <div class="flex items-center gap-2">
                    <button class="p-1 text-blue-600 hover:text-blue-700 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>
                    <button class="p-1 text-emerald-600 hover:text-emerald-700 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </template>
            <tr x-show="filteredOrders.length === 0">
              <td colspan="6" class="py-8 text-center text-gray-500">
                No orders found matching your criteria
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
@endsection


