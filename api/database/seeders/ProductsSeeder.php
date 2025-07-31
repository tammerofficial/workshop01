<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create collections first
        $collections = [
            [
                'name' => 'Summer Collection 2025',
                'description' => 'Light and breathable fabrics for summer',
                'season' => 'summer',
                'year' => 2025,
                'color' => '#FFA500',
                'is_active' => true
            ],
            [
                'name' => 'Winter Collection 2025',
                'description' => 'Warm and cozy fabrics for winter',
                'season' => 'winter',
                'year' => 2025,
                'color' => '#4169E1',
                'is_active' => true
            ]
        ];

        foreach ($collections as $collection) {
            \App\Models\Collection::create($collection);
        }

        // Get the first category for testing
        $category = \App\Models\Category::first();

        // Raw Materials
        $rawMaterials = [
            [
                'name' => 'Cotton Fabric - White',
                'description' => 'High quality cotton fabric in white color',
                'sku' => 'RM-COT-WHT-001',
                'product_type' => 'raw_material',
                'price' => 15.00,
                'purchase_price' => 12.00,
                'stock_quantity' => 500,
                'category_id' => $category?->id,
                'manage_stock' => true,
                'auto_calculate_purchase_price' => false,
                'is_active' => true
            ],
            [
                'name' => 'Silk Thread - Gold',
                'description' => 'Premium silk thread in gold color',
                'sku' => 'RM-THR-GLD-001',
                'product_type' => 'raw_material',
                'price' => 25.00,
                'purchase_price' => 20.00,
                'stock_quantity' => 200,
                'category_id' => $category?->id,
                'manage_stock' => true,
                'auto_calculate_purchase_price' => false,
                'is_active' => true
            ],
            [
                'name' => 'Crystal Beads - Clear',
                'description' => 'High quality crystal beads for decoration',
                'sku' => 'RM-CRY-CLR-001',
                'product_type' => 'raw_material',
                'price' => 5.00,
                'purchase_price' => 3.00,
                'stock_quantity' => 1000,
                'category_id' => $category?->id,
                'manage_stock' => true,
                'auto_calculate_purchase_price' => false,
                'is_active' => true
            ]
        ];

        foreach ($rawMaterials as $material) {
            \App\Models\Product::create($material);
        }

        // Product Parts
        $productParts = [
            [
                'name' => 'Zipper - 20cm',
                'description' => '20cm zipper for dresses',
                'sku' => 'PP-ZIP-20CM-001',
                'product_type' => 'product_part',
                'price' => 3.00,
                'purchase_price' => 2.00,
                'stock_quantity' => 300,
                'category_id' => $category?->id,
                'manage_stock' => true,
                'auto_calculate_purchase_price' => false,
                'is_active' => true
            ],
            [
                'name' => 'Button Set - Pearl',
                'description' => 'Set of 6 pearl buttons',
                'sku' => 'PP-BTN-PRL-001',
                'product_type' => 'product_part',
                'price' => 8.00,
                'purchase_price' => 5.00,
                'stock_quantity' => 150,
                'category_id' => $category?->id,
                'manage_stock' => true,
                'auto_calculate_purchase_price' => false,
                'is_active' => true
            ]
        ];

        foreach ($productParts as $part) {
            \App\Models\Product::create($part);
        }

        // Simple Products (Finished Products)
        $products = [
            [
                'name' => 'Evening Dress - Elegant White',
                'description' => 'Beautiful white evening dress with crystal decorations',
                'sku' => 'PRD-EVE-WHT-001',
                'product_type' => 'simple',
                'price' => 450.00,
                'purchase_price' => 0, // Will be calculated from BOM
                'stock_quantity' => 20,
                'category_id' => $category?->id,
                'collection_id' => 1, // Summer Collection
                'production_hours' => 12,
                'manufacturing_time_days' => 3,
                'manage_stock' => true,
                'auto_calculate_purchase_price' => true,
                'stage_requirements' => [
                    'design' => 2,
                    'cutting' => 3,
                    'sewing' => 5,
                    'finishing' => 2
                ],
                'is_active' => true
            ],
            [
                'name' => 'Business Suit - Navy Blue',
                'description' => 'Professional business suit in navy blue',
                'sku' => 'PRD-SUT-NVY-001',
                'product_type' => 'simple',
                'price' => 350.00,
                'purchase_price' => 0, // Will be calculated from BOM
                'stock_quantity' => 15,
                'category_id' => $category?->id,
                'collection_id' => 2, // Winter Collection
                'production_hours' => 10,
                'manufacturing_time_days' => 2,
                'manage_stock' => true,
                'auto_calculate_purchase_price' => true,
                'stage_requirements' => [
                    'design' => 1,
                    'cutting' => 3,
                    'sewing' => 4,
                    'finishing' => 2
                ],
                'is_active' => true
            ]
        ];

        foreach ($products as $product) {
            \App\Models\Product::create($product);
        }

        // Create Bill of Materials
        $this->createBillOfMaterials();
    }

    private function createBillOfMaterials()
    {
        // Get products
        $eveningDress = \App\Models\Product::where('sku', 'PRD-EVE-WHT-001')->first();
        $businessSuit = \App\Models\Product::where('sku', 'PRD-SUT-NVY-001')->first();

        // Get materials
        $cottonFabric = \App\Models\Product::where('sku', 'RM-COT-WHT-001')->first();
        $silkThread = \App\Models\Product::where('sku', 'RM-THR-GLD-001')->first();
        $crystalBeads = \App\Models\Product::where('sku', 'RM-CRY-CLR-001')->first();
        $zipper = \App\Models\Product::where('sku', 'PP-ZIP-20CM-001')->first();
        $buttons = \App\Models\Product::where('sku', 'PP-BTN-PRL-001')->first();

        // BOM for Evening Dress
        if ($eveningDress) {
            $bomItems = [
                [
                    'product_id' => $eveningDress->id,
                    'material_id' => $cottonFabric->id,
                    'quantity_required' => 3.5,
                    'unit' => 'meters',
                    'cost_per_unit' => $cottonFabric->purchase_price,
                    'is_optional' => false,
                    'notes' => 'Main fabric for dress'
                ],
                [
                    'product_id' => $eveningDress->id,
                    'material_id' => $silkThread->id,
                    'quantity_required' => 2,
                    'unit' => 'spools',
                    'cost_per_unit' => $silkThread->purchase_price,
                    'is_optional' => false,
                    'notes' => 'Thread for sewing'
                ],
                [
                    'product_id' => $eveningDress->id,
                    'material_id' => $crystalBeads->id,
                    'quantity_required' => 50,
                    'unit' => 'pieces',
                    'cost_per_unit' => $crystalBeads->purchase_price,
                    'is_optional' => false,
                    'notes' => 'Decorative crystals'
                ],
                [
                    'product_id' => $eveningDress->id,
                    'material_id' => $zipper->id,
                    'quantity_required' => 1,
                    'unit' => 'piece',
                    'cost_per_unit' => $zipper->purchase_price,
                    'is_optional' => false,
                    'notes' => 'Back zipper'
                ]
            ];

            foreach ($bomItems as $item) {
                \App\Models\ProductBillOfMaterial::create($item);
            }

            // Recalculate purchase price
            $eveningDress->calculatePurchasePriceFromBOM();
            $eveningDress->save();
        }

        // BOM for Business Suit
        if ($businessSuit) {
            $bomItems = [
                [
                    'product_id' => $businessSuit->id,
                    'material_id' => $cottonFabric->id,
                    'quantity_required' => 2.5,
                    'unit' => 'meters',
                    'cost_per_unit' => $cottonFabric->purchase_price,
                    'is_optional' => false,
                    'notes' => 'Main fabric for suit'
                ],
                [
                    'product_id' => $businessSuit->id,
                    'material_id' => $silkThread->id,
                    'quantity_required' => 1.5,
                    'unit' => 'spools',
                    'cost_per_unit' => $silkThread->purchase_price,
                    'is_optional' => false,
                    'notes' => 'Thread for sewing'
                ],
                [
                    'product_id' => $businessSuit->id,
                    'material_id' => $buttons->id,
                    'quantity_required' => 1,
                    'unit' => 'set',
                    'cost_per_unit' => $buttons->purchase_price,
                    'is_optional' => false,
                    'notes' => 'Suit buttons'
                ]
            ];

            foreach ($bomItems as $item) {
                \App\Models\ProductBillOfMaterial::create($item);
            }

            // Recalculate purchase price
            $businessSuit->calculatePurchasePriceFromBOM();
            $businessSuit->save();
        }
    }
}
