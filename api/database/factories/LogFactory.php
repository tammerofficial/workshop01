<?php

namespace Database\Factories;

use App\Models\Log;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Log>
 */
class LogFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Log::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $levels = ['info', 'warning', 'error', 'debug'];
        $categories = ['auth', 'order', 'production', 'payment', 'system'];
        
        return [
            'user_id' => fake()->optional()->numberBetween(1, 20),
            'level' => fake()->randomElement($levels),
            'category' => fake()->randomElement($categories),
            'message' => fake()->sentence(),
            'context' => json_encode(['ip' => fake()->ipv4(), 'user_agent' => fake()->userAgent()]),
            'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
