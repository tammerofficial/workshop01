<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workers', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id')->unique();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->string('email')->unique()->nullable();
            $table->string('phone')->nullable();
            $table->string('mobile')->nullable();
            $table->text('address')->nullable();
            $table->string('national_id')->unique()->nullable();
            $table->string('passport_number')->unique()->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female']);
            $table->string('nationality')->default('Kuwait');
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed'])->nullable();
            $table->string('department');
            $table->string('specialty');
            $table->string('position');
            $table->enum('employment_type', ['full_time', 'part_time', 'contract', 'temporary'])->default('full_time');
            $table->date('hire_date');
            $table->date('contract_end_date')->nullable();
            $table->enum('work_shift', ['morning', 'evening', 'night', 'rotating'])->default('morning');
            $table->json('skills')->nullable();
            $table->integer('experience_years')->default(0);
            $table->decimal('basic_salary', 10, 2);
            $table->decimal('housing_allowance', 10, 2)->default(0);
            $table->decimal('transportation_allowance', 10, 2)->default(0);
            $table->decimal('food_allowance', 10, 2)->default(0);
            $table->decimal('other_allowances', 10, 2)->default(0);
            $table->decimal('overtime_rate', 10, 2)->default(0);
            $table->enum('salary_currency', ['KWD', 'USD', 'EUR'])->default('KWD');
            $table->enum('payment_frequency', ['monthly', 'weekly', 'daily'])->default('monthly');
            $table->integer('annual_leave_days')->default(30);
            $table->integer('sick_leave_days')->default(10);
            $table->enum('performance_rating', ['excellent', 'good', 'average', 'poor'])->nullable();
            $table->decimal('productivity_score', 5, 2)->default(0);
            $table->integer('completed_orders')->default(0);
            $table->decimal('average_completion_time', 8, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_on_probation')->default(false);
            $table->date('probation_end_date')->nullable();
            $table->string('biometric_id')->unique()->nullable();
            $table->string('rfid_card')->unique()->nullable();
            $table->json('access_permissions')->nullable();
            $table->time('shift_start_time')->default('08:00:00');
            $table->time('shift_end_time')->default('17:00:00');
            $table->json('working_days')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->string('photo')->nullable();
            $table->text('notes')->nullable();
            $table->json('documents')->nullable();
            $table->timestamps();
            $table->index(['is_active', 'department']);
            $table->index(['specialty', 'is_active']);
            $table->index('employee_id');
            $table->index('hire_date');
            $table->index('performance_rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};