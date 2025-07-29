<?php

namespace Database\Factories;

use App\Models\Material;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Material>
 */
class MaterialFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Material::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $materials = ['Wool', 'Cotton', 'Silk', 'Linen', 'Polyester', 'Velvet', 'Denim', 'Satin'];
        $units = ['meters', 'yards', 'pieces', 'rolls'];
        $suppliers = ['Textile Co.', 'Fabric World', 'Premium Materials', 'Global Textiles'];
        
        return [
            'name' => fake()->randomElement($materials),
            'description' => fake()->sentence(),
            'category_id' => fake()->numberBetween(1, 5),
            'sku' => 'MAT-' . fake()->unique()->numberBetween(1000, 9999),
            'quantity' => fake()->numberBetween(10, 500),
            'unit' => fake()->randomElement($units),
            'cost_per_unit' => fake()->randomFloat(2, 5, 50),
            'supplier' => fake()->randomElement($suppliers),
            'reorder_level' => fake()->numberBetween(5, 50),
            'location' => fake()->randomElement(['Warehouse A', 'Warehouse B', 'Storage Room']),
            'image_url' => null, // تم إزالة الصور المعطلة مؤقتاً
            'is_active' => fake()->boolean(90),
        ];
    }
}
