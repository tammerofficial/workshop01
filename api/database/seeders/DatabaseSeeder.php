<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create 20 records for each model
        \App\Models\User::factory(20)->create();
        \App\Models\Client::factory(20)->create();
        \App\Models\Worker::factory(20)->create();
        \App\Models\Material::factory(20)->create();
        \App\Models\Order::factory(20)->create();
        \App\Models\Invoice::factory(20)->create();
        \App\Models\Task::factory(20)->create();
        \App\Models\Measurement::factory(20)->create();
        \App\Models\OrderMaterial::factory(20)->create();
        \App\Models\Payment::factory(20)->create();
        \App\Models\Production::factory(20)->create();
        \App\Models\ProductionStage::factory(20)->create();
        \App\Models\QualityCheck::factory(20)->create();
        \App\Models\Report::factory(20)->create();
        \App\Models\Setting::factory(20)->create();
        \App\Models\Supplier::factory(20)->create();
        \App\Models\WorkerSkill::factory(20)->create();
        \App\Models\Notification::factory(20)->create();
        \App\Models\Log::factory(20)->create();
        \App\Models\Expense::factory(20)->create();
        \App\Models\Calendar::factory(20)->create();
        \App\Models\Department::factory(20)->create();
        \App\Models\Inventory::factory(20)->create();
        \App\Models\Analytics::factory(20)->create();
        \App\Models\Backup::factory(20)->create();

        // Run production stages seeder
        $this->call([
            ProductionStagesSeeder::class,
            StationsSeeder::class,
            ProductionStageSeeder::class,
            OrderProductionTrackingSeeder::class,
        ]);
    }
}
