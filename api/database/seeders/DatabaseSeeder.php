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
        // 🇰🇼 Run comprehensive Kuwaiti Women Tailoring Workshop seeders
        $this->call(KuwaitiTailoringMasterSeeder::class);
        
        // Keep existing production workflow seeders
        $this->call([
            ProductionStagesSeeder::class,
            StationsSeeder::class,
            ProductionStageSeeder::class,
            OrderProductionTrackingSeeder::class,
        ]);

        // Optional: Uncomment to add generic factory data alongside Kuwaiti data
        /*
        \App\Models\User::factory(5)->create();
        \App\Models\Notification::factory(10)->create();
        \App\Models\Log::factory(15)->create();
        \App\Models\Setting::factory(5)->create();
        \App\Models\Backup::factory(3)->create();
        */
    }
}
