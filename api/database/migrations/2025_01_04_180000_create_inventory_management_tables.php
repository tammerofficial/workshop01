<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // جدول إدارة المنتجات المركزي
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('sku')->unique();
            $table->string('barcode')->unique()->nullable();
            $table->decimal('price', 10, 3);
            $table->decimal('sale_price', 10, 3)->nullable();
            $table->decimal('cost_price', 10, 3)->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->integer('min_stock_level')->default(5);
            $table->integer('max_stock_level')->default(1000);
            $table->string('unit')->default('piece'); // piece, meter, kg, etc.
            $table->string('category')->nullable();
            $table->string('brand')->nullable();
            $table->json('images')->nullable(); // array of image URLs
            $table->json('colors')->nullable(); // available colors
            $table->json('sizes')->nullable(); // available sizes
            $table->json('specifications')->nullable(); // technical specs
            $table->json('features')->nullable(); // product features
            $table->json('care_instructions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_customizable')->default(false);
            $table->boolean('track_stock')->default(true);
            $table->string('status')->default('active'); // active, inactive, discontinued
            $table->decimal('weight', 8, 2)->nullable(); // for shipping
            $table->json('custom_options')->nullable(); // for customizable products
            $table->timestamps();
            
            $table->index(['category', 'is_active']);
            $table->index(['sku', 'barcode']);
            $table->index('stock_quantity');
        });

        // جدول حركة المخزون
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['in', 'out', 'adjustment', 'transfer']);
            $table->integer('quantity'); // positive for in, negative for out
            $table->integer('previous_quantity');
            $table->integer('new_quantity');
            $table->string('reference_type')->nullable(); // sale, purchase, adjustment, etc.
            $table->unsignedBigInteger('reference_id')->nullable(); // order_id, purchase_id, etc.
            $table->string('location')->nullable(); // warehouse, boutique, workshop
            $table->string('reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained();
            $table->timestamps();
            
            $table->index(['product_id', 'created_at']);
            $table->index(['type', 'created_at']);
        });

        // جدول تنبيهات المخزون
        Schema::create('stock_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->enum('alert_type', ['low_stock', 'out_of_stock', 'overstock']);
            $table->integer('current_quantity');
            $table->integer('threshold_quantity');
            $table->boolean('is_resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['product_id', 'is_resolved']);
            $table->index(['alert_type', 'is_resolved']);
        });

        // جدول المواقع والمستودعات
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // warehouse, boutique, workshop
            $table->string('code')->unique();
            $table->text('address')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable(); // location-specific settings
            $table->timestamps();
        });

        // جدول المخزون حسب الموقع
        Schema::create('location_inventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('location_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(0);
            $table->integer('reserved_quantity')->default(0); // for pending orders
            $table->integer('available_quantity')->storedAs('quantity - reserved_quantity');
            $table->timestamps();
            
            $table->unique(['product_id', 'location_id']);
            $table->index('available_quantity');
        });

        // جدول تحويلات المخزون بين المواقع
        Schema::create('inventory_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_location_id')->constrained('locations');
            $table->foreignId('to_location_id')->constrained('locations');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('quantity');
            $table->enum('status', ['pending', 'in_transit', 'completed', 'cancelled'])->default('pending');
            $table->text('reason')->nullable();
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'created_at']);
        });

        // جدول جرد المخزون
        Schema::create('stock_counts', function (Blueprint $table) {
            $table->id();
            $table->string('count_number')->unique();
            $table->foreignId('location_id')->constrained();
            $table->enum('status', ['draft', 'in_progress', 'completed', 'cancelled'])->default('draft');
            $table->date('count_date');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // جدول تفاصيل جرد المخزون
        Schema::create('stock_count_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_count_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained();
            $table->integer('system_quantity'); // quantity in system
            $table->integer('counted_quantity')->nullable(); // actual counted quantity
            $table->integer('variance')->storedAs('counted_quantity - system_quantity');
            $table->text('notes')->nullable();
            $table->foreignId('counted_by')->nullable()->constrained('users');
            $table->timestamp('counted_at')->nullable();
            $table->timestamps();
            
            $table->unique(['stock_count_id', 'product_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('stock_count_items');
        Schema::dropIfExists('stock_counts');
        Schema::dropIfExists('inventory_transfers');
        Schema::dropIfExists('location_inventory');
        Schema::dropIfExists('locations');
        Schema::dropIfExists('stock_alerts');
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('products');
    }
};