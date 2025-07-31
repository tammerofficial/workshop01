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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('woocommerce_id')->nullable();
            $table->json('woocommerce_data')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->foreignId('collection_id')->nullable()->constrained('collections')->onDelete('set null');
            $table->string('sku')->unique();
            $table->enum('product_type', ['simple', 'variable', 'raw_material', 'product_part'])->default('simple');
            $table->decimal('price', 10, 2)->default(0);
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->boolean('manage_stock')->default(true);
            $table->boolean('auto_calculate_purchase_price')->default(false);
            $table->integer('production_hours')->default(0);
            $table->integer('manufacturing_time_days')->default(0);
            $table->json('stage_requirements')->nullable();
            $table->json('material_requirements')->nullable(); // deprecated in favor of BOM
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index('woocommerce_id');
            $table->index('product_type');
            $table->index(['product_type', 'is_active']);
            $table->index('sku');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
