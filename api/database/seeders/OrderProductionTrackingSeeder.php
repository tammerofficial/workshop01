<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\ProductionStage;
use App\Models\OrderProductionTracking;
use App\Models\Worker;

class OrderProductionTrackingSeeder extends Seeder
{
    public function run()
    {
        $orders = Order::all();
        $stages = ProductionStage::active()->ordered()->get();
        $workers = Worker::where('is_active', true)->take(5)->get();

        foreach ($orders as $order) {
            foreach ($stages as $index => $stage) {
                $status = 'pending';
                $startedAt = null;
                $completedAt = null;
                $actualHours = null;
                $qualityScore = null;
                $workerId = null;

                // Simulate progression through stages
                if ($index == 0) {
                    // First stage - completed
                    $status = 'completed';
                    $startedAt = $order->created_at;
                    $completedAt = $order->created_at->addHours($stage->estimated_hours);
                    $actualHours = $stage->estimated_hours + rand(-1, 2); // Some variation
                    $qualityScore = rand(7, 10);
                    $workerId = $workers->random()->id;
                } elseif ($index == 1) {
                    // Second stage - completed or in progress
                    if (rand(0, 1)) {
                        $status = 'completed';
                        $startedAt = $order->created_at->addHours($stages[0]->estimated_hours);
                        $completedAt = $startedAt->addHours($stage->estimated_hours);
                        $actualHours = $stage->estimated_hours + rand(-1, 3);
                        $qualityScore = rand(6, 10);
                        $workerId = $workers->random()->id;
                    } else {
                        $status = 'in_progress';
                        $startedAt = $order->created_at->addHours($stages[0]->estimated_hours);
                        $actualHours = rand(1, $stage->estimated_hours - 1);
                        $workerId = $workers->random()->id;
                    }
                } elseif ($index == 2) {
                    // Third stage - sometimes in progress
                    if (rand(0, 2) == 0) {
                        $status = 'in_progress';
                        $startedAt = now()->subHours(rand(1, 5));
                        $actualHours = rand(1, $stage->estimated_hours - 2);
                        $workerId = $workers->random()->id;
                    }
                }

                OrderProductionTracking::updateOrCreate([
                    'order_id' => $order->id,
                    'production_stage_id' => $stage->id
                ], [
                    'worker_id' => $workerId,
                    'status' => $status,
                    'started_at' => $startedAt,
                    'completed_at' => $completedAt,
                    'actual_hours' => $actualHours,
                    'quality_score' => $qualityScore,
                    'notes' => $status === 'completed' ? 'تم إنجاز المرحلة بنجاح' : null
                ]);
            }
        }
    }
}