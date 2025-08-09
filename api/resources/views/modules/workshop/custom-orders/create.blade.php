@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
    <div class="card">
        <div class="card-header">
            <h2 class="card-title">{{ __('Create Custom Order') }}</h2>
        </div>
        
        <div class="card-content">
            <form action="{{ route('ui.workshop.custom-orders.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                
                <!-- Customer Information -->
                <div class="form-section">
                    <h3 class="section-title">{{ __('Customer Information') }}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="customer_id" class="form-label">{{ __('Customer') }} *</label>
                            <select name="customer_id" id="customer_id" class="form-select" required>
                                <option value="">{{ __('Select Customer') }}</option>
                                @foreach($customers ?? [] as $customer)
                                <option value="{{ $customer->id }}">{{ $customer->name }} ({{ $customer->email }})</option>
                                @endforeach
                            </select>
                        </div>
                        
                        <div>
                            <label for="priority" class="form-label">{{ __('Priority') }}</label>
                            <select name="priority" id="priority" class="form-select">
                                <option value="normal">{{ __('Normal') }}</option>
                                <option value="low">{{ __('Low') }}</option>
                                <option value="high">{{ __('High') }}</option>
                                <option value="urgent">{{ __('Urgent') }}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Product Details -->
                <div class="form-section">
                    <h3 class="section-title">{{ __('Product Details') }}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label for="product_type" class="form-label">{{ __('Product Type') }} *</label>
                            <input type="text" name="product_type" id="product_type" class="form-input" required placeholder="{{ __('e.g., Custom Suit, Dress, etc.') }}">
                        </div>
                        
                        <div>
                            <label for="fabric_type" class="form-label">{{ __('Fabric Type') }}</label>
                            <input type="text" name="fabric_type" id="fabric_type" class="form-input" placeholder="{{ __('e.g., Cotton, Silk, Wool') }}">
                        </div>
                        
                        <div>
                            <label for="fabric_color" class="form-label">{{ __('Fabric Color') }}</label>
                            <input type="text" name="fabric_color" id="fabric_color" class="form-input" placeholder="{{ __('e.g., Navy Blue, Black') }}">
                        </div>
                    </div>
                </div>

                <!-- Measurements -->
                <div class="form-section">
                    <h3 class="section-title">{{ __('Measurements') }}</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label class="form-label">{{ __('Chest (cm)') }}</label>
                            <input type="number" name="measurements[chest]" class="form-input" step="0.1">
                        </div>
                        <div>
                            <label class="form-label">{{ __('Waist (cm)') }}</label>
                            <input type="number" name="measurements[waist]" class="form-input" step="0.1">
                        </div>
                        <div>
                            <label class="form-label">{{ __('Hip (cm)') }}</label>
                            <input type="number" name="measurements[hip]" class="form-input" step="0.1">
                        </div>
                        <div>
                            <label class="form-label">{{ __('Length (cm)') }}</label>
                            <input type="number" name="measurements[length]" class="form-input" step="0.1">
                        </div>
                        <div>
                            <label class="form-label">{{ __('Shoulder (cm)') }}</label>
                            <input type="number" name="measurements[shoulder]" class="form-input" step="0.1">
                        </div>
                        <div>
                            <label class="form-label">{{ __('Sleeve (cm)') }}</label>
                            <input type="number" name="measurements[sleeve]" class="form-input" step="0.1">
                        </div>
                        <div>
                            <label class="form-label">{{ __('Neck (cm)') }}</label>
                            <input type="number" name="measurements[neck]" class="form-input" step="0.1">
                        </div>
                        <div>
                            <label class="form-label">{{ __('Inseam (cm)') }}</label>
                            <input type="number" name="measurements[inseam]" class="form-input" step="0.1">
                        </div>
                    </div>
                </div>

                <!-- Design Specifications -->
                <div class="form-section">
                    <h3 class="section-title">{{ __('Design Specifications') }}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">{{ __('Style') }}</label>
                            <input type="text" name="design_specifications[style]" class="form-input" placeholder="{{ __('e.g., Slim Fit, Regular') }}">
                        </div>
                        <div>
                            <label class="form-label">{{ __('Collar Type') }}</label>
                            <input type="text" name="design_specifications[collar]" class="form-input" placeholder="{{ __('e.g., Spread, Button-down') }}">
                        </div>
                        <div>
                            <label class="form-label">{{ __('Button Style') }}</label>
                            <input type="text" name="design_specifications[buttons]" class="form-input" placeholder="{{ __('e.g., Horn, Mother of Pearl') }}">
                        </div>
                        <div>
                            <label class="form-label">{{ __('Lining') }}</label>
                            <input type="text" name="design_specifications[lining]" class="form-input" placeholder="{{ __('e.g., Full, Half, None') }}">
                        </div>
                    </div>
                </div>

                <!-- Custom Features -->
                <div class="form-section">
                    <h3 class="section-title">{{ __('Custom Features') }}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="special_instructions" class="form-label">{{ __('Special Instructions') }}</label>
                            <textarea name="special_instructions" id="special_instructions" rows="4" class="form-textarea" placeholder="{{ __('Any special requirements or instructions...') }}"></textarea>
                        </div>
                        <div>
                            <label for="reference_images" class="form-label">{{ __('Reference Images') }}</label>
                            <input type="file" name="reference_images[]" id="reference_images" class="form-input" multiple accept="image/*">
                            <p class="form-help">{{ __('Upload reference images (max 5 files)') }}</p>
                        </div>
                    </div>
                </div>

                <!-- Timeline -->
                <div class="form-section">
                    <h3 class="section-title">{{ __('Timeline') }}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="estimated_completion_date" class="form-label">{{ __('Estimated Completion Date') }}</label>
                            <input type="date" name="estimated_completion_date" id="estimated_completion_date" class="form-input">
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end gap-3 pt-6 border-t">
                    <a href="{{ route('ui.workshop.custom-orders.index') }}" class="btn btn-secondary">
                        {{ __('Cancel') }}
                    </a>
                    <button type="submit" class="btn btn-primary">
                        {{ __('Create Custom Order') }}
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
.form-help {
    @apply text-xs text-gray-500 mt-1;
}
</style>
@endpush
