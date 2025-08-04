<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Permission;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // صلاحيات البوتيك الشاملة
        $boutiquePermissions = [
            // إدارة البوتيك
            [
                'name' => 'boutique.manage',
                'display_name' => 'إدارة البوتيك',
                'description' => 'إدارة شاملة للبوتيك والفروع',
                'module' => 'boutique',
                'action' => 'manage',
            ],
            [
                'name' => 'boutique.create',
                'display_name' => 'إنشاء بوتيك جديد',
                'description' => 'إنشاء فروع وبوتيكات جديدة',
                'module' => 'boutique',
                'action' => 'create',
            ],
            [
                'name' => 'boutique.view',
                'display_name' => 'عرض بيانات البوتيك',
                'description' => 'عرض معلومات البوتيك والمبيعات',
                'module' => 'boutique',
                'action' => 'view',
            ],
            [
                'name' => 'boutique.edit',
                'display_name' => 'تعديل بيانات البوتيك',
                'description' => 'تعديل معلومات وإعدادات البوتيك',
                'module' => 'boutique',
                'action' => 'edit',
            ],
            
            // نظام نقاط البيع (POS)
            [
                'name' => 'pos.operate',
                'display_name' => 'تشغيل نقاط البيع',
                'description' => 'استخدام نظام نقاط البيع للمبيعات',
                'module' => 'pos',
                'action' => 'operate',
            ],
            [
                'name' => 'pos.refund',
                'display_name' => 'مرتجعات نقاط البيع',
                'description' => 'إجراء مرتجعات واسترداد في نقاط البيع',
                'module' => 'pos',
                'action' => 'refund',
            ],
            [
                'name' => 'pos.discount',
                'display_name' => 'خصومات نقاط البيع',
                'description' => 'منح خصومات في نقاط البيع',
                'module' => 'pos',
                'action' => 'discount',
            ],
            [
                'name' => 'pos.void_transaction',
                'display_name' => 'إلغاء معاملات',
                'description' => 'إلغاء معاملات نقاط البيع',
                'module' => 'pos',
                'action' => 'void',
            ],
            
            // إدارة المبيعات
            [
                'name' => 'sales.view',
                'display_name' => 'عرض المبيعات',
                'description' => 'عرض تقارير وبيانات المبيعات',
                'module' => 'sales',
                'action' => 'view',
            ],
            [
                'name' => 'sales.reports',
                'display_name' => 'تقارير المبيعات',
                'description' => 'إنشاء وعرض تقارير المبيعات المفصلة',
                'module' => 'sales',
                'action' => 'reports',
            ],
            [
                'name' => 'sales.analytics',
                'display_name' => 'تحليلات المبيعات',
                'description' => 'الوصول لتحليلات المبيعات المتقدمة',
                'module' => 'sales',
                'action' => 'analytics',
            ],
            
            // تكامل نظام الولاء
            [
                'name' => 'loyalty.boutique_integration',
                'display_name' => 'تكامل الولاء مع البوتيك',
                'description' => 'ربط نقاط الولاء مع مبيعات البوتيك',
                'module' => 'loyalty',
                'action' => 'integration',
            ],
            [
                'name' => 'loyalty.points_manage',
                'display_name' => 'إدارة نقاط الولاء',
                'description' => 'إضافة وخصم نقاط الولاء يدوياً',
                'module' => 'loyalty',
                'action' => 'manage_points',
            ],
            [
                'name' => 'loyalty.wallet_update',
                'display_name' => 'تحديث Apple Wallet',
                'description' => 'تحديث بطاقات العملاء في Apple Wallet',
                'module' => 'loyalty',
                'action' => 'wallet_update',
            ],
            
            // إدارة المخزون (خاص بالبوتيك)
            [
                'name' => 'boutique.inventory_view',
                'display_name' => 'عرض مخزون البوتيك',
                'description' => 'عرض مخزون المنتجات في البوتيك',
                'module' => 'inventory',
                'action' => 'view',
            ],
            [
                'name' => 'boutique.inventory_adjust',
                'display_name' => 'تعديل مخزون البوتيك',
                'description' => 'تعديل كميات المخزون في البوتيك',
                'module' => 'inventory',
                'action' => 'adjust',
            ],
            
            // إدارة العملاء (خاص بالبوتيك)
            [
                'name' => 'boutique.customer_create',
                'display_name' => 'إنشاء عملاء جدد',
                'description' => 'إضافة عملاء جدد في البوتيك',
                'module' => 'customers',
                'action' => 'create',
            ],
            [
                'name' => 'boutique.customer_edit',
                'display_name' => 'تعديل بيانات العملاء',
                'description' => 'تعديل معلومات العملاء',
                'module' => 'customers',
                'action' => 'edit',
            ],
        ];

        // إدراج الصلاحيات
        foreach ($boutiquePermissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // حذف صلاحيات البوتيك
        Permission::whereIn('module', ['boutique', 'pos'])->delete();
    }
};