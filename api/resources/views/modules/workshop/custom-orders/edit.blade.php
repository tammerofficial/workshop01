@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
    <div class="card">
        <div class="card-header">
            <h2 class="card-title">{{ __('Edit Custom Order') }}</h2>
            <p class="text-gray-600">{{ $customOrder->order_number ?? 'CO-2024-000001' }}</p>
        </div>
        
        <div class="card-content">
            <form action="{{ route('ui.workshop.custom-orders.update', $customOrder->id ?? 1) }}" method="POST">
                @csrf
                @method('PUT')
                
                <!-- Status & Priority -->
                <div class="form-section">
                    <h3 class="section-title">{{ __('Order Status') }}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label for="status" class="form-label">{{ __('Status') }}</label>
                            <select name="status" id="status" class="form-select">
                                <option value="pending_quote" @if(($customOrder->status ?? 'pending_quote') === 'pending_quote') selected @endif>{{ __('Pending Quote') }}</option>
                                <option value="quoted" @if(($customOrder->status ?? '') === 'quoted') selected @endif>{{ __('Quoted') }}</option>
                                <option value="confirmed" @if(($customOrder->status ?? '') === 'confirmed') selected @endif>{{ __('Confirmed') }}</option>
                                <option value="in_production" @if(($customOrder->status ?? '') === 'in_production') selected @endif>{{ __('In Production') }}</option>
                                <option value="quality_check" @if(($customOrder->status ?? '') === 'quality_check') selected @endif>{{ __('Quality Check') }}</option>
                                <option value="completed" @if(($customOrder->status ?? '') === 'completed') selected @endif>{{ __('Completed') }}</option>
                                <option value="delivered" @if(($customOrder->status ?? '') === 'delivered') selected @endif>{{ __('Delivered') }}</option>
                                <option value="cancelled" @if(($customOrder->status ?? '') === 'cancelled') selected @endif>{{ __('Cancelled') }}</option>
                            </select>
                        </div>
                        
                        <div>
                            <label for="priority" class="form-label">{{ __('Priority') }}</label>
                            <select name="priority" id="priority" class="form-select">
                                <option value="low" @if(($customOrder->priority ?? 'normal') === 'low') selected @endif>{{ __('Low') }}</option>
                                <option value="normal" @if(($customOrder->priority ?? 'normal') === 'normal') selected @endif>{{ __('Normal') }}</option>
                                <option value="high" @if(($customOrder->priority ?? '') === 'high') selected @endif>{{ __('High') }}</option>
                                <option value="urgent" @if(($customOrder->priority ?? '') === 'urgent') selected @endif>{{ __('Urgent') }}</option>
                            </select>
                        </div>
                        
                        <div>
                            <label for="assigned_to" class="form-label">{{ __('Assigned To') }}</label>
                            <select name="assigned_to" id="assigned_to" class="form-select">
                                <option value="">{{ __('Unassigned') }}</option>
                                @foreach($workers ?? [] as $worker)
                                <option value="{{ $worker->id }}" @if(($customOrder->assigned_to ?? '') == $worker->id) selected @endif>
                                    {{ $worker->name }}
                                </option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Pricing -->
                <div class="form-section">
                    <h3 class="section-title">{{ __('Pricing') }}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="quoted_price" class="form-label">{{ __('Quoted Price ($)') }}</label>
                            <input type="number" name="quoted_price" id="quoted_price" step="0.01" class="form-input" 
                                   value="{{ $customOrder->quoted_price ?? '' }}">
                        </div>
                        
                        <div>
                            <label for="final_price" class="form-label">{{ __('Final Price ($)') }}</label>
                            <input type="number" name="final_price" id="final_price" step="0.01" class="form-input" 
                                   value="{{ $customOrder->final_price ?? '' }}">
                        </div>
                    </div>
                </div>

                <!-- Timeline -->
                <div class="form-section">
                    <h3 class="section-title">{{ __('Timeline') }}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="estimated_completion_date" class="form-label">{{ __('Estimated Completion Date') }}</label>
                            <input type="date" name="estimated_completion_date" id="estimated_completion_date" class="form-input" 
                                   value="{{ optional($customOrder->estimated_completion_date)->format('Y-m-d') ?? '' }}">
                        </div>
                        
                        <div>
                            <label for="promised_delivery_date" class="form-label">{{ __('Promised Delivery Date') }}</label>
                            <input type="date" name="promised_delivery_date" id="promised_delivery_date" class="form-input" 
                                   value="{{ optional($customOrder->promised_delivery_date)->format('Y-m-d') ?? '' }}">
                        </div>
                    </div>
                </div>

                <!-- Notes -->
                <div class="form-section">
                    <h3 class="section-title">{{ __('Notes') }}</h3>
                    <div>
                        <label for="notes" class="form-label">{{ __('Additional Notes') }}</label>
                        <textarea name="notes" id="notes" rows="4" class="form-textarea" 
                                  placeholder="{{ __('Any additional notes or updates...') }}">{{ $customOrder->notes ?? '' }}</textarea>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end gap-3 pt-6 border-t">
                    <a href="{{ route('ui.workshop.custom-orders.show', $customOrder->id ?? 1) }}" class="btn btn-secondary">
                        {{ __('Cancel') }}
                    </a>
                    <button type="submit" class="btn btn-primary">
                        {{ __('Update Order') }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('styles')
<style>
.form-section {
    @apply mb-8 pb-6 border-b border-gray-200 last:border-b-0;
}
.section-title {
    @apply text-lg font-semibold text-gray-800 mb-4;
}
.form-label {
    @apply block text-sm font-medium text-gray-700 mb-1;
}
.form-input, .form-select, .form-textarea {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
</style>
@endpush
