<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class KuwaitiTailoringMasterSeeder extends Seeder
{
    /**
     * Run the complete Kuwaiti Women Tailoring Workshop database seeds
     */
    public function run(): void
    {
        // Clear existing data
        $this->command->info('🧹 Clearing existing data...');
        $this->clearExistingData();

        // Seed core data
        $this->command->info('👥 Creating users and roles...');
        $this->seedUsersAndRoles();

        // Run specialized seeders
        $this->command->info('👗 Seeding Kuwaiti women tailoring data...');
        $this->call(KuwaitiWomenTailoringSeeder::class);

        $this->command->info('💰 Seeding financial and analytics data...');
        $this->call(KuwaitiTailoringFinancialsSeeder::class);

        // Final setup
        $this->command->info('📊 Creating dashboard data...');
        $this->seedDashboardMetrics();

        $this->command->info('✅ Kuwaiti Women Tailoring Workshop data seeding completed!');
        $this->displaySummary();
    }

    /**
     * Clear existing data from relevant tables
     */
    private function clearExistingData(): void
    {
        $tables = [
            'workshop_capacity',
            'annual_targets',
            'monthly_summaries',
            'loyalty_customers',
            'boutique_products', 
            'quality_control',
            'attendance',
            'daily_analytics',
            'expenses',
            'sales',
            'production_tasks',
            'orders',
            'inventory',
            'workers',
            'clients'
        ];

        foreach ($tables as $table) {
            if (DB::getSchemaBuilder()->hasTable($table)) {
                try {
                    DB::table($table)->delete();
                } catch (\Exception $e) {
                    $this->command->warn("Could not clear table {$table}: " . $e->getMessage());
                }
            }
        }
    }

    /**
     * Seed essential users and roles
     */
    private function seedUsersAndRoles(): void
    {
        // Create workshop manager user
        DB::table('users')->insert([
            'name' => 'مديرة الورشة - أم محمد',
            'email' => 'manager@huda-workshop.com',
            'password' => Hash::make('manager123'),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);

        // Create head seamstress user
        DB::table('users')->insert([
            'name' => 'رئيسة الخياطات - فاطمة الأستاذة',
            'email' => 'head.seamstress@huda-workshop.com',
            'password' => Hash::make('seamstress123'),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);

        // Create cashier user
        DB::table('users')->insert([
            'name' => 'أمينة الصندوق - نورا',
            'email' => 'cashier@huda-workshop.com',
            'password' => Hash::make('cashier123'),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);

        // Create quality control user
        DB::table('users')->insert([
            'name' => 'مراقبة الجودة - منيرة',
            'email' => 'quality@huda-workshop.com',
            'password' => Hash::make('quality123'),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);
    }

    /**
     * Seed dashboard metrics and summary data
     */
    private function seedDashboardMetrics(): void
    {
        // Current month summary
        DB::table('monthly_summaries')->insert([
            'month' => Carbon::now()->format('Y-m'),
            'total_revenue' => 12850.750,
            'total_expenses' => 4635.000,
            'net_profit' => 8215.750,
            'orders_completed' => 28,
            'orders_pending' => 12,
            'active_clients' => 45,
            'new_clients' => 8,
            'worker_efficiency' => 92.5,
            'quality_average' => 94.2,
            'customer_satisfaction' => 96.8,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);

        // Yearly targets
        DB::table('annual_targets')->insert([
            'year' => Carbon::now()->year,
            'revenue_target' => 150000.000,
            'orders_target' => 500,
            'efficiency_target' => 95.0,
            'quality_target' => 95.0,
            'customer_satisfaction_target' => 98.0,
            'new_clients_target' => 100,
            'current_revenue' => 45620.250,
            'current_orders' => 156,
            'achievement_percentage' => 30.4,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);

        // Workshop capacity data
        DB::table('workshop_capacity')->insert([
            'total_workstations' => 8,
            'active_workstations' => 6,
            'max_daily_orders' => 5,
            'current_utilization' => 75.0,
            'peak_season_capacity' => 8,
            'off_season_capacity' => 4,
            'overtime_capacity' => 12,
            'quality_stations' => 2,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);
    }

    /**
     * Display seeding summary
     */
    private function displaySummary(): void
    {
        $this->command->info('');
        $this->command->info('📋 KUWAITI WOMEN TAILORING WORKSHOP - SEEDING SUMMARY');
        $this->command->info('=====================================================');
        
        // Count records in each table
        $counts = [
            'عملاء كويتيات' => DB::table('clients')->count(),
            'عاملات ورشة' => DB::table('workers')->count(),
            'طلبيات تفصيل' => DB::table('orders')->count(),
            'خامات وأقمشة' => DB::table('inventory')->count(),
            'مهام إنتاج' => DB::table('production_tasks')->count(),
            'منتجات البوتيك' => DB::table('boutique_products')->count(),
            'عملاء الولاء' => DB::table('loyalty_customers')->count(),
            'سجلات مبيعات' => DB::table('sales')->count(),
            'سجلات مصروفات' => DB::table('expenses')->count(),
            'سجلات حضور' => DB::table('attendance')->count(),
            'تقارير جودة' => DB::table('quality_control')->count(),
            'مستخدمين النظام' => DB::table('users')->count()
        ];

        foreach ($counts as $type => $count) {
            $this->command->info("✅ {$type}: {$count} سجل");
        }

        $this->command->info('');
        $this->command->info('👤 Default User Accounts Created:');
        $this->command->info('📧 Manager: manager@huda-workshop.com / manager123');
        $this->command->info('📧 Head Seamstress: head.seamstress@huda-workshop.com / seamstress123');
        $this->command->info('📧 Cashier: cashier@huda-workshop.com / cashier123');
        $this->command->info('📧 Quality Control: quality@huda-workshop.com / quality123');
        
        $this->command->info('');
        $this->command->info('🌟 Sample Data Features:');
        $this->command->info('• Authentic Kuwaiti women clients with Arabic names');
        $this->command->info('• Traditional & modern women clothing orders');
        $this->command->info('• Professional female tailoring workforce');
        $this->command->info('• Comprehensive materials inventory');
        $this->command->info('• Financial records with KWD currency');
        $this->command->info('• Quality control and analytics data');
        $this->command->info('• Loyalty program for regular customers');
        $this->command->info('• Boutique ready-made products');
        
        $this->command->info('');
        $this->command->info('🎯 Next Steps:');
        $this->command->info('1. Login with any of the provided accounts');
        $this->command->info('2. Explore the dashboard with real data');
        $this->command->info('3. View clients, orders, and production workflow');
        $this->command->info('4. Test POS system with boutique products');
        $this->command->info('5. Review analytics and financial reports');
        
        $this->command->info('');
        $this->command->info('🇰🇼 WORKSHOP READY FOR KUWAITI WOMEN TAILORING BUSINESS! 🇰🇼');
        $this->command->info('=========================================================');
    }
}