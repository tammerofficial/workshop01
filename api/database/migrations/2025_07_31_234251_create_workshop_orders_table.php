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
        Schema::create('workshop_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // WS-XXXX format
            $table->enum('source_type', ['woocommerce', 'local', 'manual'])->default('local');
            $table->bigInteger('source_id')->nullable(); // WooCommerce order ID if cloned
            $table->foreignId('client_id')->nullable()->constrained('clients')->onDelete('set null');
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->decimal('estimated_cost', 10, 3)->default(0); // Based on materials + labor
            $table->decimal('final_cost', 10, 3)->nullable(); // Actual cost after production
            $table->decimal('selling_price', 10, 3)->default(0); // Price to customer
            $table->string('currency', 3)->default('KWD');
            $table->enum('status', [
                'pending_acceptance',    // Waiting for manager approval
                'accepted',             // Accepted by manager
                'materials_reserved',   // Materials reserved
                'in_production',        // Currently being produced
                'quality_check',        // In quality control
                'completed',           // Production completed
                'delivered',           // Delivered to customer
                'cancelled',           // Cancelled
                'on_hold'             // Temporarily paused
            ])->default('pending_acceptance');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->date('estimated_delivery_date')->nullable();
            $table->date('actual_delivery_date')->nullable();
            $table->json('delivery_address')->nullable();
            $table->foreignId('assigned_manager_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('manager_notes')->nullable();
            $table->text('production_notes')->nullable();
            $table->text('customer_notes')->nullable();
            $table->json('special_requirements')->nullable(); // Custom requirements
            $table->decimal('progress_percentage', 5, 2)->default(0); // 0.00 to 100.00
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('production_started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('order_number');
            $table->index('source_type');
            $table->index('source_id');
            $table->index('status');
            $table->index('priority');
            $table->index('estimated_delivery_date');
            $table->index('assigned_manager_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workshop_orders');
    }
};
