<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Station;
use App\Models\ProductionStage;

class StationsSeeder extends Seeder
{
    public function run(): void
    {
        $stages = ProductionStage::all();

        foreach ($stages as $stage) {
            // Create 2 stations for each stage
            for ($i = 1; $i <= 2; $i++) {
                Station::create([
                    'name' => $stage->name . ' Station ' . $i,
                    'description' => 'محطة ' . $stage->name . ' رقم ' . $i,
                    'production_stage_id' => $stage->id,
                    'assigned_worker_id' => null,
                    'status' => 'available',
                    'equipment' => [
                        'sewing_machine' => $stage->name === 'Sewing' ? true : false,
                        'cutting_table' => $stage->name === 'Cutting' ? true : false,
                        'iron' => $stage->name === 'Finishing' ? true : false,
                        'mirror' => $stage->name === 'Fitting' ? true : false
                    ],
                    'notes' => null
                ]);
            }
        }
    }
} 