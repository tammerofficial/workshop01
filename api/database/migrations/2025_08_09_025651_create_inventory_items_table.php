<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('item_code')->unique();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->enum('type', ['fabric', 'accessory', 'tool', 'consumable', 'finished_product'])->default('fabric');
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('color')->nullable();
            $table->string('size')->nullable();
            $table->string('material')->nullable();
            $table->string('pattern')->nullable();
            $table->decimal('quantity', 10, 3)->default(0);
            $table->decimal('reserved_quantity', 10, 3)->default(0);
            $table->decimal('minimum_quantity', 10, 3)->default(0);
            $table->decimal('maximum_quantity', 10, 3)->default(0);
            $table->string('unit', 20)->default('piece');
            $table->decimal('unit_weight', 8, 3)->nullable();
            $table->string('weight_unit', 10)->default('kg');
            $table->decimal('purchase_price', 10, 2)->default(0);
            $table->decimal('selling_price', 10, 2)->default(0);
            $table->decimal('wholesale_price', 10, 2)->default(0);
            $table->string('currency', 3)->default('KWD');
            $table->decimal('cost_per_unit', 10, 2)->default(0);
            $table->string('supplier_name')->nullable();
            $table->string('supplier_code')->nullable();
            $table->string('supplier_item_code')->nullable();
            $table->date('last_purchase_date')->nullable();
            $table->decimal('last_purchase_price', 10, 2)->default(0);
            $table->string('warehouse_location')->nullable();
            $table->string('shelf_location')->nullable();
            $table->string('bin_location')->nullable();
            $table->string('barcode')->unique()->nullable();
            $table->string('qr_code')->unique()->nullable();
            $table->enum('status', ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'])->default('in_stock');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_trackable')->default(true);
            $table->boolean('allow_negative_stock')->default(false);
            $table->date('expiry_date')->nullable();
            $table->date('last_counted_date')->nullable();
            $table->date('last_movement_date')->nullable();
            $table->string('quality_grade')->nullable();
            $table->decimal('width', 8, 2)->nullable();
            $table->decimal('length', 8, 2)->nullable();
            $table->decimal('thickness', 8, 3)->nullable();
            $table->string('origin_country')->nullable();
            $table->string('certification')->nullable();
            $table->json('images')->nullable();
            $table->json('documents')->nullable();
            $table->json('tags')->nullable();
            $table->json('metadata')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['status', 'is_active']);
            $table->index(['type', 'category_id']);
            $table->index('item_code');
            $table->index(['quantity', 'minimum_quantity']);
            $table->index('last_movement_date');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};