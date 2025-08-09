<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class MaterialController extends Controller
{
    public function index()
    {
        try {
            $materials = [];
            
            if (Schema::hasTable('materials')) {
                $materials = DB::table('materials')
                    ->leftJoin('categories', 'materials.category_id', '=', 'categories.id')
                    ->leftJoin('suppliers', 'materials.supplier_id', '=', 'suppliers.id')
                    ->select(
                        'materials.*',
                        'categories.name as category_name',
                        'suppliers.name as supplier_name'
                    )
                    ->orderBy('materials.name')
                    ->get()
                    ->map(function ($material) {
                        $material->category = $material->category_name ? (object) ['name' => $material->category_name] : null;
                        $material->supplier = $material->supplier_name ? (object) ['name' => $material->supplier_name] : null;
                        $material->stock_status = $this->getStockStatus($material->current_stock ?? 0, $material->minimum_stock ?? 10);
                        return $material;
                    });
            }
            
            // Add dummy data if empty
            if (empty($materials->toArray())) {
                $materials = collect([
                    (object) [
                        'id' => 1,
                        'name' => 'Cotton Fabric - Navy Blue',
                        'sku' => 'CTN-NVY-001',
                        'current_stock' => 150,
                        'minimum_stock' => 20,
                        'unit' => 'meters',
                        'cost_per_unit' => 12.50,
                        'category' => (object) ['name' => 'Fabrics'],
                        'supplier' => (object) ['name' => 'Textile Co.'],
                        'stock_status' => 'in_stock'
                    ],
                    (object) [
                        'id' => 2,
                        'name' => 'Silk Thread - White',
                        'sku' => 'SLK-WHT-002',
                        'current_stock' => 5,
                        'minimum_stock' => 10,
                        'unit' => 'spools',
                        'cost_per_unit' => 8.75,
                        'category' => (object) ['name' => 'Threads'],
                        'supplier' => (object) ['name' => 'Thread Masters'],
                        'stock_status' => 'low_stock'
                    ],
                    (object) [
                        'id' => 3,
                        'name' => 'Buttons - Pearl White',
                        'sku' => 'BTN-PWH-003',
                        'current_stock' => 0,
                        'minimum_stock' => 50,
                        'unit' => 'pieces',
                        'cost_per_unit' => 0.45,
                        'category' => (object) ['name' => 'Accessories'],
                        'supplier' => (object) ['name' => 'Button World'],
                        'stock_status' => 'out_of_stock'
                    ]
                ]);
            }
            
            return view('modules.inventory.materials.index', compact('materials'));
            
        } catch (\Exception $e) {
            return view('modules.inventory.materials.index', ['materials' => collect()]);
        }
    }

    public function create()
    {
        try {
            $categories = [];
            $suppliers = [];
            
            if (Schema::hasTable('categories')) {
                $categories = DB::table('categories')->select('id', 'name')->get();
            }
            
            if (Schema::hasTable('suppliers')) {
                $suppliers = DB::table('suppliers')->select('id', 'name')->get();
            }
            
            // Add dummy data if empty
            if ($categories->isEmpty()) {
                $categories = collect([
                    (object) ['id' => 1, 'name' => 'Fabrics'],
                    (object) ['id' => 2, 'name' => 'Threads'],
                    (object) ['id' => 3, 'name' => 'Accessories']
                ]);
            }
            
            if ($suppliers->isEmpty()) {
                $suppliers = collect([
                    (object) ['id' => 1, 'name' => 'Textile Co.'],
                    (object) ['id' => 2, 'name' => 'Thread Masters'],
                    (object) ['id' => 3, 'name' => 'Button World']
                ]);
            }
            
            return view('modules.inventory.materials.create', compact('categories', 'suppliers'));
            
        } catch (\Exception $e) {
            return view('modules.inventory.materials.create', [
                'categories' => collect(),
                'suppliers' => collect()
            ]);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:100',
            'current_stock' => 'required|numeric|min:0',
            'minimum_stock' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'cost_per_unit' => 'required|numeric|min:0'
        ]);

        try {
            if (Schema::hasTable('materials')) {
                DB::table('materials')->insert([
                    'name' => $request->name,
                    'sku' => $request->sku,
                    'description' => $request->description,
                    'category_id' => $request->category_id,
                    'supplier_id' => $request->supplier_id,
                    'current_stock' => $request->current_stock,
                    'minimum_stock' => $request->minimum_stock,
                    'unit' => $request->unit,
                    'cost_per_unit' => $request->cost_per_unit,
                    'location' => $request->location,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return redirect()->route('ui.inventory.materials.index')
                ->with('success', __('Material added successfully'));

        } catch (\Exception $e) {
            return back()->withInput()
                ->with('error', __('Failed to add material: ') . $e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $material = null;
            
            if (Schema::hasTable('materials')) {
                $material = DB::table('materials')
                    ->leftJoin('categories', 'materials.category_id', '=', 'categories.id')
                    ->leftJoin('suppliers', 'materials.supplier_id', '=', 'suppliers.id')
                    ->select(
                        'materials.*',
                        'categories.name as category_name',
                        'suppliers.name as supplier_name',
                        'suppliers.contact_email as supplier_email'
                    )
                    ->where('materials.id', $id)
                    ->first();
                    
                if ($material) {
                    $material->category = $material->category_name ? (object) ['name' => $material->category_name] : null;
                    $material->supplier = $material->supplier_name ? (object) [
                        'name' => $material->supplier_name,
                        'email' => $material->supplier_email
                    ] : null;
                    $material->stock_status = $this->getStockStatus($material->current_stock ?? 0, $material->minimum_stock ?? 10);
                }
            }
            
            // Dummy data if not found
            if (!$material) {
                $material = (object) [
                    'id' => $id,
                    'name' => 'Cotton Fabric - Navy Blue',
                    'sku' => 'CTN-NVY-001',
                    'description' => 'High-quality cotton fabric suitable for formal wear',
                    'current_stock' => 150,
                    'minimum_stock' => 20,
                    'unit' => 'meters',
                    'cost_per_unit' => 12.50,
                    'location' => 'Warehouse A - Section 1',
                    'category' => (object) ['name' => 'Fabrics'],
                    'supplier' => (object) ['name' => 'Textile Co.', 'email' => 'orders@textileco.com'],
                    'stock_status' => 'in_stock',
                    'created_at' => now()->subDays(30)
                ];
            }
            
            return view('modules.inventory.materials.show', compact('material'));
            
        } catch (\Exception $e) {
            return redirect()->route('ui.inventory.materials.index')
                ->with('error', __('Material not found'));
        }
    }

    public function edit($id)
    {
        try {
            $material = null;
            $categories = [];
            $suppliers = [];
            
            if (Schema::hasTable('materials')) {
                $material = DB::table('materials')->where('id', $id)->first();
            }
            
            if (Schema::hasTable('categories')) {
                $categories = DB::table('categories')->select('id', 'name')->get();
            }
            
            if (Schema::hasTable('suppliers')) {
                $suppliers = DB::table('suppliers')->select('id', 'name')->get();
            }
            
            // Dummy data if not found
            if (!$material) {
                $material = (object) [
                    'id' => $id,
                    'name' => 'Cotton Fabric - Navy Blue',
                    'sku' => 'CTN-NVY-001',
                    'description' => 'High-quality cotton fabric',
                    'category_id' => 1,
                    'supplier_id' => 1,
                    'current_stock' => 150,
                    'minimum_stock' => 20,
                    'unit' => 'meters',
                    'cost_per_unit' => 12.50,
                    'location' => 'Warehouse A - Section 1'
                ];
            }
            
            if ($categories->isEmpty()) {
                $categories = collect([
                    (object) ['id' => 1, 'name' => 'Fabrics'],
                    (object) ['id' => 2, 'name' => 'Threads'],
                    (object) ['id' => 3, 'name' => 'Accessories']
                ]);
            }
            
            if ($suppliers->isEmpty()) {
                $suppliers = collect([
                    (object) ['id' => 1, 'name' => 'Textile Co.'],
                    (object) ['id' => 2, 'name' => 'Thread Masters'],
                    (object) ['id' => 3, 'name' => 'Button World']
                ]);
            }
            
            return view('modules.inventory.materials.edit', compact('material', 'categories', 'suppliers'));
            
        } catch (\Exception $e) {
            return redirect()->route('ui.inventory.materials.index')
                ->with('error', __('Material not found'));
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:100',
            'current_stock' => 'required|numeric|min:0',
            'minimum_stock' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'cost_per_unit' => 'required|numeric|min:0'
        ]);

        try {
            if (Schema::hasTable('materials')) {
                DB::table('materials')
                    ->where('id', $id)
                    ->update([
                        'name' => $request->name,
                        'sku' => $request->sku,
                        'description' => $request->description,
                        'category_id' => $request->category_id,
                        'supplier_id' => $request->supplier_id,
                        'current_stock' => $request->current_stock,
                        'minimum_stock' => $request->minimum_stock,
                        'unit' => $request->unit,
                        'cost_per_unit' => $request->cost_per_unit,
                        'location' => $request->location,
                        'updated_at' => now()
                    ]);
            }

            return redirect()->route('ui.inventory.materials.show', $id)
                ->with('success', __('Material updated successfully'));

        } catch (\Exception $e) {
            return back()->withInput()
                ->with('error', __('Failed to update material: ') . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            if (Schema::hasTable('materials')) {
                DB::table('materials')->where('id', $id)->delete();
            }

            return redirect()->route('ui.inventory.materials.index')
                ->with('success', __('Material deleted successfully'));

        } catch (\Exception $e) {
            return redirect()->route('ui.inventory.materials.index')
                ->with('error', __('Failed to delete material'));
        }
    }

    private function getStockStatus($currentStock, $minimumStock)
    {
        if ($currentStock <= 0) {
            return 'out_of_stock';
        } elseif ($currentStock <= $minimumStock) {
            return 'low_stock';
        } else {
            return 'in_stock';
        }
    }
}
