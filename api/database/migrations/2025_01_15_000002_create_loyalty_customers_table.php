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
        Schema::create('loyalty_customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->string('membership_number')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('tier', ['bronze', 'silver', 'gold', 'vip'])->default('bronze');
            $table->integer('total_points')->default(0);
            $table->integer('available_points')->default(0);
            $table->decimal('total_spent', 10, 3)->default(0); // إجمالي المبلغ المنفق
            $table->integer('total_orders')->default(0); // عدد الطلبات
            $table->timestamp('last_purchase_at')->nullable();
            $table->timestamp('joined_at')->nullable();
            $table->boolean('is_active')->default(true);
            
            // Apple Wallet integration
            $table->string('wallet_pass_serial')->nullable()->unique();
            $table->string('wallet_auth_token')->nullable();
            $table->timestamp('wallet_last_updated_at')->nullable();
            $table->boolean('wallet_enabled')->default(true);
            
            // Point calculation settings
            $table->decimal('points_per_kwd', 5, 2)->default(1.00); // نقاط لكل دينار
            $table->decimal('tier_multiplier', 3, 2)->default(1.00); // مضاعف حسب المستوى
            
            $table->timestamps();
            
            // فهارس للأداء
            $table->index(['tier', 'is_active']);
            $table->index('membership_number');
            $table->index(['total_points', 'tier']);
            $table->index('last_purchase_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loyalty_customers');
    }
};