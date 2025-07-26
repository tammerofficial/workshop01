<?php

namespace Database\Factories;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Setting>
 */
class SettingFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Setting::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['general', 'production', 'financial', 'notification', 'security'];
        
        return [
            'key' => fake()->unique()->word(),
            'value' => fake()->sentence(),
            'category' => fake()->randomElement($categories),
            'description' => fake()->sentence(),
            'is_public' => fake()->boolean(70),
            'data_type' => fake()->randomElement(['string', 'integer', 'boolean', 'json']),
        ];
    }
}
