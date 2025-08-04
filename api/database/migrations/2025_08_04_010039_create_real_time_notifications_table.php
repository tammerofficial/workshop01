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
        Schema::create('real_time_notifications', function (Blueprint $table) {
            $table->id();
            
            // المعلومات الأساسية
            $table->string('title'); // عنوان الإشعار
            $table->text('message'); // محتوى الإشعار
            $table->enum('type', [
                'task_assigned',       // مهمة مخصصة
                'task_completed',      // مهمة مكتملة
                'stage_change',        // تغيير مرحلة
                'urgent_order',        // طلبية عاجلة
                'quality_issue',       // مشكلة جودة
                'performance_alert',   // تنبيه أداء
                'break_reminder',      // تذكير استراحة
                'shift_change',        // تغيير وردية
                'system_alert',        // تنبيه نظام
                'achievement',         // إنجاز
                'deadline_warning',    // تحذير موعد
                'worker_request',      // طلب عامل
                'manager_alert',       // تنبيه مدير
                'maintenance',         // صيانة
                'emergency'            // طارئ
            ])->default('system_alert');
            
            // المستقبلين
            $table->enum('recipient_type', [
                'worker',              // عامل محدد
                'stage_workers',       // عمال مرحلة معينة
                'all_workers',         // جميع العمال
                'managers',            // المدراء
                'supervisors',         // المشرفين
                'specific_role',       // دور محدد
                'custom_list'          // قائمة مخصصة
            ])->default('worker');
            
            $table->foreignId('recipient_user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->foreignId('recipient_worker_id')->nullable()->constrained('workers')->onDelete('cascade');
            $table->string('recipient_role')->nullable(); // للأدوار المحددة
            $table->json('custom_recipients')->nullable(); // قائمة مخصصة من المستقبلين
            
            // المرسل
            $table->foreignId('sender_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('sender_system')->nullable(); // النظام المرسل
            
            // الأولوية والحالة
            $table->enum('priority', ['low', 'normal', 'high', 'urgent', 'critical'])->default('normal');
            $table->enum('status', ['pending', 'sent', 'delivered', 'read', 'failed'])->default('pending');
            
            // معلومات إضافية
            $table->json('data')->nullable(); // بيانات إضافية للإشعار
            $table->string('action_url')->nullable(); // رابط للعمل المطلوب
            $table->string('action_text')->nullable(); // نص زر العمل
            
            // إعدادات العرض
            $table->string('icon')->nullable(); // أيقونة الإشعار
            $table->string('color')->default('#3B82F6'); // لون الإشعار
            $table->boolean('show_on_dashboard')->default(true); // عرض في لوحة التحكم
            $table->boolean('show_popup')->default(false); // عرض في نافذة منبثقة
            $table->boolean('play_sound')->default(false); // تشغيل صوت
            $table->string('sound_file')->nullable(); // ملف الصوت
            
            // إعدادات التوقيت
            $table->timestamp('scheduled_at')->nullable(); // موعد الإرسال المجدول
            $table->timestamp('sent_at')->nullable(); // وقت الإرسال الفعلي
            $table->timestamp('delivered_at')->nullable(); // وقت التسليم
            $table->timestamp('read_at')->nullable(); // وقت القراءة
            $table->timestamp('expires_at')->nullable(); // انتهاء صلاحية الإشعار
            
            // إعدادات الإعادة
            $table->integer('retry_count')->default(0); // عدد محاولات الإعادة
            $table->integer('max_retries')->default(3); // الحد الأقصى للمحاولات
            $table->timestamp('next_retry_at')->nullable(); // موعد المحاولة التالية
            
            // معلومات السياق
            $table->foreignId('related_order_id')->nullable()->constrained('orders')->onDelete('cascade');
            $table->foreignId('related_task_id')->nullable()->constrained('order_workflow_progress')->onDelete('cascade');
            $table->foreignId('related_stage_id')->nullable()->constrained('workflow_stages')->onDelete('cascade');
            
            // قنوات الإرسال
            $table->boolean('send_push')->default(true); // إشعار push
            $table->boolean('send_email')->default(false); // إيميل
            $table->boolean('send_sms')->default(false); // رسالة نصية
            $table->boolean('send_in_app')->default(true); // داخل التطبيق
            $table->boolean('send_desktop')->default(true); // إشعار سطح المكتب
            
            // معلومات الجهاز
            $table->string('device_token')->nullable(); // رمز الجهاز للpush
            $table->string('device_type')->nullable(); // نوع الجهاز (ios, android, web)
            $table->json('delivery_status')->nullable(); // حالة التسليم لكل قناة
            
            // إحصائيات
            $table->integer('view_count')->default(0); // عدد مرات المشاهدة
            $table->integer('click_count')->default(0); // عدد مرات النقر
            $table->timestamp('last_viewed_at')->nullable(); // آخر مشاهدة
            
            // تجميع الإشعارات
            $table->string('group_key')->nullable(); // مفتاح التجميع
            $table->boolean('is_grouped')->default(false); // هل هو مجمع
            $table->integer('group_count')->default(1); // عدد الإشعارات في المجموعة
            
            $table->timestamps();
            
            // Indexes للأداء
            $table->index(['recipient_user_id', 'status']);
            $table->index(['recipient_worker_id', 'status']);
            $table->index(['type', 'priority']);
            $table->index(['status', 'scheduled_at']);
            $table->index(['expires_at']);
            $table->index('group_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('real_time_notifications');
    }
};