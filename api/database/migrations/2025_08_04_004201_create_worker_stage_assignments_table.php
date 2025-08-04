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
        Schema::create('worker_stage_assignments', function (Blueprint $table) {
            $table->id();
            
            // العلاقات الأساسية
            $table->foreignId('worker_id')->constrained('workers')->onDelete('cascade');
            $table->foreignId('stage_id')->constrained('workflow_stages')->onDelete('cascade');
            
            // مستوى المهارة والخبرة
            $table->enum('skill_level', ['beginner', 'intermediate', 'expert', 'master'])->default('intermediate');
            $table->decimal('efficiency_rating', 3, 2)->default(1.00); // معامل الكفاءة (0.5 - 2.0)
            $table->integer('experience_months')->default(0); // الخبرة بالأشهر
            
            // إعدادات العمل
            $table->boolean('is_primary_assignment')->default(false); // هل هذا التخصيص الأساسي للعامل
            $table->boolean('can_train_others')->default(false); // هل يمكنه تدريب آخرين
            $table->integer('max_concurrent_tasks')->default(3); // الحد الأقصى للمهام المتزامنة
            $table->decimal('daily_work_hours', 4, 2)->default(8.00); // ساعات العمل اليومية
            
            // إعدادات الجدولة
            $table->json('work_schedule')->nullable(); // جدول العمل الأسبوعي
            $table->date('assignment_start_date')->default(now());
            $table->date('assignment_end_date')->nullable();
            
            // إعدادات الأولوية
            $table->integer('priority_level')->default(50); // مستوى الأولوية (0-100)
            $table->boolean('is_backup_worker')->default(false); // عامل احتياطي
            $table->json('backup_for_workers')->nullable(); // عمال يحل محلهم
            
            // إحصائيات الأداء
            $table->integer('completed_tasks_count')->default(0);
            $table->decimal('average_completion_time', 6, 2)->default(0); // متوسط وقت الإكمال بالدقائق
            $table->decimal('quality_score_average', 3, 2)->default(0); // متوسط درجة الجودة
            $table->timestamp('last_task_completed_at')->nullable();
            
            // حالة التوفر
            $table->enum('availability_status', [
                'available',      // متاح
                'busy',          // مشغول
                'on_break',      // في استراحة
                'training',      // في تدريب
                'sick_leave',    // إجازة مرضية
                'vacation',      // إجازة
                'overtime',      // وقت إضافي
                'unavailable'    // غير متاح
            ])->default('available');
            
            $table->timestamp('availability_updated_at')->nullable();
            $table->text('availability_notes')->nullable();
            
            // إعدادات التدريب والتطوير
            $table->json('certifications')->nullable(); // الشهادات والمؤهلات
            $table->json('training_history')->nullable(); // تاريخ التدريب
            $table->date('next_training_due')->nullable(); // موعد التدريب القادم
            
            // حالة النشاط
            $table->boolean('is_active')->default(true);
            $table->text('deactivation_reason')->nullable();
            
            $table->timestamps();
            
            // Unique constraint - عامل واحد لكل مرحلة
            $table->unique(['worker_id', 'stage_id']);
            
            // Indexes للأداء
            $table->index(['worker_id', 'is_active']);
            $table->index(['stage_id', 'is_active']);
            $table->index(['availability_status', 'is_active']);
            $table->index(['skill_level', 'stage_id']);
            $table->index('is_primary_assignment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('worker_stage_assignments');
    }
};