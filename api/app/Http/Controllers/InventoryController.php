<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index()
    {
        try {
            $inventoryItems = \Schema::hasTable('inventory_items') ? 
                InventoryItem::orderBy('name')->get() : 
                collect([]);
        } catch (\Exception $e) {
            $inventoryItems = collect([]);
        }
        
        return view('modules.inventory.index', compact('inventoryItems'));
    }

    public function create()
    {
        return view('modules.inventory.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'quantity' => ['nullable','numeric'],
            'unit' => ['nullable','string','max:50'],
            'description' => ['nullable','string'],
        ]);
        $item = new InventoryItem($data);
        $item->item_code = 'ITM-'.now()->format('Ymd-His');
        $item->status = 'in_stock';
        $item->save();
        return redirect()->route('ui.inventory.show', $item)->with('success', __('Saved successfully'));
    }

    public function show(InventoryItem $item)
    {
        return view('modules.inventory.show', ['item' => $item]);
    }

    public function edit(InventoryItem $item)
    {
        return view('modules.inventory.edit', ['item' => $item]);
    }

    public function update(Request $request, InventoryItem $item)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'quantity' => ['nullable','numeric'],
            'unit' => ['nullable','string','max:50'],
            'description' => ['nullable','string'],
        ]);
        $item->update($data);
        return redirect()->route('ui.inventory.show', $item)->with('success', __('Updated successfully'));
    }

    public function destroy(InventoryItem $item)
    {
        $item->delete();
        return redirect()->route('ui.inventory')->with('success', __('Deleted successfully'));
    }
}
