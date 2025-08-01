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
        Schema::create('workshop_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workshop_order_id')->constrained('workshop_orders')->onDelete('cascade');
            $table->bigInteger('source_order_item_id')->nullable(); // WooCommerce order item ID if cloned
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade'); // Workshop product
            $table->string('product_name');
            $table->string('product_sku')->nullable();
            $table->integer('quantity');
            $table->decimal('unit_cost', 10, 3)->default(0); // Cost to produce one unit
            $table->decimal('total_cost', 10, 3)->default(0); // unit_cost * quantity
            $table->decimal('unit_price', 10, 3)->default(0); // Selling price per unit
            $table->decimal('total_price', 10, 3)->default(0); // unit_price * quantity
            $table->json('product_specifications')->nullable(); // Size, color, custom measurements
            $table->json('materials_breakdown')->nullable(); // JSON of required materials with quantities
            $table->enum('status', [
                'pending',              // Not started
                'materials_reserved',   // Materials allocated
                'in_production',        // Currently being made
                'quality_check',        // In QC
                'completed',           // Item finished
                'cancelled'            // Item cancelled
            ])->default('pending');
            $table->decimal('progress_percentage', 5, 2)->default(0); // Item-level progress
            $table->foreignId('assigned_worker_id')->nullable()->constrained('workers')->onDelete('set null');
            $table->text('production_notes')->nullable();
            $table->text('quality_notes')->nullable();
            $table->timestamp('production_started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('workshop_order_id');
            $table->index('product_id');
            $table->index('status');
            $table->index('assigned_worker_id');
            $table->index('source_order_item_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workshop_order_items');
    }
};
