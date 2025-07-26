<?php

namespace Database\Factories;

use App\Models\Production;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Production>
 */
class ProductionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Production::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['pending', 'in_progress', 'completed', 'cancelled'];
        $stages = ['Design', 'Cutting', 'Sewing', 'Fitting', 'Finishing', 'Quality Check'];
        
        return [
            'order_id' => fake()->numberBetween(1, 20),
            'stage' => fake()->randomElement($stages),
            'status' => fake()->randomElement($statuses),
            'start_date' => fake()->dateTimeBetween('-7 days', 'now'),
            'end_date' => fake()->optional()->dateTimeBetween('now', '+7 days'),
            'estimated_hours' => fake()->numberBetween(2, 12),
            'actual_hours' => fake()->optional()->numberBetween(1, 15),
            'worker_id' => fake()->optional()->numberBetween(1, 20),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
