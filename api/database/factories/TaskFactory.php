<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\Order;
use App\Models\Worker;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Task::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['pending', 'in_progress', 'completed', 'cancelled'];
        $priorities = ['low', 'medium', 'high', 'urgent'];
        $types = ['Cutting', 'Sewing', 'Fitting', 'Finishing', 'Quality Check'];
        
        return [
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'order_id' => fake()->numberBetween(1, 20),
            'assigned_worker_id' => fake()->optional()->numberBetween(1, 20),
            'status' => fake()->randomElement($statuses),
            'priority' => fake()->randomElement($priorities),
            'type' => fake()->randomElement($types),
            'estimated_hours' => fake()->numberBetween(1, 8),
            'actual_hours' => fake()->optional()->numberBetween(1, 10),
            'start_date' => fake()->dateTimeBetween('-7 days', 'now'),
            'due_date' => fake()->dateTimeBetween('now', '+7 days'),
            'completed_date' => fake()->optional()->dateTimeBetween('-7 days', 'now'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
