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
        Schema::table('workers', function (Blueprint $table) {
            $table->decimal('salary_kwd', 10, 3)->nullable()->after('salary')->comment('Monthly salary in Kuwaiti Dinars');
            $table->decimal('hourly_rate_kwd', 8, 3)->nullable()->after('overtime_rate')->comment('Hourly rate in Kuwaiti Dinars');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            $table->dropColumn(['salary_kwd', 'hourly_rate_kwd']);
        });
    }
};
