<?php

namespace Database\Factories;

use App\Models\OrderMaterial;
use App\Models\Order;
use App\Models\Material;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderMaterial>
 */
class OrderMaterialFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = OrderMaterial::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => fake()->numberBetween(1, 20),
            'material_id' => fake()->numberBetween(1, 20),
            'quantity' => fake()->numberBetween(1, 10),
            'unit_cost' => fake()->randomFloat(2, 5, 50),
            'total_cost' => fake()->randomFloat(2, 10, 500),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
