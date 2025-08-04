<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ActivityLog;
use App\Models\User;
use Carbon\Carbon;

class ActivityLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // الحصول على المستخدمين الحقيقيين (المدراء)
        $adminUsers = User::whereIn('email', [
            'admin@workshop.com',
            'superadmin@workshop.com', 
            'admin@workshop.local'
        ])->get();
        
        $systemAdmin = $adminUsers->where('email', 'superadmin@workshop.com')->first();
        $mainAdmin = $adminUsers->where('email', 'admin@workshop.com')->first();  
        $generalAdmin = $adminUsers->where('email', 'admin@workshop.local')->first();
        
        // استخدام أول مستخدم متوفر كبديل
        $fallbackAdmin = $adminUsers->first();
        
        if ($adminUsers->isEmpty()) {
            $this->command->warn('لم يتم العثور على مستخدمين مدراء حقيقيين. سيتم استخدام النظام كمرجع.');
        }

        $activities = [
            [
                'log_name' => 'authentication',
                'description' => 'تم تسجيل دخول المدير العام بنجاح',
                'event' => 'admin_login',
                'properties' => ['ip' => '192.168.1.100', 'user_agent' => 'Chrome 115.0', 'severity' => 'medium'],
                                ],
                'causer_type' => User::class,
                'causer_id' => $superAdmin?->id ?? $fallbackAdmin?->id,
                'created_at' => Carbon::now()->subHours(1)->subMinutes(15)
            ],
            [
                'log_name' => 'order_management',
                'description' => 'تم إنشاء طلب جديد من عميل الورشة',
                'event' => 'order_created',
                'properties' => [
                    'order_id' => 142, 
                    'client_name' => 'شركة الخليج للملابس',
                    'order_type' => 'بدلة رسمية',
                    'quantity' => 5,
                    'severity' => 'low'
                ],
                'causer_type' => User::class,
                'causer_id' => $mainAdmin?->id ?? $fallbackAdmin?->id,
                'created_at' => Carbon::now()->subMinutes(25)
            ],
            [
                'log_name' => 'inventory_management', 
                'description' => 'تم تحديث مخزون القماش الصوفي',
                'event' => 'inventory_updated',
                'properties' => [
                    'material_name' => 'قماش صوفي أزرق',
                    'old_quantity' => 50,
                    'new_quantity' => 75,
                    'added_quantity' => 25,
                    'severity' => 'low'
                ],
                'causer_type' => User::class,
                'causer_id' => $mainAdmin?->id,
                'created_at' => Carbon::now()->subMinutes(45)
            ],
            [
                'log_name' => 'production_tracking',
                'description' => 'تم بدء مرحلة قص القماش للطلب 140',
                'event' => 'production_stage_started',
                'properties' => [
                    'order_id' => 140,
                    'stage' => 'قص القماش',
                    'worker_assigned' => 'أحمد محمد',
                    'estimated_duration' => '2 ساعات',
                    'severity' => 'low'
                ],
                'causer_type' => User::class,
                'causer_id' => $generalAdmin?->id,
                'created_at' => Carbon::now()->subHour()
            ],
            [
                'log_name' => 'user_management',
                'description' => 'تم إضافة عامل جديد للورشة',
                'event' => 'worker_added',
                'properties' => [
                    'worker_name' => 'محمد عبدالله',
                    'position' => 'خياط',
                    'department' => 'الإنتاج',
                    'hire_date' => Carbon::today()->format('Y-m-d'),
                    'severity' => 'medium'
                ],
                'causer_type' => User::class,
                'causer_id' => $systemAdmin?->id,
                'created_at' => Carbon::now()->subHours(2)
            ],
            [
                'log_name' => 'invoice_management',
                'description' => 'تم إصدار فاتورة للطلب 138',
                'event' => 'invoice_generated',
                'properties' => [
                    'invoice_id' => 'INV-2025-0238',
                    'order_id' => 138,
                    'amount' => 2500.00,
                    'currency' => 'SAR',
                    'client' => 'مؤسسة النجاح التجارية',
                    'severity' => 'low'
                ],
                'causer_type' => User::class,
                'causer_id' => $mainAdmin?->id,
                'created_at' => Carbon::now()->subHours(3)
            ],
            [
                'log_name' => 'quality_control',
                'description' => 'تم اجتياز فحص الجودة للطلب 135',
                'event' => 'quality_check_passed',
                'properties' => [
                    'order_id' => 135,
                    'inspector' => 'سارة أحمد',
                    'quality_score' => 95,
                    'notes' => 'جودة ممتازة، مطابق للمواصفات',
                    'severity' => 'low'
                ],
                'causer_type' => User::class,
                'causer_id' => $generalAdmin?->id,
                'created_at' => Carbon::now()->subHours(4)
            ],
            [
                'log_name' => 'attendance_management',
                'description' => 'تم تسجيل حضور العمال لليوم',
                'event' => 'daily_attendance_recorded',
                'properties' => [
                    'total_workers' => 15,
                    'present_workers' => 14,
                    'absent_workers' => 1,
                    'late_workers' => 2,
                    'date' => Carbon::today()->format('Y-m-d'),
                    'severity' => 'low'
                ],
                'causer_type' => User::class,
                'causer_id' => $mainAdmin?->id,
                'created_at' => Carbon::now()->subHours(6)
            ],
            [
                'log_name' => 'system_maintenance',
                'description' => 'تم تحديث نظام إدارة الورشة',
                'event' => 'system_updated',
                'properties' => [
                    'version' => '4.5.0',
                    'update_type' => 'security_patch',
                    'downtime' => '15 دقيقة',
                    'features_added' => ['RBAC Dashboard', 'Plugin Management'],
                    'severity' => 'medium'
                ],
                'causer_type' => User::class,
                'causer_id' => $systemAdmin?->id,
                'created_at' => Carbon::now()->subHours(8)
            ],
            [
                'log_name' => 'financial_management',
                'description' => 'تم حساب الرواتب لشهر أغسطس',
                'event' => 'payroll_calculated',
                'properties' => [
                    'month' => 'أغسطس 2025',
                    'total_employees' => 15,
                    'total_amount' => 45000.00,
                    'currency' => 'SAR',
                    'bonus_included' => true,
                    'severity' => 'medium'
                ],
                'causer_type' => User::class,
                'causer_id' => $systemAdmin?->id,
                'created_at' => Carbon::now()->subHours(12)
            ],
            [
                'log_name' => 'delivery_management',
                'description' => 'تم تسليم الطلب 132 للعميل',
                'event' => 'order_delivered',
                'properties' => [
                    'order_id' => 132,
                    'client' => 'شركة الرياض للاستثمار',
                    'delivery_date' => Carbon::yesterday()->format('Y-m-d'),
                    'delivery_time' => '14:30',
                    'items_count' => 8,
                    'customer_rating' => 5,
                    'severity' => 'low'
                ],
                'causer_type' => User::class,
                'causer_id' => $generalAdmin?->id,
                'created_at' => Carbon::now()->subDay()
            ],
            [
                'log_name' => 'security',
                'description' => 'تم إجراء نسخ احتياطي للبيانات',
                'event' => 'backup_completed',
                'properties' => [
                    'backup_type' => 'full_backup',
                    'backup_size' => '3.2 GB',
                    'duration' => '35 دقيقة',
                    'backup_location' => 'Cloud Storage',
                    'files_count' => 15420,
                    'severity' => 'low'
                ],
                'causer_type' => User::class,
                'causer_id' => $systemAdmin?->id,
                'created_at' => Carbon::now()->subDay()->subHours(2)
            ]
        ];

        foreach ($activities as $activity) {
            ActivityLog::create($activity);
        }

        $this->command->info('تم إنشاء ' . count($activities) . ' نشاط حقيقي بنجاح.');
    }
}
