<?php

namespace Database\Factories;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Supplier>
 */
class SupplierFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Supplier::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['fabric', 'thread', 'buttons', 'zippers', 'accessories'];
        $statuses = ['active', 'inactive', 'suspended'];
        
        return [
            'name' => fake()->company(),
            'email' => fake()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'contact_person' => fake()->name(),
            'supplier_type' => fake()->randomElement($types),
            'status' => fake()->randomElement($statuses),
            'payment_terms' => fake()->randomElement(['net 30', 'net 60', 'immediate']),
            'rating' => fake()->numberBetween(1, 5),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
