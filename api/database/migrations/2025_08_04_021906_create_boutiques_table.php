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
        Schema::create('boutiques', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // اسم البوتيك
            $table->string('code')->unique(); // كود البوتيك
            $table->string('location')->nullable(); // الموقع
            $table->text('address')->nullable(); // العنوان الكامل
            $table->string('phone')->nullable(); // رقم التليفون
            $table->string('email')->nullable(); // البريد الإلكتروني
            $table->foreignId('manager_id')->nullable()->constrained('users')->onDelete('set null'); // مدير البوتيك
            
            // إعدادات التشغيل
            $table->json('business_hours')->nullable(); // ساعات العمل
            $table->boolean('is_active')->default(true); // نشط أم لا
            $table->boolean('loyalty_enabled')->default(true); // تمكين نظام الولاء
            $table->boolean('pos_enabled')->default(true); // تمكين نقاط البيع
            
            // إعدادات نظام الولاء
            $table->decimal('default_points_per_kwd', 5, 2)->default(1.00); // النقاط الافتراضية لكل دينار
            $table->decimal('tier_multiplier', 3, 2)->default(1.00); // مضاعف حسب مستوى العضوية
            
            // إحصائيات
            $table->integer('total_sales_count')->default(0); // عدد المبيعات الإجمالي
            $table->decimal('total_sales_amount', 12, 3)->default(0); // إجمالي المبيعات
            $table->decimal('monthly_sales_amount', 12, 3)->default(0); // المبيعات الشهرية
            
            $table->timestamps();
            
            // فهارس للأداء
            $table->index(['is_active', 'loyalty_enabled']);
            $table->index(['code', 'is_active']);
            $table->index('manager_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boutiques');
    }
};