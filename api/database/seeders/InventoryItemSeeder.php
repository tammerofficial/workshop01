<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryItem;
use App\Models\Category;

class InventoryItemSeeder extends Seeder
{
    public function run(): void
    {
        $cat = Category::first();
        $items = [
            ['item_code' => 'FAB-001', 'name' => 'Cotton Fabric', 'category_id' => optional($cat)->id, 'type' => 'fabric', 'quantity' => 100, 'unit' => 'meter', 'purchase_price' => 2.5, 'selling_price' => 4.0],
            ['item_code' => 'FAB-002', 'name' => 'Linen Fabric', 'category_id' => optional($cat)->id, 'type' => 'fabric', 'quantity' => 80, 'unit' => 'meter', 'purchase_price' => 3.0, 'selling_price' => 5.0],
            ['item_code' => 'BTN-001', 'name' => 'Buttons Pack', 'category_id' => optional($cat)->id, 'type' => 'accessory', 'quantity' => 500, 'unit' => 'piece', 'purchase_price' => 0.02, 'selling_price' => 0.05],
        ];
        foreach ($items as $i) { InventoryItem::create($i); }
    }
}