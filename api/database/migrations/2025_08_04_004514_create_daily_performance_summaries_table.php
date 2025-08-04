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
        Schema::create('daily_performance_summaries', function (Blueprint $table) {
            $table->id();
            
            // معلومات اليوم
            $table->date('summary_date');
            $table->enum('shift_type', ['morning', 'afternoon', 'night', 'full_day'])->default('full_day');
            
            // 📊 إحصائيات الإنتاج العامة
            $table->integer('total_orders_started')->default(0);
            $table->integer('total_orders_completed')->default(0);
            $table->integer('total_stages_completed')->default(0);
            $table->decimal('overall_efficiency', 5, 2)->default(0); // الكفاءة العامة (%)
            
            // 👥 إحصائيات العمال
            $table->integer('total_workers_active')->default(0);
            $table->integer('workers_on_time')->default(0);
            $table->integer('workers_late')->default(0);
            $table->integer('workers_absent')->default(0);
            $table->decimal('attendance_rate', 5, 2)->default(0); // معدل الحضور (%)
            
            // 🏆 أفضل أداء لليوم
            $table->foreignId('top_performer_worker_id')->nullable()->constrained('workers')->onDelete('set null');
            $table->decimal('top_performance_score', 5, 2)->default(0);
            $table->string('top_performer_achievement')->nullable(); // إنجاز أفضل عامل
            
            // 🎯 إحصائيات الجودة
            $table->decimal('average_quality_score', 5, 2)->default(0);
            $table->integer('quality_failures_count')->default(0);
            $table->integer('rework_tasks_count')->default(0);
            $table->decimal('first_pass_yield_rate', 5, 2)->default(100); // معدل النجاح من المرة الأولى
            
            // ⏱️ إحصائيات الوقت
            $table->decimal('total_production_hours', 8, 2)->default(0);
            $table->decimal('average_task_completion_time', 6, 2)->default(0);
            $table->decimal('total_overtime_hours', 6, 2)->default(0);
            $table->decimal('total_break_time', 6, 2)->default(0);
            
            // 💰 إحصائيات التكلفة
            $table->decimal('total_labor_cost', 12, 2)->default(0);
            $table->decimal('total_material_waste_cost', 10, 2)->default(0);
            $table->decimal('efficiency_savings', 10, 2)->default(0);
            $table->decimal('total_bonuses_paid', 10, 2)->default(0);
            
            // 📈 مؤشرات الأداء الرئيسية (KPIs)
            $table->decimal('productivity_index', 5, 2)->default(100); // مؤشر الإنتاجية
            $table->decimal('efficiency_index', 5, 2)->default(100); // مؤشر الكفاءة
            $table->decimal('quality_index', 5, 2)->default(100); // مؤشر الجودة
            $table->decimal('cost_efficiency_index', 5, 2)->default(100); // مؤشر كفاءة التكلفة
            
            // 🔥 التحديات والمشاكل
            $table->integer('bottlenecks_encountered')->default(0); // عقد التشغيل
            $table->integer('equipment_failures')->default(0); // أعطال المعدات
            $table->integer('material_shortages')->default(0); // نقص المواد
            $table->text('major_issues')->nullable(); // المشاكل الرئيسية
            
            // 🌟 الإنجازات والتميز
            $table->integer('zero_defect_workers')->default(0); // عمال بلا عيوب
            $table->integer('exceeded_target_workers')->default(0); // عمال تجاوزوا الهدف
            $table->integer('perfect_attendance_workers')->default(0); // عمال حضور مثالي
            $table->json('daily_achievements')->nullable(); // إنجازات اليوم
            
            // 📊 مقارنات بالأهداف
            $table->decimal('target_production_rate', 5, 2)->default(100); // الهدف المحدد
            $table->decimal('actual_production_rate', 5, 2)->default(0); // الإنتاج الفعلي
            $table->decimal('target_achievement_percentage', 5, 2)->default(0); // نسبة تحقيق الهدف
            
            // 🔄 تحليل الاتجاهات
            $table->decimal('vs_yesterday_performance', 5, 2)->default(0); // مقارنة بالأمس
            $table->decimal('vs_last_week_average', 5, 2)->default(0); // مقارنة بمتوسط الأسبوع الماضي
            $table->decimal('vs_monthly_average', 5, 2)->default(0); // مقارنة بالمتوسط الشهري
            
            // 📝 تعليقات الإدارة
            $table->text('supervisor_summary')->nullable(); // ملخص المشرف
            $table->text('manager_notes')->nullable(); // ملاحظات المدير
            $table->enum('day_rating', ['poor', 'below_average', 'average', 'good', 'excellent'])->default('average');
            
            // 🎯 خطط التحسين
            $table->json('improvement_actions')->nullable(); // إجراءات التحسين
            $table->json('tomorrow_targets')->nullable(); // أهداف الغد
            $table->text('lessons_learned')->nullable(); // الدروس المستفادة
            
            // حالة التقرير
            $table->boolean('is_finalized')->default(false); // مُكتمل
            $table->foreignId('finalized_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('finalized_at')->nullable();
            
            $table->timestamps();
            
            // Unique constraint - تقرير واحد لكل يوم ونوبة
            $table->unique(['summary_date', 'shift_type']);
            
            // Indexes للأداء
            $table->index('summary_date');
            $table->index(['summary_date', 'overall_efficiency']);
            $table->index(['summary_date', 'productivity_index']);
            $table->index('top_performer_worker_id');
            $table->index('is_finalized');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_performance_summaries');
    }
};