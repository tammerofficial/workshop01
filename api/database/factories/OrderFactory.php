<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Order::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['pending', 'in_progress', 'completed', 'cancelled'];
        $types = ['Suit', 'Shirt', 'Pants', 'Jacket', 'Dress', 'Coat'];
        $priorities = ['low', 'medium', 'high', 'urgent'];
        
        return [
            'title' => 'ODR-' . fake()->unique()->numberBetween(1000, 9999),
            'description' => fake()->sentence(),
            'client_id' => fake()->numberBetween(1, 20),
            'assigned_worker_id' => fake()->optional()->numberBetween(1, 20),
            'status' => fake()->randomElement($statuses),
            'type' => fake()->randomElement($types),
            'priority' => fake()->randomElement($priorities),
            'estimated_completion_date' => fake()->dateTimeBetween('now', '+30 days'),
            'actual_completion_date' => fake()->optional()->dateTimeBetween('-30 days', 'now'),
            'total_cost' => fake()->randomFloat(2, 50, 500),
            'deposit_amount' => fake()->optional()->randomFloat(2, 10, 100),
            'notes' => fake()->optional()->paragraph(),
        ];
    }
}
