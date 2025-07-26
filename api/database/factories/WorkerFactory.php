<?php

namespace Database\Factories;

use App\Models\Worker;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Worker>
 */
class WorkerFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Worker::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $roles = ['Tailor', 'Cutter', 'Finisher', 'Quality Inspector', 'Supervisor'];
        $departments = ['Production', 'Quality Control', 'Management'];
        
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'role' => fake()->randomElement($roles),
            'department' => fake()->randomElement($departments),
            'salary' => fake()->randomFloat(2, 300, 800),
            'hire_date' => fake()->dateTimeBetween('-2 years', 'now'),
            'is_active' => fake()->boolean(80),
            'skills' => fake()->randomElements(['Sewing', 'Cutting', 'Ironing', 'Quality Control', 'Pattern Making'], fake()->numberBetween(1, 3)),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
