<?php

namespace Database\Factories;

use App\Models\QualityCheck;
use App\Models\Production;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\QualityCheck>
 */
class QualityCheckFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = QualityCheck::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $results = ['passed', 'failed', 'needs_rework'];
        $inspectors = ['Quality Inspector 1', 'Quality Inspector 2', 'Senior Inspector'];
        
        return [
            'production_id' => fake()->numberBetween(1, 20),
            'inspector_id' => fake()->numberBetween(1, 20),
            'inspection_date' => fake()->dateTimeBetween('-7 days', 'now'),
            'result' => fake()->randomElement($results),
            'inspector_name' => fake()->randomElement($inspectors),
            'notes' => fake()->optional()->sentence(),
            'rework_required' => fake()->boolean(20),
            'rework_notes' => fake()->optional()->sentence(),
        ];
    }
}
