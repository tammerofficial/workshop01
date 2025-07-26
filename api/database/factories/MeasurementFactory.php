<?php

namespace Database\Factories;

use App\Models\Measurement;
use App\Models\Client;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Measurement>
 */
class MeasurementFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Measurement::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'client_id' => fake()->numberBetween(1, 20),
            'order_id' => fake()->numberBetween(1, 20),
            'chest' => fake()->numberBetween(90, 120),
            'waist' => fake()->numberBetween(70, 100),
            'hips' => fake()->numberBetween(90, 120),
            'shoulder' => fake()->numberBetween(40, 50),
            'sleeve_length' => fake()->numberBetween(60, 80),
            'sleeve_width' => fake()->numberBetween(30, 40),
            'neck' => fake()->numberBetween(35, 45),
            'inseam' => fake()->numberBetween(70, 90),
            'outseam' => fake()->numberBetween(100, 120),
            'thigh' => fake()->numberBetween(50, 70),
            'knee' => fake()->numberBetween(40, 50),
            'ankle' => fake()->numberBetween(20, 30),
            'height' => fake()->numberBetween(160, 190),
            'weight' => fake()->numberBetween(60, 100),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
