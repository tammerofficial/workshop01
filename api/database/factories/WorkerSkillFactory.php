<?php

namespace Database\Factories;

use App\Models\WorkerSkill;
use App\Models\Worker;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkerSkill>
 */
class WorkerSkillFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = WorkerSkill::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $skills = ['Sewing', 'Cutting', 'Ironing', 'Quality Control', 'Pattern Making', 'Embroidery', 'Button Making', 'Zipper Installation'];
        $levels = ['beginner', 'intermediate', 'advanced', 'expert'];
        
        return [
            'worker_id' => fake()->numberBetween(1, 20),
            'skill_name' => fake()->randomElement($skills),
            'skill_level' => fake()->randomElement($levels),
            'years_experience' => fake()->numberBetween(1, 15),
            'certification' => fake()->optional()->sentence(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
