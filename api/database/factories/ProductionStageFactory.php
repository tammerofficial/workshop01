<?php

namespace Database\Factories;

use App\Models\ProductionStage;
use App\Models\Production;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductionStage>
 */
class ProductionStageFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ProductionStage::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $stages = ['Design & Planning', 'Cutting', 'Sewing', 'Fitting', 'Finishing', 'Quality Check'];
        
        return [
            'name' => fake()->randomElement($stages),
            'description' => fake()->sentence(),
            'order_sequence' => fake()->numberBetween(1, 6),
            'estimated_hours' => fake()->numberBetween(1, 8),
            'is_active' => fake()->boolean(90),
        ];
    }
}
