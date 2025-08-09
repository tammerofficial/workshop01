@extends('layouts.app')
@section('title', __('Categories'))
@section('content')
<div class="card">
  <div class="card-header"><div class="flex items-center justify-between"><h3 class="font-semibold">{{ __('Categories') }}</h3><a href="{{ route('ui.categories.create') }}" class="btn btn-primary">{{ __('Add Category') }}</a></div></div>
  <div class="card-content">
    <div class="table-container"><table class="table"><thead><tr><th>#</th><th>{{ __('Name') }}</th><th>{{ __('Color') }}</th><th>{{ __('Actions') }}</th></tr></thead><tbody>
    @forelse(($categories ?? []) as $category)
      <tr><td>#{{ $category->id }}</td><td>{{ $category->name }}</td><td><span class="badge" style="border-color:{{ $category->color }};color:{{ $category->color }}">{{ $category->color }}</span></td><td><a class="btn btn-primary" href="{{ route('ui.categories.show',$category) }}">{{ __('View') }}</a></td></tr>
    @empty
      <tr><td colspan="4"><div class="empty-state"><p>{{ __('No categories found') }}</p></div></td></tr>
    @endforelse
    </tbody></table></div>
  </div>
</div>
@endsection