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
        Schema::create('woocommerce_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('woocommerce_order_id')->constrained('woocommerce_orders')->onDelete('cascade');
            $table->bigInteger('wc_order_item_id'); // WooCommerce Order Item ID
            $table->bigInteger('wc_product_id'); // WooCommerce Product ID
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null'); // Link to local products
            $table->string('product_name');
            $table->string('product_sku')->nullable();
            $table->decimal('unit_price', 10, 3);
            $table->integer('quantity');
            $table->decimal('line_total', 10, 3); // unit_price * quantity
            $table->decimal('line_tax', 10, 3)->default(0);
            $table->json('product_meta')->nullable(); // Variations, custom fields, etc.
            $table->json('product_attributes')->nullable(); // Size, color, etc.
            $table->text('item_notes')->nullable();
            $table->boolean('is_cloned_to_workshop')->default(false);
            $table->bigInteger('workshop_order_item_id')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('woocommerce_order_id');
            $table->index('wc_product_id');
            $table->index('product_id');
            $table->index('is_cloned_to_workshop');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('woocommerce_order_items');
    }
};
