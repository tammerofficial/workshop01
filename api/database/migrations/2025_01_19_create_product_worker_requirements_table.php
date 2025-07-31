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
        Schema::create('product_worker_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('stage_requirement_id')->constrained('product_stage_requirements')->onDelete('cascade');
            $table->foreignId('worker_id')->constrained('workers')->onDelete('cascade');
            $table->foreignId('production_stage_id')->constrained('production_stages')->onDelete('cascade');
            $table->integer('priority')->default(1); // أولوية العامل لهذه المرحلة (1 = الأولى)
            $table->decimal('efficiency_rate', 5, 2)->default(1.00); // معدل الكفاءة للعامل في هذه المرحلة (1.0 = 100%)
            $table->json('required_skills')->nullable(); // المهارات المطلوبة من العامل
            $table->json('certifications')->nullable(); // الشهادات المطلوبة
            $table->decimal('hourly_rate', 8, 2)->nullable(); // سعر الساعة لهذا العامل في هذه المرحلة
            $table->integer('max_concurrent_orders')->default(1); // أقصى عدد طلبات يمكن للعامل التعامل معها في نفس الوقت
            $table->boolean('is_primary')->default(false); // هل هو العامل الأساسي لهذه المرحلة
            $table->boolean('can_supervise')->default(false); // هل يمكنه الإشراف على عمال آخرين
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // فهارس
            $table->index(['product_id', 'worker_id']);
            $table->index(['stage_requirement_id', 'worker_id']);
            $table->index(['production_stage_id', 'worker_id']);
            $table->index(['worker_id', 'priority']);
            $table->unique(['stage_requirement_id', 'worker_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_worker_requirements');
    }
};