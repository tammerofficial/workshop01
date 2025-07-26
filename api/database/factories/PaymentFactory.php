<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Payment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $methods = ['cash', 'card', 'bank_transfer', 'check'];
        $statuses = ['pending', 'completed', 'failed', 'refunded'];
        
        return [
            'invoice_id' => fake()->numberBetween(1, 20),
            'amount' => fake()->randomFloat(2, 50, 1000),
            'payment_method' => fake()->randomElement($methods),
            'payment_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'reference_number' => 'PAY-' . fake()->unique()->numberBetween(1000, 9999),
            'status' => fake()->randomElement($statuses),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
