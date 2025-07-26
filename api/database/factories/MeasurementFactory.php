<?php

namespace Database\Factories;

use App\Models\Measurement;
use App\Models\Client;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Measurement>
 */
class MeasurementFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Measurement::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [

            'length' => $this->faker->randomFloat(2, 0.1, 10),
            'width' => $this->faker->randomFloat(2, 0.1, 10),
            'height' => $this->faker->randomFloat(2, 0.1, 10),
            'weight' => rand(1, 20) * 100,
            'volume' => rand(1, 20) * 100,
        ];
    }
}
