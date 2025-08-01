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
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('estimated_completion_date')->nullable()->after('due_date');
            $table->timestamp('actual_completion_date')->nullable()->after('estimated_completion_date');
            $table->decimal('deposit_amount', 10, 2)->default(0)->after('total_cost');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['estimated_completion_date', 'actual_completion_date', 'deposit_amount']);
        });
    }
};
