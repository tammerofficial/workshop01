<?php

namespace Database\Factories;

use App\Models\Inventory;
use App\Models\Material;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Inventory>
 */
class InventoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Inventory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $actions = ['in', 'out', 'adjustment', 'return'];
        $reasons = ['purchase', 'production', 'sale', 'damage', 'expiry'];
        
        return [
            'material_id' => fake()->numberBetween(1, 20),
            'action' => fake()->randomElement($actions),
            'quantity' => fake()->numberBetween(1, 100),
            'reason' => fake()->randomElement($reasons),
            'reference_number' => 'INV-' . fake()->unique()->numberBetween(1000, 9999),
            'user_id' => fake()->numberBetween(1, 20),
            'notes' => fake()->optional()->sentence(),
            'transaction_date' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
