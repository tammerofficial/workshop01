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
        Schema::create('boutique_sales', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); // رقم الفاتورة
            $table->foreignId('boutique_id')->constrained('boutiques')->onDelete('cascade'); // البوتيك
            $table->foreignId('client_id')->nullable()->constrained('clients')->onDelete('set null'); // العميل
            $table->foreignId('loyalty_customer_id')->nullable()->constrained('loyalty_customers')->onDelete('set null'); // عميل الولاء
            $table->foreignId('cashier_id')->constrained('users')->onDelete('cascade'); // الكاشير
            
            // تفاصيل البيع
            $table->decimal('subtotal', 10, 3)->default(0); // المجموع الفرعي
            $table->decimal('discount_amount', 10, 3)->default(0); // مبلغ الخصم
            $table->decimal('tax_amount', 10, 3)->default(0); // الضريبة
            $table->decimal('total_amount', 10, 3); // المجموع الكلي
            $table->decimal('paid_amount', 10, 3)->default(0); // المبلغ المدفوع
            $table->decimal('change_amount', 10, 3)->default(0); // مبلغ الباقي
            
            // طريقة الدفع
            $table->enum('payment_method', ['cash', 'card', 'knet', 'apple_pay', 'mixed'])->default('cash');
            $table->json('payment_details')->nullable(); // تفاصيل الدفع (للدفع المختلط)
            
            // نظام الولاء
            $table->integer('loyalty_points_used')->default(0); // النقاط المستخدمة
            $table->integer('loyalty_points_earned')->default(0); // النقاط المكتسبة
            $table->decimal('loyalty_discount', 10, 3)->default(0); // خصم الولاء
            
            // حالة البيع
            $table->enum('status', ['completed', 'refunded', 'partially_refunded', 'cancelled'])->default('completed');
            $table->text('notes')->nullable(); // ملاحظات
            
            // معلومات إضافية
            $table->timestamp('sale_date')->useCurrent(); // تاريخ البيع
            $table->string('receipt_number')->nullable(); // رقم الإيصال
            $table->boolean('is_loyalty_transaction')->default(false); // معاملة ولاء
            
            $table->timestamps();
            
            // فهارس للأداء
            $table->index(['boutique_id', 'sale_date']);
            $table->index(['client_id', 'status']);
            $table->index(['loyalty_customer_id', 'is_loyalty_transaction']);
            $table->index(['cashier_id', 'sale_date']);
            $table->index(['status', 'sale_date']);
            $table->index('invoice_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boutique_sales');
    }
};