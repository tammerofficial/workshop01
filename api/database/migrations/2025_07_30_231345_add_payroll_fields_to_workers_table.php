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
            // Payroll status (only missing fields)
            $table->enum('payroll_status', ['active', 'inactive', 'suspended'])->default('active')->after('bonus_percentage');
            $table->date('last_payroll_date')->nullable()->after('payroll_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            $table->dropColumn([
                'payroll_status',
                'last_payroll_date'
            ]);
        });
    }
};
