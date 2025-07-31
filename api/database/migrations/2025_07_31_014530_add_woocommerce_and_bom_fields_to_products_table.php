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
        Schema::table('products', function (Blueprint $table) {
            // WooCommerce integration fields
            $table->unsignedBigInteger('woocommerce_id')->nullable()->after('id');
            $table->json('woocommerce_data')->nullable()->after('woocommerce_id');
            
            // Product type field for BOM system
            $table->enum('product_type', ['simple', 'variable', 'raw_material', 'product_part'])
                  ->default('simple')->after('sku');
            
            // Manufacturing and BOM fields
            $table->decimal('purchase_price', 10, 2)->nullable()->after('price');
            $table->integer('manufacturing_time_days')->default(0)->after('production_hours');
            $table->boolean('manage_stock')->default(true)->after('stock_quantity');
            $table->boolean('auto_calculate_purchase_price')->default(false)->after('manage_stock');
            
            // Stock quantity field if not exists
            if (!Schema::hasColumn('products', 'stock_quantity')) {
                $table->integer('stock_quantity')->default(0)->after('price');
            }
            
            // Add indexes
            $table->index('woocommerce_id');
            $table->index('product_type');
            $table->index(['product_type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['products_woocommerce_id_index']);
            $table->dropIndex(['products_product_type_index']);
            $table->dropIndex(['products_product_type_is_active_index']);
            
            $table->dropColumn([
                'woocommerce_id',
                'woocommerce_data',
                'product_type',
                'purchase_price',
                'manufacturing_time_days',
                'manage_stock',
                'auto_calculate_purchase_price'
            ]);
        });
    }
};
