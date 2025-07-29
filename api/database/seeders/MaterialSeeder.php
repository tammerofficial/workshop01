<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Material;

class MaterialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $materials = [
            // مواد خشبية
            [
                'name' => 'خشب الصنوبر',
                'description' => 'خشب طبيعي عالي الجودة مناسب للأثاث',
                'type' => 'wood',
                'unit' => 'م²',
                'quantity' => 100.00,
                'reserved_quantity' => 0.00,
                'cost_per_unit' => 45.50,
                'supplier' => 'مؤسسة الأخشاب المتقدمة',
                'sku' => 'WOOD-PINE-001',
                'reorder_level' => 20.00,
                'is_active' => true
            ],
            [
                'name' => 'خشب البلوط',
                'description' => 'خشب صلب مقاوم للرطوبة',
                'type' => 'wood',
                'unit' => 'م²',
                'quantity' => 75.00,
                'reserved_quantity' => 0.00,
                'cost_per_unit' => 89.75,
                'supplier' => 'شركة الأخشاب الفاخرة',
                'sku' => 'WOOD-OAK-001',
                'reorder_level' => 15.00,
                'is_active' => true
            ],
            [
                'name' => 'خشب MDF',
                'description' => 'خشب مضغوط متوسط الكثافة',
                'type' => 'composite',
                'unit' => 'لوح',
                'quantity' => 50.00,
                'reserved_quantity' => 0.00,
                'cost_per_unit' => 25.00,
                'supplier' => 'مصنع الألواح الحديثة',
                'sku' => 'COMP-MDF-001',
                'reorder_level' => 10.00,
                'is_active' => true
            ],
            
            // مواد معدنية
            [
                'name' => 'مفصلات الأبواب',
                'description' => 'مفصلات معدنية مقاومة للصدأ',
                'type' => 'hardware',
                'unit' => 'قطعة',
                'quantity' => 200.00,
                'reserved_quantity' => 0.00,
                'cost_per_unit' => 12.50,
                'supplier' => 'شركة الحديد والصلب',
                'sku' => 'HARD-HINGE-001',
                'reorder_level' => 50.00,
                'is_active' => true
            ],
            [
                'name' => 'مقابض الخزائن',
                'description' => 'مقابض معدنية أنيقة',
                'type' => 'hardware',
                'unit' => 'قطعة',
                'quantity' => 150.00,
                'reserved_quantity' => 0.00,
                'cost_per_unit' => 8.75,
                'supplier' => 'مؤسسة الإكسسوارات',
                'sku' => 'HARD-HANDLE-001',
                'reorder_level' => 30.00,
                'is_active' => true
            ],
            [
                'name' => 'براغي الخشب',
                'description' => 'براغي معدنية مختلفة الأحجام',
                'type' => 'hardware',
                'unit' => 'كيلو',
                'quantity' => 25.00,
                'reserved_quantity' => 0.00,
                'cost_per_unit' => 15.00,
                'supplier' => 'محل المسامير والأدوات',
                'sku' => 'HARD-SCREW-001',
                'reorder_level' => 5.00,
                'is_active' => true
            ],
            
            // مواد التشطيب
            [
                'name' => 'ورنيش شفاف',
                'description' => 'ورنيش حماية وتلميع الخشب',
                'type' => 'finish',
                'unit' => 'لتر',
                'quantity' => 30.00,
                'reserved_quantity' => 0.00,
                'cost_per_unit' => 35.00,
                'supplier' => 'شركة الدهانات المتطورة',
                'sku' => 'FINISH-VARN-001',
                'reorder_level' => 8.00,
                'is_active' => true
            ],
            [
                'name' => 'دهان أبيض',
                'description' => 'دهان أبيض لامع للخشب',
                'type' => 'finish',
                'unit' => 'لتر',
                'quantity' => 40.00,
                'reserved_quantity' => 0.00,
                'cost_per_unit' => 28.50,
                'supplier' => 'شركة الدهانات المتطورة',
                'sku' => 'FINISH-WHITE-001',
                'reorder_level' => 10.00,
                'is_active' => true
            ],
            [
                'name' => 'دهان بني خشبي',
                'description' => 'دهان بني بملمس خشبي طبيعي',
                'type' => 'finish',
                'unit' => 'لتر',
                'quantity' => 35.00,
                'reserved_quantity' => 0.00,
                'cost_per_unit' => 32.00,
                'supplier' => 'شركة الدهانات المتطورة',
                'sku' => 'FINISH-BROWN-001',
                'reorder_level' => 8.00,
                'is_active' => true
            ],
            
            // مواد لاصقة
            [
                'name' => 'غراء الخشب',
                'description' => 'غراء قوي مخصص للخشب',
                'type' => 'adhesive',
                'unit' => 'كيلو',
                'quantity' => 20.00,
                'reserved_quantity' => 0.00,
                'cost_per_unit' => 18.00,
                'supplier' => 'شركة المواد الكيماوية',
                'sku' => 'ADHES-WOOD-001',
                'reorder_level' => 5.00,
                'is_active' => true
            ],
            [
                'name' => 'سيليكون شفاف',
                'description' => 'سيليكون مانع للتسرب',
                'type' => 'adhesive',
                'unit' => 'أنبوب',
                'quantity' => 50.00,
                'reserved_quantity' => 0.00,
                'cost_per_unit' => 6.50,
                'supplier' => 'شركة المواد الكيماوية',
                'sku' => 'ADHES-SILIC-001',
                'reorder_level' => 15.00,
                'is_active' => true
            ],
            
            // مواد إضافية
            [
                'name' => 'زجاج شفاف 4مم',
                'description' => 'زجاج شفاف للخزائن والنوافذ',
                'type' => 'glass',
                'unit' => 'م²',
                'quantity' => 30.00,
                'reserved_quantity' => 0.00,
                'cost_per_unit' => 45.00,
                'supplier' => 'مصنع الزجاج الحديث',
                'sku' => 'GLASS-CLEAR-4MM',
                'reorder_level' => 8.00,
                'is_active' => true
            ],
            [
                'name' => 'قماش التنجيد',
                'description' => 'قماش عالي الجودة للكراسي والأرائك',
                'type' => 'fabric',
                'unit' => 'متر',
                'quantity' => 80.00,
                'reserved_quantity' => 0.00,
                'cost_per_unit' => 22.50,
                'supplier' => 'محل الأقمشة الفاخرة',
                'sku' => 'FABRIC-UPHOL-001',
                'reorder_level' => 20.00,
                'is_active' => true
            ],
            [
                'name' => 'إسفنج التنجيد',
                'description' => 'إسفنج عالي الكثافة للمقاعد',
                'type' => 'fabric',
                'unit' => 'م²',
                'quantity' => 60.00,
                'reserved_quantity' => 0.00,
                'cost_per_unit' => 15.75,
                'supplier' => 'مصنع الإسفنج',
                'sku' => 'FABRIC-FOAM-001',
                'reorder_level' => 15.00,
                'is_active' => true
            ],
            [
                'name' => 'ألواح الألمنيوم',
                'description' => 'ألواح ألمنيوم للإطارات',
                'type' => 'metal',
                'unit' => 'متر',
                'quantity' => 40.00,
                'reserved_quantity' => 0.00,
                'cost_per_unit' => 55.00,
                'supplier' => 'شركة المعادن المتطورة',
                'sku' => 'METAL-ALUM-001',
                'reorder_level' => 10.00,
                'is_active' => true
            ]
        ];

        foreach ($materials as $material) {
            Material::create($material);
        }

        $this->command->info('تم إنشاء ' . count($materials) . ' مادة بنجاح');
    }
}
