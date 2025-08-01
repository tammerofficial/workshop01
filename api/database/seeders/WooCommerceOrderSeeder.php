<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\WooCommerceOrder;
use App\Models\WooCommerceOrderItem;
use App\Models\Product;

class WooCommerceOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some products to link with orders
        $products = Product::take(5)->get();
        
        if ($products->isEmpty()) {
            $this->command->info('No products found. Please run ProductSeeder first.');
            return;
        }

        $this->command->info('Creating WooCommerce orders...');

        // Create 15 sample WooCommerce orders
        for ($i = 1; $i <= 15; $i++) {
            $order = WooCommerceOrder::create([
                'wc_order_id' => 1000 + $i,
                'order_number' => 'WC-' . (1000 + $i),
                'customer_name' => $this->getRandomCustomerName(),
                'customer_email' => 'customer' . $i . '@example.com',
                'customer_phone' => '+965' . rand(10000000, 99999999),
                'total_amount' => rand(50, 500) + (rand(0, 999) / 1000), // Random amount with 3 decimals
                'tax_amount' => rand(5, 50) + (rand(0, 999) / 1000),
                'shipping_amount' => rand(2, 15) + (rand(0, 999) / 1000),
                'currency' => 'KWD',
                'status' => $this->getRandomOrderStatus(),
                'payment_status' => $this->getRandomPaymentStatus(),
                'payment_method' => $this->getRandomPaymentMethod(),
                'billing_address' => [
                    'first_name' => 'العميل',
                    'last_name' => 'رقم ' . $i,
                    'address_1' => 'شارع رقم ' . rand(1, 100),
                    'city' => $this->getRandomKuwaitCity(),
                    'postcode' => rand(10000, 99999),
                    'country' => 'KW',
                ],
                'shipping_address' => [
                    'first_name' => 'العميل',
                    'last_name' => 'رقم ' . $i,
                    'address_1' => 'شارع رقم ' . rand(1, 100),
                    'city' => $this->getRandomKuwaitCity(),
                    'postcode' => rand(10000, 99999),
                    'country' => 'KW',
                ],
                'customer_notes' => $i % 3 == 0 ? 'الرجاء التواصل قبل التسليم' : null,
                'order_notes' => $i % 4 == 0 ? 'طلب مستعجل' : null,
                'is_cloned_to_workshop' => $i <= 5, // First 5 orders are already cloned
                'order_date' => now()->subDays(rand(0, 30)),
            ]);

            // Create 1-3 order items for each order
            $itemCount = rand(1, 3);
            for ($j = 1; $j <= $itemCount; $j++) {
                $product = $products->random();
                $quantity = rand(1, 3);
                $unitPrice = rand(25, 200) + (rand(0, 999) / 1000);
                $lineTotal = $unitPrice * $quantity;

                WooCommerceOrderItem::create([
                    'woocommerce_order_id' => $order->id,
                    'wc_order_item_id' => ($i * 10) + $j, // Unique WC item ID
                    'wc_product_id' => $product->woocommerce_id ?: rand(100, 999),
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'unit_price' => $unitPrice,
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                    'line_tax' => $lineTotal * 0.1, // 10% tax
                    'product_meta' => [
                        'color' => $this->getRandomColor(),
                        'size' => $this->getRandomSize(),
                    ],
                    'product_attributes' => [
                        'لون' => $this->getRandomColor(),
                        'مقاس' => $this->getRandomSize(),
                        'مادة' => $this->getRandomMaterial(),
                    ],
                    'item_notes' => $j == 1 && $i % 5 == 0 ? 'مقاسات خاصة' : null,
                    'is_cloned_to_workshop' => $order->is_cloned_to_workshop,
                ]);
            }

            $this->command->info("Created order WC-{$order->wc_order_id} with {$itemCount} items");
        }

        $this->command->info('WooCommerce orders created successfully!');
    }

    private function getRandomCustomerName(): string
    {
        $names = [
            'أحمد محمد الأحمد',
            'فاطمة علي السالم',
            'محمد عبدالله الكندري',
            'نورا سعد العجمي',
            'عبدالرحمن خالد المطيري',
            'مريم يوسف العتيبي',
            'سارة أحمد الرشيد',
            'علي محمد العنزي',
            'هدى عبدالله الصباح',
            'خالد سعد الدوسري',
            'ريم محمد القحطاني',
            'حمد علي المنصوري',
            'شيخة عبدالرحمن الثاني',
            'عبدالعزيز أحمد العوضي',
            'منيرة خالد البدر'
        ];

        return $names[array_rand($names)];
    }

    private function getRandomOrderStatus(): string
    {
        $statuses = ['pending', 'processing', 'on-hold', 'completed', 'cancelled'];
        return $statuses[array_rand($statuses)];
    }

    private function getRandomPaymentStatus(): string
    {
        $statuses = ['pending', 'paid', 'failed'];
        return $statuses[array_rand($statuses)];
    }

    private function getRandomPaymentMethod(): string
    {
        $methods = ['knet', 'visa', 'mastercard', 'cash_on_delivery'];
        return $methods[array_rand($methods)];
    }

    private function getRandomKuwaitCity(): string
    {
        $cities = [
            'العاصمة',
            'حولي',
            'الفروانية',
            'الجهراء',
            'الأحمدي',
            'مبارك الكبير'
        ];

        return $cities[array_rand($cities)];
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