<?php

namespace Database\Factories;

use App\Models\Calendar;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Calendar>
 */
class CalendarFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Calendar::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['appointment', 'fitting', 'delivery', 'meeting', 'maintenance'];
        $statuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];
        
        return [
            'user_id' => fake()->numberBetween(1, 20),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'type' => fake()->randomElement($types),
            'status' => fake()->randomElement($statuses),
            'start_date' => fake()->dateTimeBetween('now', '+30 days'),
            'end_date' => fake()->dateTimeBetween('now', '+30 days'),
            'client_id' => fake()->optional()->numberBetween(1, 20),
            'order_id' => fake()->optional()->numberBetween(1, 20),
            'location' => fake()->optional()->address(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
