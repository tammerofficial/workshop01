@extends('layouts.app')

@section('title', 'Ø¥Ø¶Ø§ÙØ© Ø¹Ø§Ù…Ù„ Ø¬Ø¯ÙŠØ¯')

@section('content')
<div class="max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Ø¥Ø¶Ø§ÙØ© Ø¹Ø§Ù…Ù„ Ø¬Ø¯ÙŠØ¯</h1>
        <a href="{{ route('ui.workers.index') }}" class="text-sm text-gray-600 hover:text-gray-900">
            &larr; Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø¹Ù…Ø§Ù„
        </a>
    </div>
    
    <div class="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <form action="#" method="POST" class="space-y-6">
            @csrf
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„</label>
                <input type="text" name="name" id="name" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg" required>
            </div>
            <div>
                <label for="role" class="block text-sm font-medium text-gray-700">Ø§Ù„ÙˆØ¸ÙŠÙØ©</label>
                <input type="text" name="role" id="role" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg" required>
            </div>
            <div>
                <label for="department" class="block text-sm font-medium text-gray-700">Ø§Ù„Ù‚Ø³Ù…</label>
                <select id="department" name="department" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option>Ø§Ù„Ø®ÙŠØ§Ø·Ø©</option>
                    <option>Ø§Ù„ØªØµÙ…ÙŠÙ…</option>
                    <option>Ø§Ù„Ø¥Ù†ØªØ§Ø¬</option>
                    <option>Ø§Ù„Ø¬ÙˆØ¯Ø©</option>
                </select>
            </div>
            <div>
                <label for="hire_date" class="block text-sm font-medium text-gray-700">ØªØ§Ø±ÙŠØ® Ø§Ù„ØªØ¹ÙŠÙŠÙ†</label>
                <input type="date" name="hire_date" id="hire_date" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg" required>
            </div>
            <div class="flex justify-end pt-4">
                <button type="submit" class="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    Ø­ÙØ¸ Ø§Ù„Ø¹Ø§Ù…Ù„
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
