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
        Schema::create('product_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('material_id')->constrained('materials')->onDelete('cascade');
            $table->decimal('quantity_needed', 10, 3); // How much of this material is needed
            $table->string('unit'); // meters, pieces, kg, etc.
            $table->decimal('waste_percentage', 5, 2)->default(5.00); // Expected waste (5% default)
            $table->decimal('total_quantity_with_waste', 10, 3); // quantity_needed + waste
            $table->text('usage_notes')->nullable(); // Where/how this material is used
            $table->boolean('is_critical')->default(false); // Critical material that must be available
            $table->boolean('is_optional')->default(false); // Optional material for upgrades
            $table->integer('sort_order')->default(0); // Order in BOM list
            $table->timestamps();
            
            // Unique combination of product and material
            $table->unique(['product_id', 'material_id']);
            
            // Indexes
            $table->index('product_id');
            $table->index('material_id');
            $table->index('is_critical');
            $table->index('is_optional');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_materials');
    }
};
