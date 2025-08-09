<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Worker;
use Illuminate\Support\Str;

class WorkerSeeder extends Seeder
{
    public function run(): void
    {
        $workers = [
            ['employee_id' => 'W001', 'name' => 'Ali Hassan', 'gender' => 'male', 'department' => 'Tailoring', 'specialty' => 'Tailor', 'position' => 'Senior Tailor', 'employment_type' => 'full_time', 'hire_date' => now()->subYears(3)->toDateString(), 'basic_salary' => 400],
            ['employee_id' => 'W002', 'name' => 'Omar Saleh', 'gender' => 'male', 'department' => 'Cutting', 'specialty' => 'Cutter', 'position' => 'Cutter', 'employment_type' => 'full_time', 'hire_date' => now()->subYears(2)->toDateString(), 'basic_salary' => 350],
            ['employee_id' => 'W003', 'name' => 'Yousef Ali', 'gender' => 'male', 'department' => 'Design', 'specialty' => 'Designer', 'position' => 'Designer', 'employment_type' => 'full_time', 'hire_date' => now()->subYears(1)->toDateString(), 'basic_salary' => 450],
            ['employee_id' => 'W004', 'name' => 'Khaled Noor', 'gender' => 'male', 'department' => 'Tailoring', 'specialty' => 'Tailor', 'position' => 'Tailor', 'employment_type' => 'full_time', 'hire_date' => now()->subMonths(8)->toDateString(), 'basic_salary' => 320],
            ['employee_id' => 'W005', 'name' => 'Hamad Faisal', 'gender' => 'male', 'department' => 'Finishing', 'specialty' => 'Finisher', 'position' => 'Finisher', 'employment_type' => 'full_time', 'hire_date' => now()->subMonths(5)->toDateString(), 'basic_salary' => 300],
        ];
        foreach ($workers as $w) { Worker::create($w); }
    }
}