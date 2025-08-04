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
        Schema::create('workflow_stages', function (Blueprint $table) {
            $table->id();
            
            // معلومات المرحلة الأساسية
            $table->string('name')->unique(); // cutting, sewing, embroidery, quality_control, packaging
            $table->string('display_name'); // اسم عربي للعرض
            $table->text('description')->nullable();
            $table->integer('stage_order'); // ترتيب المرحلة (1, 2, 3...)
            
            // إعدادات التوقيت
            $table->decimal('estimated_hours', 4, 2)->default(1.00); // الوقت المقدر بالساعات
            $table->decimal('max_hours', 4, 2)->nullable(); // الحد الأقصى للوقت
            $table->boolean('is_parallel')->default(false); // هل يمكن تنفيذها بالتوازي
            
            // إعدادات العمال
            $table->string('required_role'); // الدور المطلوب للعمل في هذه المرحلة
            $table->integer('min_workers')->default(1); // الحد الأدنى من العمال
            $table->integer('max_workers')->default(1); // الحد الأقصى من العمال
            $table->integer('priority_score')->default(50); // نقاط الأولوية (0-100)
            
            // إعدادات الجودة
            $table->boolean('requires_quality_check')->default(false);
            $table->boolean('requires_approval')->default(false);
            $table->json('quality_criteria')->nullable(); // معايير الجودة
            
            // إعدادات التدفق
            $table->boolean('auto_start')->default(true); // بدء تلقائي عند الوصول
            $table->boolean('auto_complete')->default(false); // إكمال تلقائي
            $table->json('completion_conditions')->nullable(); // شروط الإكمال
            
            // إعدادات الإشعارات
            $table->boolean('send_notifications')->default(true);
            $table->integer('notification_delay_minutes')->default(0); // تأخير الإشعار بالدقائق
            $table->json('notification_recipients')->nullable(); // مستقبلي الإشعارات
            
            // إعدادات المعدات والأدوات
            $table->json('required_tools')->nullable(); // الأدوات المطلوبة
            $table->json('required_materials')->nullable(); // المواد المطلوبة
            $table->string('work_station')->nullable(); // محطة العمل
            
            // حالة النشاط
            $table->boolean('is_active')->default(true);
            $table->boolean('is_maintenance_mode')->default(false);
            
            $table->timestamps();
            
            // Indexes للأداء
            $table->index(['stage_order', 'is_active']);
            $table->index(['required_role', 'is_active']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workflow_stages');
    }
};