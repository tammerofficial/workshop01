<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Invoice::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
        $paymentMethods = ['cash', 'card', 'bank_transfer', 'check'];
        
        return [
            'invoice_number' => 'INV-' . fake()->unique()->numberBetween(1000, 9999),
            'order_id' => fake()->numberBetween(1, 20),
            'client_id' => fake()->numberBetween(1, 20),
            'amount' => fake()->randomFloat(2, 50, 1000),
            'tax_rate' => fake()->randomFloat(2, 0, 15),
            'tax_amount' => fake()->randomFloat(2, 0, 150),
            'total_amount' => fake()->randomFloat(2, 50, 1000),
            'status' => fake()->randomElement($statuses),
            'due_date' => fake()->dateTimeBetween('now', '+30 days'),
            'payment_method' => fake()->optional()->randomElement($paymentMethods),
            'payment_date' => fake()->optional()->dateTimeBetween('-30 days', 'now'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
