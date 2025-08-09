<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Client;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            ['name' => 'John Smith', 'email' => 'john@example.com'],
            ['name' => 'Sarah Johnson', 'email' => 'sarah@example.com'],
            ['name' => 'David Miller', 'email' => 'david@example.com'],
            ['name' => 'Emily Davis', 'email' => 'emily@example.com'],
            ['name' => 'Michael Brown', 'email' => 'michael@example.com'],
        ];
        foreach ($clients as $c) { Client::create($c); }
    }
}