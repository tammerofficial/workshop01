<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Men Clothing', 'color' => '#3b82f6', 'sort_order' => 1],
            ['name' => 'Women Clothing', 'color' => '#ec4899', 'sort_order' => 2],
            ['name' => 'Traditional Wear', 'color' => '#059669', 'sort_order' => 3],
            ['name' => 'Formal Wear', 'color' => '#7c3aed', 'sort_order' => 4],
            ['name' => 'Alterations', 'color' => '#f59e0b', 'sort_order' => 5],
        ];
        foreach ($categories as $c) { Category::create($c); }
    }
}