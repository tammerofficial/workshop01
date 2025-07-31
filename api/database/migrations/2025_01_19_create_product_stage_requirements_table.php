<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_stage_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('production_stage_id')->constrained('production_stages')->onDelete('cascade');
            $table->integer('order_sequence'); // ترتيب المرحلة في هذا المنتج
            $table->integer('estimated_hours')->default(0); // ساعات العمل المتوقعة لهذه المرحلة
            $table->integer('required_workers')->default(1); // عدد العمال المطلوبين
            $table->json('skill_requirements')->nullable(); // المهارات المطلوبة
            $table->json('equipment_requirements')->nullable(); // المعدات المطلوبة
            $table->boolean('is_parallel')->default(false); // هل يمكن تنفيذها بالتوازي مع مراحل أخرى
            $table->json('parallel_stages')->nullable(); // المراحل التي يمكن تنفيذها بالتوازي معها
            $table->boolean('is_critical')->default(false); // هل هي مرحلة حرجة
            $table->integer('buffer_time_hours')->default(0); // وقت إضافي احتياطي
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // فهارس
            $table->index(['product_id', 'production_stage_id']);
            $table->index(['product_id', 'order_sequence']);
            $table->unique(['product_id', 'production_stage_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_stage_requirements');
    }
};