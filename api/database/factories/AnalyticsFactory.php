<?php

namespace Database\Factories;

use App\Models\Analytics;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Analytics>
 */
class AnalyticsFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Analytics::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $metrics = ['sales', 'production', 'inventory', 'quality', 'efficiency'];
        $periods = ['daily', 'weekly', 'monthly', 'quarterly'];
        
        return [
            'metric_name' => fake()->randomElement($metrics),
            'metric_value' => fake()->randomFloat(2, 0, 1000),
            'period' => fake()->randomElement($periods),
            'period_date' => fake()->dateTimeBetween('-1 year', 'now'),
            'target_value' => fake()->randomFloat(2, 0, 1000),
            'is_achieved' => fake()->boolean(70),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
