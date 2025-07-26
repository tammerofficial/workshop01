<?php

namespace Database\Factories;

use App\Models\Backup;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Backup>
 */
class BackupFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Backup::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['full', 'incremental', 'differential'];
        $statuses = ['pending', 'in_progress', 'completed', 'failed'];
        
        return [
            'filename' => 'backup_' . fake()->date('Y-m-d_H-i-s') . '.sql',
            'type' => fake()->randomElement($types),
            'size_mb' => fake()->randomFloat(2, 10, 500),
            'status' => fake()->randomElement($statuses),
            'started_at' => fake()->dateTimeBetween('-7 days', 'now'),
            'completed_at' => fake()->optional()->dateTimeBetween('-7 days', 'now'),
            'file_path' => 'backups/' . fake()->uuid() . '.sql',
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
