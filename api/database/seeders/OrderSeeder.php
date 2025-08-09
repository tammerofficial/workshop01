<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\Client;
use App\Models\Worker;
use App\Models\Category;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $client = Client::first();
        $worker = Worker::first();
        $cat = Category::first();
        if (!$client) { return; }
        $orders = [
            ['order_number' => 'ORD-2025-001', 'client_id' => $client->id, 'assigned_worker_id' => optional($worker)->id, 'category_id' => optional($cat)->id, 'title' => 'Custom Thobe', 'delivery_date' => now()->addDays(10)->toDateString(), 'status' => 'confirmed', 'deposit_amount' => 10, 'paid_amount' => 10, 'final_amount' => 50],
            ['order_number' => 'ORD-2025-002', 'client_id' => $client->id, 'assigned_worker_id' => optional($worker)->id, 'category_id' => optional($cat)->id, 'title' => 'Suit Alteration', 'delivery_date' => now()->addDays(7)->toDateString(), 'status' => 'in_progress', 'deposit_amount' => 5, 'paid_amount' => 5, 'final_amount' => 20],
        ];
        foreach ($orders as $o) { Order::create($o); }
    }
}