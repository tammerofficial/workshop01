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
        Schema::create('order_workflow_progress', function (Blueprint $table) {
            $table->id();
            
            // العلاقات الأساسية
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('stage_id')->constrained('workflow_stages')->onDelete('cascade');
            $table->foreignId('assigned_worker_id')->nullable()->constrained('workers')->onDelete('set null');
            $table->foreignId('supervisor_id')->nullable()->constrained('users')->onDelete('set null');
            
            // حالة المرحلة
            $table->enum('status', [
                'pending',           // في الانتظار
                'assigned',         // مُخصصة
                'in_progress',      // قيد التنفيذ
                'paused',           // متوقفة مؤقتاً
                'quality_check',    // فحص الجودة
                'rework_required',  // تحتاج إعادة عمل
                'completed',        // مكتملة
                'skipped',          // تم تخطيها
                'cancelled'         // ملغية
            ])->default('pending');
            
            $table->text('status_reason')->nullable(); // سبب الحالة
            
            // التوقيتات
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->timestamp('resumed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('due_date')->nullable(); // الموعد المتوقع للإنجاز
            
            // قياسات الأداء
            $table->decimal('estimated_hours', 4, 2)->nullable(); // الوقت المقدر
            $table->decimal('actual_hours', 4, 2)->default(0); // الوقت الفعلي
            $table->decimal('efficiency_percentage', 5, 2)->default(0); // كفاءة الإنجاز
            $table->integer('pause_count')->default(0); // عدد مرات التوقف
            $table->decimal('total_pause_time', 4, 2)->default(0); // إجمالي وقت التوقف
            
            // معلومات الجودة
            $table->integer('quality_score')->nullable(); // درجة الجودة (1-10)
            $table->text('quality_notes')->nullable(); // ملاحظات الجودة
            $table->json('quality_checklist')->nullable(); // قائمة فحص الجودة
            $table->boolean('quality_approved')->default(false);
            $table->foreignId('quality_checker_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('quality_checked_at')->nullable();
            
            // معلومات إضافية
            $table->text('work_notes')->nullable(); // ملاحظات العمل
            $table->json('materials_used')->nullable(); // المواد المستخدمة
            $table->json('tools_used')->nullable(); // الأدوات المستخدمة
            $table->decimal('material_waste_percentage', 5, 2)->default(0); // نسبة الفاقد
            
            // التصوير والتوثيق
            $table->json('before_photos')->nullable(); // صور قبل العمل
            $table->json('progress_photos')->nullable(); // صور أثناء العمل
            $table->json('after_photos')->nullable(); // صور بعد العمل
            $table->json('work_videos')->nullable(); // فيديوهات العمل
            
            // معلومات التكلفة
            $table->decimal('labor_cost', 10, 2)->default(0); // تكلفة العمالة
            $table->decimal('material_cost', 10, 2)->default(0); // تكلفة المواد
            $table->decimal('overhead_cost', 10, 2)->default(0); // التكاليف الإضافية
            $table->decimal('total_cost', 10, 2)->default(0); // إجمالي التكلفة
            
            // معلومات التسليم
            $table->foreignId('received_from_worker_id')->nullable()->constrained('workers')->onDelete('set null');
            $table->foreignId('delivered_to_worker_id')->nullable()->constrained('workers')->onDelete('set null');
            $table->timestamp('handover_time')->nullable();
            $table->text('handover_notes')->nullable();
            
            // معلومات المشاكل والحلول
            $table->json('issues_encountered')->nullable(); // المشاكل المواجهة
            $table->json('solutions_applied')->nullable(); // الحلول المطبقة
            $table->boolean('requires_supervisor_attention')->default(false);
            $table->text('supervisor_notes')->nullable();
            
            // إعدادات الأولوية
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->text('priority_reason')->nullable();
            
            // معلومات البيئة والظروف
            $table->json('work_conditions')->nullable(); // ظروف العمل
            $table->decimal('temperature', 4, 1)->nullable(); // درجة الحرارة
            $table->decimal('humidity', 4, 1)->nullable(); // الرطوبة
            
            $table->timestamps();
            
            // Unique constraint - طلبية واحدة لكل مرحلة
            $table->unique(['order_id', 'stage_id']);
            
            // Indexes للأداء
            $table->index(['order_id', 'status']);
            $table->index(['stage_id', 'status']);
            $table->index(['assigned_worker_id', 'status']);
            $table->index(['status', 'started_at']);
            $table->index(['status', 'due_date']);
            $table->index('priority');
            $table->index('quality_approved');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_workflow_progress');
    }
};