<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique()->nullable();
            $table->string('phone')->nullable();
            $table->string('mobile')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->default('Kuwait');
            $table->string('postal_code')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->enum('client_type', ['individual', 'business'])->default('individual');
            $table->string('business_name')->nullable();
            $table->string('tax_number')->nullable();
            $table->decimal('credit_limit', 10, 2)->default(0);
            $table->decimal('current_balance', 10, 2)->default(0);
            $table->enum('payment_terms', ['cash', 'credit_30', 'credit_60', 'credit_90'])->default('cash');
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_vip')->default(false);
            $table->date('registration_date')->default(now());
            $table->date('last_order_date')->nullable();
            $table->text('notes')->nullable();
            $table->json('preferences')->nullable();
            $table->json('measurements')->nullable();
            $table->timestamps();
            $table->index(['is_active', 'client_type']);
            $table->index('email');
            $table->index(['phone', 'mobile']);
            $table->index('last_order_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};