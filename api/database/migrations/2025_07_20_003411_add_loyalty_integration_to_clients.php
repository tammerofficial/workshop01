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
        Schema::table('clients', function (Blueprint $table) {
            // ربط مع نظام الولاء
            $table->unsignedBigInteger('loyalty_customer_id')->nullable()->after('woocommerce_id');
            $table->string('loyalty_tier')->default('bronze')->after('loyalty_customer_id');
            $table->integer('loyalty_points')->default(0)->after('loyalty_tier');
            $table->integer('available_loyalty_points')->default(0)->after('loyalty_points');
            $table->boolean('loyalty_enabled')->default(true)->after('available_loyalty_points');
            $table->timestamp('loyalty_joined_at')->nullable()->after('loyalty_enabled');
            
            // فهرس للبحث السريع
            $table->index('loyalty_customer_id');
            $table->index(['loyalty_enabled', 'loyalty_tier']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropIndex(['clients_loyalty_customer_id_index']);
            $table->dropIndex(['clients_loyalty_enabled_loyalty_tier_index']);
            $table->dropColumn([
                'loyalty_customer_id',
                'loyalty_tier',
                'loyalty_points',
                'available_loyalty_points',
                'loyalty_enabled',
                'loyalty_joined_at'
            ]);
        });
    }
};