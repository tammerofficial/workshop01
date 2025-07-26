<?php

namespace Database\Factories;

use App\Models\Report;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Report>
 */
class ReportFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Report::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['sales', 'production', 'inventory', 'financial', 'quality'];
        $formats = ['pdf', 'excel', 'csv'];
        
        return [
            'order_id' => fake()->numberBetween(1, 20),
            'user_id' => fake()->numberBetween(1, 20),
            'report_type' => fake()->randomElement($types),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'generated_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'file_path' => 'reports/' . fake()->uuid() . '.pdf',
            'format' => fake()->randomElement($formats),
            'is_scheduled' => fake()->boolean(30),
            'schedule_frequency' => fake()->optional()->randomElement(['daily', 'weekly', 'monthly']),
        ];
    }
}
