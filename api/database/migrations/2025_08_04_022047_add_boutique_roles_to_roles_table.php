<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // أدوار البوتيك الجديدة
        $boutiqueRoles = [
            [
                'name' => 'boutique_cashier',
                'display_name' => 'كاشير البوتيك',
                'description' => 'كاشير متخصص في نقاط البيع',
                'hierarchy_level' => 3,
                'is_system_role' => false,
                'permissions' => [
                    'pos.operate',
                    'boutique.view',
                    'boutique.inventory_view',
                    'boutique.customer_create',
                    'sales.view',
                    'loyalty.boutique_integration',
                ]
            ],
            [
                'name' => 'boutique_sales_agent',
                'display_name' => 'موظف مبيعات البوتيك',
                'description' => 'موظف مبيعات مع صلاحيات إضافية',
                'hierarchy_level' => 4,
                'is_system_role' => false,
                'permissions' => [
                    'pos.operate',
                    'pos.discount',
                    'boutique.view',
                    'boutique.inventory_view',
                    'boutique.customer_create',
                    'boutique.customer_edit',
                    'sales.view',
                    'loyalty.boutique_integration',
                ]
            ],
            [
                'name' => 'boutique_supervisor',
                'display_name' => 'مشرف البوتيك',
                'description' => 'مشرف مبيعات مع صلاحيات إدارية',
                'hierarchy_level' => 5,
                'is_system_role' => false,
                'permissions' => [
                    'pos.operate',
                    'pos.discount',
                    'pos.refund',
                    'boutique.view',
                    'boutique.inventory_view',
                    'boutique.customer_create',
                    'boutique.customer_edit',
                    'sales.view',
                    'sales.reports',
                    'loyalty.boutique_integration',
                    'loyalty.wallet_update',
                ]
            ],
            [
                'name' => 'boutique_senior_supervisor',
                'display_name' => 'مشرف أول البوتيك',
                'description' => 'مشرف أول مع صلاحيات متقدمة',
                'hierarchy_level' => 6,
                'is_system_role' => false,
                'permissions' => [
                    'pos.operate',
                    'pos.discount',
                    'pos.refund',
                    'pos.void_transaction',
                    'boutique.view',
                    'boutique.inventory_view',
                    'boutique.inventory_adjust',
                    'boutique.customer_create',
                    'boutique.customer_edit',
                    'sales.view',
                    'sales.reports',
                    'loyalty.boutique_integration',
                    'loyalty.wallet_update',
                    'loyalty.points_manage',
                ]
            ],
            [
                'name' => 'boutique_manager',
                'display_name' => 'مدير البوتيك',
                'description' => 'مدير البوتيك مع صلاحيات إدارة كاملة',
                'hierarchy_level' => 7,
                'is_system_role' => false,
                'permissions' => [
                    'boutique.manage',
                    'boutique.view',
                    'boutique.edit',
                    'pos.operate',
                    'pos.discount',
                    'pos.refund',
                    'pos.void_transaction',
                    'boutique.inventory_view',
                    'boutique.inventory_adjust',
                    'boutique.customer_create',
                    'boutique.customer_edit',
                    'sales.view',
                    'sales.reports',
                    'sales.analytics',
                    'loyalty.boutique_integration',
                    'loyalty.wallet_update',
                    'loyalty.points_manage',
                ]
            ],
            [
                'name' => 'boutique_regional_manager',
                'display_name' => 'مدير إقليمي البوتيك',
                'description' => 'مدير إقليمي مسؤول عن عدة فروع',
                'hierarchy_level' => 8,
                'is_system_role' => false,
                'permissions' => [
                    'boutique.manage',
                    'boutique.view',
                    'boutique.edit',
                    'boutique.create',
                    'pos.operate',
                    'pos.discount',
                    'pos.refund',
                    'pos.void_transaction',
                    'boutique.inventory_view',
                    'boutique.inventory_adjust',
                    'boutique.customer_create',
                    'boutique.customer_edit',
                    'sales.view',
                    'sales.reports',
                    'sales.analytics',
                    'loyalty.boutique_integration',
                    'loyalty.wallet_update',
                    'loyalty.points_manage',
                ]
            ]
        ];

        // إنشاء الأدوار
        foreach ($boutiqueRoles as $roleData) {
            Role::firstOrCreate(
                ['name' => $roleData['name']],
                $roleData
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // حذف أدوار البوتيك
        $roleNames = [
            'boutique_cashier',
            'boutique_sales_agent', 
            'boutique_supervisor',
            'boutique_senior_supervisor',
            'boutique_manager',
            'boutique_regional_manager'
        ];
        
        Role::whereIn('name', $roleNames)->delete();
    }
};