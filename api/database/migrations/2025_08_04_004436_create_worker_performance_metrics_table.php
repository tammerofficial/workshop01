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
        Schema::create('worker_performance_metrics', function (Blueprint $table) {
            $table->id();
            
            // العلاقات الأساسية
            $table->foreignId('worker_id')->constrained('workers')->onDelete('cascade');
            $table->foreignId('stage_id')->constrained('workflow_stages')->onDelete('cascade');
            $table->date('performance_date'); // تاريخ الأداء
            
            // 📊 مقاييس الإنتاجية الأساسية
            $table->integer('tasks_completed')->default(0); // المهام المكتملة
            $table->integer('tasks_assigned')->default(0); // المهام المخصصة
            $table->decimal('completion_rate', 5, 2)->default(0); // معدل الإكمال (%)
            $table->decimal('average_task_time', 6, 2)->default(0); // متوسط وقت المهمة (دقائق)
            $table->decimal('target_task_time', 6, 2)->nullable(); // الوقت المستهدف للمهمة
            
            // ⚡ مقاييس الكفاءة والسرعة
            $table->decimal('speed_efficiency', 5, 2)->default(100); // كفاءة السرعة (%)
            $table->decimal('productivity_score', 5, 2)->default(0); // نقاط الإنتاجية
            $table->decimal('overtime_hours', 4, 2)->default(0); // ساعات إضافية
            $table->decimal('idle_time_minutes', 6, 2)->default(0); // وقت الخمول
            $table->integer('break_count')->default(0); // عدد الاستراحات
            $table->decimal('break_time_minutes', 6, 2)->default(0); // وقت الاستراحات
            
            // 🎯 مقاييس الجودة
            $table->decimal('quality_score_average', 5, 2)->default(0); // متوسط درجة الجودة
            $table->integer('quality_failures')->default(0); // حالات فشل الجودة
            $table->integer('rework_count')->default(0); // عدد مرات إعادة العمل
            $table->decimal('first_pass_yield', 5, 2)->default(100); // نسبة النجاح من المرة الأولى
            $table->decimal('defect_rate', 5, 2)->default(0); // معدل العيوب (%)
            
            // 💰 مقاييس التكلفة والربحية
            $table->decimal('labor_cost_per_hour', 8, 2)->default(0); // تكلفة العمالة/ساعة
            $table->decimal('material_waste_cost', 10, 2)->default(0); // تكلفة فاقد المواد
            $table->decimal('efficiency_savings', 10, 2)->default(0); // توفيرات الكفاءة
            $table->decimal('bonus_earned', 8, 2)->default(0); // المكافآت المكتسبة
            
            // 📈 مقاييس التحسن المستمر
            $table->decimal('improvement_rate', 5, 2)->default(0); // معدل التحسن (%)
            $table->integer('suggestions_submitted')->default(0); // اقتراحات التحسين
            $table->integer('suggestions_implemented')->default(0); // الاقتراحات المطبقة
            $table->decimal('learning_curve_progress', 5, 2)->default(0); // تقدم منحنى التعلم
            
            // 🤝 مقاييس التعاون والقيادة
            $table->integer('mentoring_sessions')->default(0); // جلسات التدريب
            $table->integer('helped_colleagues')->default(0); // مساعدة الزملاء
            $table->decimal('teamwork_score', 5, 2)->default(0); // درجة العمل الجماعي
            $table->boolean('showed_leadership')->default(false); // أظهر قيادة
            
            // 🔄 مقاييس المرونة والتكيف
            $table->integer('cross_trained_stages')->default(0); // المراحل متعددة المهارات
            $table->boolean('worked_overtime')->default(false); // عمل إضافي
            $table->boolean('covered_for_others')->default(false); // غطى للآخرين
            $table->decimal('adaptability_score', 5, 2)->default(0); // درجة التكيف
            
            // 🎖️ مقاييس الامتياز والإنجاز
            $table->boolean('zero_defects_day')->default(false); // يوم بلا عيوب
            $table->boolean('exceeded_targets')->default(false); // تجاوز الأهداف
            $table->boolean('perfect_attendance')->default(false); // حضور مثالي
            $table->json('achievements')->nullable(); // الإنجازات الخاصة
            
            // 📊 المقاييس المقارنة
            $table->decimal('rank_in_stage', 5, 2)->nullable(); // الترتيب في المرحلة
            $table->decimal('percentile_performance', 5, 2)->nullable(); // المئوية الأداء
            $table->decimal('vs_average_performance', 5, 2)->default(0); // مقارنة بالمتوسط
            
            // 🎯 الأهداف والتحديات
            $table->json('daily_targets')->nullable(); // الأهداف اليومية
            $table->json('targets_achieved')->nullable(); // الأهداف المحققة
            $table->decimal('target_achievement_rate', 5, 2)->default(0); // معدل تحقيق الهدف
            
            // 📝 التقييم والملاحظات
            $table->text('supervisor_notes')->nullable(); // ملاحظات المشرف
            $table->text('self_assessment_notes')->nullable(); // ملاحظات التقييم الذاتي
            $table->enum('overall_rating', ['poor', 'below_average', 'average', 'good', 'excellent'])->default('average');
            
            // 🏅 نظام النقاط والمكافآت
            $table->integer('performance_points')->default(0); // نقاط الأداء
            $table->integer('bonus_points')->default(0); // نقاط المكافأة
            $table->integer('penalty_points')->default(0); // نقاط الخصم
            $table->decimal('total_score', 8, 2)->default(0); // إجمالي النقاط
            
            // حالة السجل
            $table->boolean('is_validated')->default(false); // مصدق عليه
            $table->foreignId('validated_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('validated_at')->nullable();
            
            $table->timestamps();
            
            // Unique constraint - عامل واحد لكل مرحلة لكل يوم
            $table->unique(['worker_id', 'stage_id', 'performance_date']);
            
            // Indexes للأداء
            $table->index(['worker_id', 'performance_date']);
            $table->index(['stage_id', 'performance_date']);
            $table->index(['overall_rating', 'performance_date']);
            $table->index(['total_score', 'performance_date']);
            $table->index('quality_score_average');
            $table->index('productivity_score');
            $table->index('completion_rate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('worker_performance_metrics');
    }
};