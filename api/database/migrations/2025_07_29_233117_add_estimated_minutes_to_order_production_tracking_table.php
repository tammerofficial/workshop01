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
        Schema::table('order_production_tracking', function (Blueprint $table) {
            if (!Schema::hasColumn('order_production_tracking', 'estimated_minutes')) {
                $table->integer('estimated_minutes')->nullable()->after('completed_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_production_tracking', function (Blueprint $table) {
            $table->dropColumn('estimated_minutes');
        });
    }
};
