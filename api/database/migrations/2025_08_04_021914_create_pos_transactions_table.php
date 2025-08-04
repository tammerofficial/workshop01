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
        Schema::create('pos_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('boutique_sale_id')->constrained('boutique_sales')->onDelete('cascade'); // مرتبط بالبيع
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade'); // المنتج
            $table->foreignId('processed_by')->constrained('users')->onDelete('cascade'); // المعالج (كاشير/مدير)
            
            // تفاصيل المعاملة
            $table->integer('quantity'); // الكمية
            $table->decimal('unit_price', 10, 3); // سعر الوحدة
            $table->decimal('line_total', 10, 3); // المجموع للسطر
            $table->decimal('discount_amount', 10, 3)->default(0); // خصم السطر
            $table->decimal('final_amount', 10, 3); // المبلغ النهائي
            
            // معلومات المخزون
            $table->integer('stock_before'); // المخزون قبل البيع
            $table->integer('stock_after'); // المخزون بعد البيع
            $table->boolean('auto_deducted')->default(true); // خصم تلقائي من المخزون
            
            // صلاحيات ومراجعة
            $table->foreignId('authorized_by')->nullable()->constrained('users')->onDelete('set null'); // مُصرح بواسطة (للخصومات الكبيرة)
            $table->boolean('requires_authorization')->default(false); // يحتاج ترخيص
            $table->enum('authorization_status', ['pending', 'approved', 'rejected'])->default('approved');
            $table->text('authorization_notes')->nullable(); // ملاحظات الترخيص
            
            // تتبع التعديلات
            $table->enum('transaction_type', ['sale', 'return', 'exchange', 'discount_adjustment'])->default('sale');
            $table->foreignId('original_transaction_id')->nullable()->constrained('pos_transactions')->onDelete('set null'); // للمرتجعات
            $table->text('modification_reason')->nullable(); // سبب التعديل
            
            $table->timestamps();
            
            // فهارس للأداء والصلاحيات
            $table->index(['boutique_sale_id', 'transaction_type']);
            $table->index(['product_id', 'created_at']);
            $table->index(['processed_by', 'requires_authorization']);
            $table->index(['authorized_by', 'authorization_status']);
            $table->index(['transaction_type', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_transactions');
    }
};