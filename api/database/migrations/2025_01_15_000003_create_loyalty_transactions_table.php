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
        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loyalty_customer_id')->constrained('loyalty_customers')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            
            // ربط مع المعاملات في نظام الورشة
            $table->foreignId('workshop_order_id')->nullable()->constrained('workshop_orders')->onDelete('set null');
            $table->foreignId('sale_id')->nullable()->constrained('sales')->onDelete('set null');
            
            $table->enum('type', ['earned', 'redeemed', 'expired', 'adjusted', 'bonus']);
            $table->integer('points'); // موجب للكسب، سالب للاستخدام
            $table->decimal('amount', 10, 3)->nullable(); // المبلغ المرتبط بالمعاملة
            $table->string('currency', 3)->default('KWD');
            $table->text('description');
            $table->string('reference_number')->unique();
            
            // تفاصيل المعاملة
            $table->string('tier_at_time')->nullable(); // المستوى وقت المعاملة
            $table->decimal('multiplier_used', 3, 2)->default(1.00); // المضاعف المستخدم
            $table->json('metadata')->nullable(); // بيانات إضافية
            
            $table->timestamp('expires_at')->nullable(); // انتهاء صلاحية النقاط
            $table->timestamp('processed_at')->nullable();
            $table->boolean('is_processed')->default(true);
            
            $table->timestamps();
            
            // فهارس للأداء
            $table->index(['loyalty_customer_id', 'type']);
            $table->index(['workshop_order_id', 'type']);
            $table->index(['sale_id', 'type']);
            $table->index('reference_number');
            $table->index(['expires_at', 'is_processed']);
            $table->index('processed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loyalty_transactions');
    }
};