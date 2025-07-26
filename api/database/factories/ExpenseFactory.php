<?php

namespace Database\Factories;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Expense>
 */
class ExpenseFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Expense::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['materials', 'utilities', 'rent', 'salary', 'equipment', 'maintenance'];
        $paymentMethods = ['cash', 'card', 'bank_transfer', 'check'];
        
        return [
            'user_id' => fake()->numberBetween(1, 20),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'amount' => fake()->randomFloat(2, 10, 1000),
            'category' => fake()->randomElement($categories),
            'payment_method' => fake()->randomElement($paymentMethods),
            'expense_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'receipt_url' => fake()->optional()->url(),
            'is_approved' => fake()->boolean(80),
            'approved_by' => fake()->optional()->numberBetween(1, 20),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
