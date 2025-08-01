<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\WorkshopOrder;
use App\Models\WorkshopOrderItem;
use App\Models\Product;
use App\Models\Client;

class WorkshopOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some products and clients
        $products = Product::take(5)->get();
        $clients = Client::take(3)->get();
        
        if ($products->isEmpty()) {
            $this->command->info('No products found. Please run ProductSeeder first.');
            return;
        }

        $this->command->info('Creating workshop orders...');

        // Create 8 sample workshop orders
        for ($i = 1; $i <= 8; $i++) {
            $orderNumber = 'WS-' . now()->format('Ymd') . '-' . str_pad($i, 4, '0', STR_PAD_LEFT);
            
            $order = WorkshopOrder::create([
                'order_number' => $orderNumber,
                'source_type' => $this->getRandomSourceType(),
                'source_id' => $i <= 5 ? (1000 + $i) : null, // First 5 are from WooCommerce
                'client_id' => $clients->isNotEmpty() ? $clients->random()->id : null,
                'customer_name' => $this->getRandomCustomerName(),
                'customer_email' => 'customer' . $i . '@workshop.com',
                'customer_phone' => '+965' . rand(10000000, 99999999),
                'estimated_cost' => rand(50, 300) + (rand(0, 999) / 1000),
                'selling_price' => rand(100, 500) + (rand(0, 999) / 1000),
                'currency' => 'KWD',
                'status' => $this->getRandomStatus(),
                'priority' => $this->getRandomPriority(),
                'estimated_delivery_date' => now()->addDays(rand(7, 30)),
                'delivery_address' => [
                    'area' => $this->getRandomKuwaitArea(),
                    'block' => rand(1, 20),
                    'street' => rand(1, 50),
                    'building' => rand(1, 100),
                    'floor' => rand(1, 5),
                    'apartment' => rand(1, 20),
                ],
                'customer_notes' => $i % 3 == 0 ? 'يرجى التواصل قبل التسليم' : null,
                'special_requirements' => $i % 4 == 0 ? ['color' => 'أزرق', 'size' => 'كبير'] : null,
                'progress_percentage' => $this->getProgressByStatus($this->getStatusByIndex($i)),
                'accepted_at' => $i <= 6 ? now()->subDays(rand(1, 5)) : null,
                'production_started_at' => $i <= 4 ? now()->subDays(rand(1, 3)) : null,
                'completed_at' => $i <= 2 ? now()->subDays(rand(0, 1)) : null,
            ]);

            // Create 1-2 order items for each order
            $itemCount = rand(1, 2);
            for ($j = 1; $j <= $itemCount; $j++) {
                $product = $products->random();
                $quantity = rand(1, 2);
                $unitCost = rand(20, 100) + (rand(0, 999) / 1000);
                $totalCost = $unitCost * $quantity;
                $unitPrice = $unitCost * 1.5; // 50% markup
                $totalPrice = $unitPrice * $quantity;

                WorkshopOrderItem::create([
                    'workshop_order_id' => $order->id,
                    'source_order_item_id' => $order->source_type === 'woocommerce' ? ($i * 10) + $j : null,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'total_cost' => $totalCost,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'product_specifications' => [
                        'color' => $this->getRandomColor(),
                        'size' => $this->getRandomSize(),
                        'material' => $this->getRandomMaterial(),
                    ],
                    'materials_breakdown' => [
                        [
                            'material_id' => 1,
                            'material_name' => 'قماش قطني',
                            'quantity_needed' => $quantity * 2,
                            'unit' => 'متر',
                            'cost_per_unit' => 5.000,
                        ],
                        [
                            'material_id' => 2,
                            'material_name' => 'خيوط',
                            'quantity_needed' => $quantity * 100,
                            'unit' => 'متر',
                            'cost_per_unit' => 0.010,
                        ],
                    ],
                    'status' => $this->getItemStatusByOrderStatus($order->status),
                    'progress_percentage' => $this->getProgressByStatus($order->status),
                    'production_started_at' => $order->production_started_at,
                    'completed_at' => $order->completed_at,
                ]);
            }

            $this->command->info("Created workshop order {$order->order_number} with {$itemCount} items");
        }

        $this->command->info('Workshop orders created successfully!');
    }

    private function getRandomSourceType(): string
    {
        $types = ['woocommerce', 'local', 'manual'];
        return $types[array_rand($types)];
    }

    private function getRandomStatus(): string
    {
        $statuses = [
            'pending_acceptance',
            'accepted',
            'materials_reserved',
            'in_production',
            'quality_check',
            'completed',
            'on_hold'
        ];
        return $statuses[array_rand($statuses)];
    }

    private function getStatusByIndex(int $index): string
    {
        // Create a distribution of statuses
        if ($index <= 2) return 'completed';
        if ($index <= 4) return 'in_production';
        if ($index <= 6) return 'accepted';
        return 'pending_acceptance';
    }

    private function getRandomPriority(): string
    {
        $priorities = ['low', 'medium', 'high', 'urgent'];
        $weights = [30, 40, 20, 10]; // Percentage distribution
        
        $rand = rand(1, 100);
        $cumulative = 0;
        
        foreach ($weights as $index => $weight) {
            $cumulative += $weight;
            if ($rand <= $cumulative) {
                return $priorities[$index];
            }
        }
        
        return 'medium';
    }

    private function getProgressByStatus(string $status): float
    {
        $progressMap = [
            'pending_acceptance' => 0.00,
            'accepted' => 10.00,
            'materials_reserved' => 20.00,
            'in_production' => rand(25, 85),
            'quality_check' => 90.00,
            'completed' => 100.00,
            'delivered' => 100.00,
            'on_hold' => rand(10, 60),
            'cancelled' => 0.00,
        ];

        return $progressMap[$status] ?? 0.00;
    }

    private function getItemStatusByOrderStatus(string $orderStatus): string
    {
        $statusMap = [
            'pending_acceptance' => 'pending',
            'accepted' => 'pending',
            'materials_reserved' => 'materials_reserved',
            'in_production' => 'in_production',
            'quality_check' => 'quality_check',
            'completed' => 'completed',
            'delivered' => 'completed',
            'on_hold' => 'pending',
            'cancelled' => 'cancelled',
        ];

        return $statusMap[$orderStatus] ?? 'pending';
    }

    private function getRandomCustomerName(): string
    {
        $names = [
            'محمد أحمد الكندري',
            'فاطمة علي السالم',
            'عبدالله خالد المطيري',
            'نورا سعد العجمي',
            'سارة يوسف العتيبي',
            'علي محمد العنزي',
            'هدى عبدالرحمن الصباح',
            'خالد سعد الدوسري',
            'مريم أحمد القحطاني',
            'حمد علي المنصوري'
        ];

        return $names[array_rand($names)];
    }

    private function getRandomKuwaitArea(): string
    {
        $areas = [
            'السالمية',
            'حولي',
            'الجابرية',
            'بيان',
            'مشرف',
            'الفروانية',
            'جليب الشيوخ',
            'الرقة',
            'العدان',
            'المهبولة'
        ];

        return $areas[array_rand($areas)];
    }

    private function getRandomColor(): string
    {
        $colors = ['أسود', 'أزرق', 'رمادي', 'بني', 'كحلي', 'أبيض', 'أحمر'];
        return $colors[array_rand($colors)];
    }

    private function getRandomSize(): string
    {
        $sizes = ['S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44', '46'];
        return $sizes[array_rand($sizes)];
    }

    private function getRandomMaterial(): string
    {
        $materials = ['قطن', 'صوف', 'حرير', 'بوليستر', 'كتان', 'مخلوط'];
        return $materials[array_rand($materials)];
    }
}