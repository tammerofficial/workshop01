<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // تحديث جدول المنتجات
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('purchase_price', 10, 2)->nullable()->after('price');
            $table->enum('product_type', ['simple', 'variable', 'raw_material', 'variable_raw_material', 'product_part', 'variable_product_part'])->default('simple')->after('sku');
            $table->integer('stock_quantity')->default(0)->after('product_type');
            $table->boolean('manage_stock')->default(true)->after('stock_quantity');
            $table->boolean('auto_calculate_purchase_price')->default(false)->after('manage_stock');
            $table->integer('manufacturing_time_days')->nullable()->after('production_hours');
            $table->bigInteger('woocommerce_id')->nullable()->after('manufacturing_time_days');
            $table->json('woocommerce_data')->nullable()->after('woocommerce_id');
            $table->string('image_url')->nullable()->after('woocommerce_data');
            
            $table->index('product_type');
            $table->index('woocommerce_id');
            $table->index('stock_quantity');
        });

        // إنشاء جدول Bill of Materials
        Schema::create('product_bill_of_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('material_id')->constrained('products')->onDelete('cascade');
            $table->decimal('quantity_required', 10, 4);
            $table->string('unit', 50)->default('piece');
            $table->decimal('cost_per_unit', 10, 2)->nullable();
            $table->decimal('total_cost', 10, 2)->nullable();
            $table->boolean('is_optional')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'material_id']);
            $table->unique(['product_id', 'material_id']);
        });

        // تحديث جدول Material Transactions
        Schema::table('material_transactions', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null')->after('order_id');
            $table->enum('transaction_type', ['in', 'out', 'adjustment', 'reserved', 'consumed'])->change();
        });
    }

    public function down()
    {
        Schema::table('material_transactions', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropColumn('product_id');
        });

        Schema::dropIfExists('product_bill_of_materials');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'purchase_price',
                'product_type',
                'stock_quantity',
                'manage_stock',
                'auto_calculate_purchase_price',
                'manufacturing_time_days',
                'woocommerce_id',
                'woocommerce_data',
                'image_url'
            ]);
        });
    }
};
