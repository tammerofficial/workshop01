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

        return [
            'name' => factory(\App\Models\Business)->sequence(['name' => function () {
                return Str::random(10);
            }])->make()->name,
            'email' => factory(\App\Models\Email)->sequence(['email' => function () {
                return Str::random(10) . '@example.com';
            })->make()->email,
            'phone' => factory(\App\Models\Phone)->sequence(['phone' => function () {
                return Str::random(3) . '-' . Str::random(3) . '-' . Str::random(4);
            })->make()->phone,
        ];
        ];
    }
}
