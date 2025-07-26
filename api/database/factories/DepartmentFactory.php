<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Department>
 */
class DepartmentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Department::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $departments = ['Production', 'Quality Control', 'Sales', 'Finance', 'HR', 'IT', 'Maintenance'];
        
        return [
            'name' => fake()->randomElement($departments),
            'description' => fake()->sentence(),
            'manager_id' => fake()->optional()->numberBetween(1, 20),
            'budget' => fake()->randomFloat(2, 1000, 50000),
            'is_active' => fake()->boolean(90),
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
