<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Notification::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['order', 'production', 'inventory', 'payment', 'system'];
        $priorities = ['low', 'medium', 'high', 'urgent'];
        
        return [
            'user_id' => fake()->numberBetween(1, 20),
            'title' => fake()->sentence(3),
            'message' => fake()->paragraph(),
            'type' => fake()->randomElement($types),
            'priority' => fake()->randomElement($priorities),
            'is_read' => fake()->boolean(30),
            'read_at' => fake()->optional()->dateTimeBetween('-7 days', 'now'),
            'data' => json_encode(['order_id' => fake()->numberBetween(1, 20)]),
        ];
    }
}
