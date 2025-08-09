@extends('layouts.app')

@section('title', 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¹Ù…Ø§Ù„')

@section('content')
<div x-data="{
    search: '',
    workers: [
        { id: 1, name: 'Ø£Ø­Ù…Ø¯ Ù…Ø­Ù…ÙˆØ¯', role: 'Ø®ÙŠØ§Ø·', status: 'active', department: 'Ø§Ù„Ø®ÙŠØ§Ø·Ø©', hire_date: '2023-01-15' },
        { id: 2, name: 'ÙØ§Ø·Ù…Ø© Ø¹Ù„ÙŠ', role: 'Ù…ØµÙ…Ù…', status: 'active', department: 'Ø§Ù„ØªØµÙ…ÙŠÙ…', hire_date: '2022-11-20' },
        { id: 3, name: 'Ø®Ø§Ù„Ø¯ Ø¹Ø¨Ø¯Ø§Ù„Ù„Ù‡', role: 'Ø¹Ø§Ù…Ù„ Ø§Ù†ØªØ§Ø¬', status: 'inactive', department: 'Ø§Ù„Ø¥Ù†ØªØ§Ø¬', hire_date: '2023-03-10' },
        { id: 4, name: 'Ø³Ø§Ø±Ø© Ø­Ø³ÙŠÙ†', role: 'Ù…Ø¯ÙŠØ± Ø¬ÙˆØ¯Ø©', status: 'active', department: 'Ø§Ù„Ø¬ÙˆØ¯Ø©', hire_date: '2021-09-01' }
    ],
    get filteredWorkers() {
        if (this.search === '') {
            return this.workers;
        }
        return this.workers.filter(worker => 
            worker.name.toLowerCase().includes(this.search.toLowerCase()) ||
            worker.role.toLowerCase().includes(this.search.toLowerCase())
        );
    }
}">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¹Ù…Ø§Ù„</h1>
        <a href="{{ route('ui.workers.create') }}" class="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>
            <span>Ø¥Ø¶Ø§ÙØ© Ø¹Ø§Ù…Ù„ Ø¬Ø¯ÙŠØ¯</span>
        </a>
    </div>

    <!-- Search and Filters -->
    <div class="mb-4">
        <input x-model="search" type="text" placeholder="Ø§Ø¨Ø­Ø« Ø¹Ù† Ø¹Ø§Ù…Ù„..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
    </div>

    <!-- Workers Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ø§Ù„Ø§Ø³Ù…</th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ø§Ù„ÙˆØ¸ÙŠÙØ©</th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ø§Ù„Ø­Ø§Ù„Ø©</th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ØªØ§Ø±ÙŠØ® Ø§Ù„ØªØ¹ÙŠÙŠÙ†</th>
                    <th scope="col" class="relative px-6 py-3"><span class="sr-only">Edit</span></th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <template x-for="worker in filteredWorkers" :key="worker.id">
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="text-sm font-medium text-gray-900" x-text="worker.name"></div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" x-text="worker.role"></td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                                :class="worker.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                                x-text="worker.status === 'active' ? 'Ù†Ø´Ø·' : 'ØºÙŠØ± Ù†Ø´Ø·'">
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" x-text="worker.hire_date"></td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href="#" class="text-blue-600 hover:text-blue-900">ØªØ¹Ø¯ÙŠÙ„</a>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
</div>
@endsection
