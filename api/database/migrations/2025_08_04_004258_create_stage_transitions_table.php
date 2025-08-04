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
        Schema::create('stage_transitions', function (Blueprint $table) {
            $table->id();
            
            // العلاقات الأساسية
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('from_stage_id')->nullable()->constrained('workflow_stages')->onDelete('cascade');
            $table->foreignId('to_stage_id')->constrained('workflow_stages')->onDelete('cascade');
            
            // معلومات العمال
            $table->foreignId('from_worker_id')->nullable()->constrained('workers')->onDelete('set null');
            $table->foreignId('to_worker_id')->nullable()->constrained('workers')->onDelete('set null');
            $table->foreignId('authorized_by_user_id')->constrained('users')->onDelete('cascade');
            
            // تفاصيل الانتقال
            $table->enum('transition_type', [
                'start',           // بداية جديدة
                'normal',          // انتقال عادي
                'skip',            // تخطي مرحلة
                'rollback',        // إرجاع للمرحلة السابقة
                'emergency',       // انتقال طارئ
                'quality_fail',    // فشل في الجودة
                'rework'           // إعادة عمل
            ])->default('normal');
            
            $table->text('transition_reason')->nullable();
            $table->json('transition_data')->nullable(); // بيانات إضافية
            
            // 🏆 معلومات الأداء - Performance Integration
            $table->decimal('performance_score', 5, 2)->nullable(); // درجة الأداء للعامل
            $table->decimal('speed_efficiency', 5, 2)->nullable(); // كفاءة السرعة (%)
            $table->decimal('quality_efficiency', 5, 2)->nullable(); // كفاءة الجودة (%)
            $table->decimal('time_saved_minutes', 6, 2)->default(0); // الوقت المتوفر بالدقائق
            $table->boolean('performance_bonus_eligible')->default(false); // مؤهل للمكافأة
            
            // التوقيتات
            $table->timestamp('transition_time')->default(now());
            $table->timestamp('expected_completion_time')->nullable();
            $table->decimal('actual_duration_minutes', 6, 2)->nullable();
            
            // معلومات الجودة
            $table->integer('handover_quality_score')->nullable(); // درجة جودة التسليم
            $table->text('quality_notes')->nullable();
            $table->json('quality_photos')->nullable(); // صور الجودة
            
            // حالة الانتقال
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled'])->default('completed');
            $table->text('failure_reason')->nullable();
            
            $table->timestamps();
            
            // Indexes للأداء
            $table->index(['order_id', 'transition_time']);
            $table->index(['from_worker_id', 'transition_time']);
            $table->index(['to_worker_id', 'transition_time']);
            $table->index(['transition_type', 'status']);
            $table->index('performance_score'); // 🏆 Index للأداء
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stage_transitions');
    }
};