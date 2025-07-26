<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MaterialController extends Controller
{
    public function index(): JsonResponse
    {
        $materials = Material::with('category')->get();
        return response()->json($materials);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'sku' => 'required|string|unique:materials',
            'quantity' => 'required|integer|min:0',
            'unit' => 'required|string',
            'cost_per_unit' => 'required|numeric|min:0',
            'supplier' => 'nullable|string',
            'reorder_level' => 'required|integer|min:0',
            'location' => 'nullable|string',
            'image_url' => 'nullable|url',
        ]);

        $material = Material::create($request->all());
        return response()->json($material->load('category'), 201);
    }

    public function show(Material $material): JsonResponse
    {
        return response()->json($material->load(['category', 'orders']));
    }

    public function update(Request $request, Material $material): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'sku' => 'required|string|unique:materials,sku,' . $material->id,
            'quantity' => 'required|integer|min:0',
            'unit' => 'required|string',
            'cost_per_unit' => 'required|numeric|min:0',
            'supplier' => 'nullable|string',
            'reorder_level' => 'required|integer|min:0',
            'location' => 'nullable|string',
            'image_url' => 'nullable|url',
        ]);

        $material->update($request->all());
        return response()->json($material->load('category'));
    }

    public function destroy(Material $material): JsonResponse
    {
        $material->delete();
        return response()->json(['message' => 'Material deleted successfully']);
    }

    public function lowStock(): JsonResponse
    {
        $materials = Material::whereColumn('quantity', '<=', 'reorder_level')
                            ->with('category')
                            ->get();
        return response()->json($materials);
    }
} 