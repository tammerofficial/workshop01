<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Carbon\Carbon;

class ActivityLogSeederFixed extends Seeder
{
    public function run()
    {
        // Get real admin users
        $mainAdmin = User::where('email', 'admin@workshop.com')->first();
        $superAdmin = User::where('email', 'superadmin@workshop.com')->first();
        $localAdmin = User::where('email', 'admin@workshop.local')->first();
        
        // Fallback to any admin user if specific ones don't exist
        $fallbackAdmin = User::whereHas('role', function($query) {
            $query->where('name', 'admin');
        })->first();

        $activities = [
            [
                'log_name' => 'user_authentication',
                'description' => 'تم تسجيل دخول المدير العام للنظام',
                'event' => 'admin_login',
                'properties' => json_encode(['ip' => '192.168.1.100', 'user_agent' => 'Chrome 115.0', 'severity' => 'medium']),
                'causer_type' => User::class,
                'causer_id' => $superAdmin?->id ?? $fallbackAdmin?->id,
                'created_at' => Carbon::now()->subHours(1)->subMinutes(15),
                'updated_at' => Carbon::now()->subHours(1)->subMinutes(15)
            ],
            [
                'log_name' => 'order_management',
                'description' => 'تم إنشاء طلب جديد من عميل الورشة',
                'event' => 'order_created',
                'properties' => json_encode(['order_id' => 'ORD-2025-001', 'customer' => 'محمد أحمد العلي', 'amount' => 2500.00, 'severity' => 'low']),
                'causer_type' => User::class,
                'causer_id' => $mainAdmin?->id ?? $fallbackAdmin?->id,
                'created_at' => Carbon::now()->subMinutes(25),
                'updated_at' => Carbon::now()->subMinutes(25)
            ],
            [
                'log_name' => 'inventory_management',
                'description' => 'تم تحديث مخزون قطع غيار السيارات',
                'event' => 'inventory_updated',
                'properties' => json_encode(['item' => 'فلتر زيت', 'quantity_added' => 50, 'current_stock' => 120, 'severity' => 'low']),
                'causer_type' => User::class,
                'causer_id' => $localAdmin?->id ?? $fallbackAdmin?->id,
                'created_at' => Carbon::now()->subMinutes(45),
                'updated_at' => Carbon::now()->subMinutes(45)
            ],
            [
                'log_name' => 'production_tracking',
                'description' => 'تم بدء عملية إصلاح سيارة جديدة',
                'event' => 'repair_started',
                'properties' => json_encode(['vehicle' => 'تويوتا كامري 2020', 'issue' => 'تغيير زيت المحرك', 'technician' => 'خالد محمد', 'severity' => 'medium']),
                'causer_type' => User::class,
                'causer_id' => $mainAdmin?->id ?? $fallbackAdmin?->id,
                'created_at' => Carbon::now()->subHours(2)->subMinutes(10),
                'updated_at' => Carbon::now()->subHours(2)->subMinutes(10)
            ],
            [
                'log_name' => 'financial_management',
                'description' => 'تم تسجيل دفعة مالية من عميل',
                'event' => 'payment_received',
                'properties' => json_encode(['amount' => 1800.00, 'method' => 'نقداً', 'customer' => 'سارة عبدالله', 'invoice' => 'INV-2025-045', 'severity' => 'high']),
                'causer_type' => User::class,
                'causer_id' => $superAdmin?->id ?? $fallbackAdmin?->id,
                'created_at' => Carbon::now()->subHours(3)->subMinutes(30),
                'updated_at' => Carbon::now()->subHours(3)->subMinutes(30)
            ],
            [
                'log_name' => 'quality_control',
                'description' => 'تم اجتياز فحص الجودة لمركبة مُصلحة',
                'event' => 'quality_check_passed',
                'properties' => json_encode(['vehicle' => 'هوندا أكورد 2019', 'inspector' => 'أحمد سالم', 'notes' => 'جميع الاختبارات ناجحة', 'severity' => 'low']),
                'causer_type' => User::class,
                'causer_id' => $localAdmin?->id ?? $fallbackAdmin?->id,
                'created_at' => Carbon::now()->subHours(4)->subMinutes(20),
                'updated_at' => Carbon::now()->subHours(4)->subMinutes(20)
            ],
            [
                'log_name' => 'customer_management',
                'description' => 'تم تسجيل عميل جديد في النظام',
                'event' => 'customer_registered',
                'properties' => json_encode(['name' => 'عبدالرحمن خالد', 'phone' => '+966501234567', 'vehicle' => 'نيسان التيما 2021', 'severity' => 'low']),
                'causer_type' => User::class,
                'causer_id' => $mainAdmin?->id ?? $fallbackAdmin?->id,
                'created_at' => Carbon::now()->subHours(5),
                'updated_at' => Carbon::now()->subHours(5)
            ],
            [
                'log_name' => 'user_management',
                'description' => 'تم تحديث صلاحيات موظف في الورشة',
                'event' => 'permissions_updated',
                'properties' => json_encode(['user' => 'فاطمة أحمد', 'role' => 'محاسب', 'permissions' => ['manage_invoices', 'view_reports'], 'severity' => 'medium']),
                'causer_type' => User::class,
                'causer_id' => $superAdmin?->id ?? $fallbackAdmin?->id,
                'created_at' => Carbon::now()->subHours(6)->subMinutes(15),
                'updated_at' => Carbon::now()->subHours(6)->subMinutes(15)
            ],
            [
                'log_name' => 'security_monitoring',
                'description' => 'تم رصد محاولة دخول مشبوهة للنظام',
                'event' => 'suspicious_login_attempt',
                'properties' => json_encode(['ip' => '203.0.113.42', 'attempts' => 3, 'blocked' => true, 'severity' => 'high']),
                'causer_type' => User::class,
                'causer_id' => $superAdmin?->id ?? $fallbackAdmin?->id,
                'created_at' => Carbon::now()->subHours(8)->subMinutes(45),
                'updated_at' => Carbon::now()->subHours(8)->subMinutes(45)
            ],
            [
                'log_name' => 'appointment_scheduling',
                'description' => 'تم حجز موعد صيانة جديد',
                'event' => 'appointment_scheduled',
                'properties' => json_encode(['customer' => 'محمود علي', 'date' => '2025-01-15', 'time' => '10:00 AM', 'service' => 'فحص شامل', 'severity' => 'low']),
                'causer_type' => User::class,
                'causer_id' => $mainAdmin?->id ?? $fallbackAdmin?->id,
                'created_at' => Carbon::now()->subHours(12),
                'updated_at' => Carbon::now()->subHours(12)
            ],
            [
                'log_name' => 'backup_management',
                'description' => 'تم إنشاء نسخة احتياطية من قاعدة البيانات',
                'event' => 'database_backup_created',
                'properties' => json_encode(['size' => '245.6 MB', 'duration' => '3.2 minutes', 'status' => 'success', 'severity' => 'medium']),
                'causer_type' => User::class,
                'causer_id' => $superAdmin?->id ?? $fallbackAdmin?->id,
                'created_at' => Carbon::now()->subDay(),
                'updated_at' => Carbon::now()->subDay()
            ],
            [
                'log_name' => 'system_maintenance',
                'description' => 'تم تحديث النظام إلى الإصدار الجديد',
                'event' => 'system_updated',
                'properties' => json_encode(['version' => '2.1.5', 'features' => ['تحسينات الأمان', 'واجهة محدثة'], 'downtime' => '15 minutes', 'severity' => 'high']),
                'causer_type' => User::class,
                'causer_id' => $superAdmin?->id ?? $fallbackAdmin?->id,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2)
            ]
        ];

        DB::table('activity_logs')->insert($activities);
    }
}
