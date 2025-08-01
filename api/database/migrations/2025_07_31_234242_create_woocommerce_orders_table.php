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
        Schema::create('woocommerce_orders', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('wc_order_id')->unique(); // WooCommerce Order ID
            $table->string('order_number')->nullable(); // Order Number from WooCommerce
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->decimal('total_amount', 10, 3); // KWD with 3 decimal places
            $table->decimal('tax_amount', 10, 3)->default(0);
            $table->decimal('shipping_amount', 10, 3)->default(0);
            $table->string('currency', 3)->default('KWD');
            $table->enum('status', ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed'])->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->string('payment_method')->nullable();
            $table->json('billing_address')->nullable(); // JSON for full address
            $table->json('shipping_address')->nullable(); // JSON for full address
            $table->text('customer_notes')->nullable();
            $table->text('order_notes')->nullable();
            $table->boolean('is_cloned_to_workshop')->default(false); // Track if cloned
            $table->bigInteger('workshop_order_id')->nullable(); // Link to workshop order
            $table->timestamp('order_date'); // WooCommerce order date
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('wc_order_id');
            $table->index('status');
            $table->index('is_cloned_to_workshop');
            $table->index('order_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('woocommerce_orders');
    }
};
