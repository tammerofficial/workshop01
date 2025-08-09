@extends('layouts.app')

@section('content')
<div dir="ltr" class="ltr">
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">{{ __('Edit Product') }}</h2>
      <p class="text-gray-600">{{ $product->name ?? '' }} ({{ $product->sku ?? '' }})</p>
    </div>
    <div class="card-content">
      <form method="POST" action="{{ route('ui.inventory.products.update', $product->id) }}">
        @csrf
        @method('PUT')
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">{{ __('Name') }}</label>
            <input type="text" name="name" class="form-input" value="{{ $product->name ?? '' }}" required>
          </div>
          <div>
            <label class="form-label">{{ __('SKU') }}</label>
            <input type="text" name="sku" class="form-input" value="{{ $product->sku ?? '' }}" required>
          </div>
          <div>
            <label class="form-label">{{ __('Category') }}</label>
            <select name="category_id" class="form-select">
              <option value="">{{ __('Select Category') }}</option>
              @foreach(($categories ?? []) as $cat)
                <option value="{{ $cat->id }}" @if(($product->category_id ?? null) == $cat->id) selected @endif>{{ $cat->name }}</option>
              @endforeach
            </select>
          </div>
          <div>
            <label class="form-label">{{ __('Price') }}</label>
            <input type="number" name="price" step="0.01" class="form-input" value="{{ $product->price ?? 0 }}" required>
          </div>
          <div class="md:col-span-2">
            <label class="form-label">{{ __('Description') }}</label>
            <textarea name="description" rows="4" class="form-textarea">{{ $product->description ?? '' }}</textarea>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <a href="{{ route('ui.inventory.products.show', $product->id) }}" class="btn btn-secondary">{{ __('Cancel') }}</a>
          <button type="submit" class="btn btn-primary">{{ __('Update') }}</button>
        </div>
      </form>
    </div>
  </div>
</div>
@endsection


