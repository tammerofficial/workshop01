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
        Schema::create('material_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('material_id')->constrained()->onDelete('cascade');
            $table->foreignId('production_stage_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity_reserved', 10, 3);
            $table->decimal('quantity_used', 10, 3)->nullable();
            $table->timestamp('reservation_date');
            $table->timestamp('usage_date')->nullable();
            $table->enum('status', ['reserved', 'used', 'released'])->default('reserved');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index(['order_id', 'status']);
            $table->index(['material_id', 'status']);
            $table->index('reservation_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('material_reservations');
    }
};
