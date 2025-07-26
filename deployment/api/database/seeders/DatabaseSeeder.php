<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@workshop.com',
        ]);

        // Create basic categories only
        $categories = [
            ['name' => 'General', 'description' => 'General category', 'color' => '#6B7280'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        // The real data will be imported from your website
        // You can manually add workers, clients, materials, and orders through the API
    }
}
