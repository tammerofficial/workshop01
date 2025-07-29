<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Material;
use App\Models\ProductMaterialRequirement;

class ProductMaterialRequirementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // جلب المواد الموجودة
        $materials = Material::all();
        
        if ($materials->isEmpty()) {
            $this->command->warn('لا توجد مواد في قاعدة البيانات. يرجى تشغيل MaterialSeeder أولاً');
            return;
        }

        $productTypes = [
            'furniture' => [
                'small' => ['complexity' => 'simple', 'materials_count' => 3],
                'medium' => ['complexity' => 'medium', 'materials_count' => 5],
                'large' => ['complexity' => 'complex', 'materials_count' => 8]
            ],
            'cabinet' => [
                'small' => ['complexity' => 'medium', 'materials_count' => 4],
                'medium' => ['complexity' => 'medium', 'materials_count' => 6],
                'large' => ['complexity' => 'complex', 'materials_count' => 9]
            ],
            'door' => [
                'standard' => ['complexity' => 'simple', 'materials_count' => 3],
                'custom' => ['complexity' => 'medium', 'materials_count' => 5]
            ],
            'window' => [
                'standard' => ['complexity' => 'simple', 'materials_count' => 3],
                'custom' => ['complexity' => 'medium', 'materials_count' => 4]
            ],
            'general' => [
                'small' => ['complexity' => 'simple', 'materials_count' => 2],
                'medium' => ['complexity' => 'medium', 'materials_count' => 4],
                'large' => ['complexity' => 'complex', 'materials_count' => 6]
            ]
        ];

        foreach ($productTypes as $productType => $sizes) {
            foreach ($sizes as $size => $config) {
                $selectedMaterials = $materials->random($config['materials_count']);
                
                foreach ($selectedMaterials as $material) {
                    // حساب الكمية المطلوبة حسب نوع المادة والحجم
                    $baseQuantity = $this->calculateBaseQuantity($material->type, $size);
                    $wastePercentage = $this->getWastePercentage($material->type);
                    
                    ProductMaterialRequirement::create([
                        'product_type' => $productType,
                        'product_size' => $size,
                        'material_id' => $material->id,
                        'required_quantity' => $baseQuantity,
                        'waste_percentage' => $wastePercentage,
                        'notes' => "متطلبات {$productType} - حجم {$size}"
                    ]);
                }
            }
        }

        $this->command->info('تم إنشاء متطلبات المواد للمنتجات بنجاح');
    }

    private function calculateBaseQuantity($materialType, $size)
    {
        $sizeMultipliers = [
            'small' => 1,
            'medium' => 1.5,
            'large' => 2.5,
            'standard' => 1.2,
            'custom' => 1.8
        ];

        $materialBaseQuantities = [
            'wood' => 5,
            'hardware' => 10,
            'finish' => 2,
            'adhesive' => 1,
            'tool' => 1,
            'composite' => 3,
            'metal' => 2,
            'fabric' => 1.5,
            'glass' => 1
        ];

        $multiplier = $sizeMultipliers[$size] ?? 1;
        $baseQty = $materialBaseQuantities[$materialType] ?? 2;

        return round($baseQty * $multiplier, 2);
    }

    private function getWastePercentage($materialType)
    {
        $wastePercentages = [
            'wood' => 15,
            'hardware' => 5,
            'finish' => 10,
            'adhesive' => 20,
            'tool' => 0,
            'composite' => 12,
            'metal' => 8,
            'fabric' => 10,
            'glass' => 5
        ];

        return $wastePercentages[$materialType] ?? 10;
    }

    private function isCriticalMaterial($materialType)
    {
        $criticalMaterials = ['wood', 'hardware', 'metal'];
        return in_array($materialType, $criticalMaterials);
    }

    private function getAlternativeMaterials($currentMaterial, $allMaterials)
    {
        // البحث عن مواد بديلة من نفس النوع
        $alternatives = $allMaterials
            ->where('type', $currentMaterial->type)
            ->where('id', '!=', $currentMaterial->id)
            ->pluck('id')
            ->take(2)
            ->toArray();

        return json_encode($alternatives);
    }
}
