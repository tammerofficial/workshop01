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
        Schema::table('attendance', function (Blueprint $table) {
            $table->string('biometric_transaction_id')->nullable()->after('id');
            $table->json('biometric_data')->nullable()->after('notes');
            $table->string('punch_state')->nullable()->after('biometric_data');
            $table->string('verification_type')->nullable()->after('punch_state');
            $table->string('terminal_alias')->nullable()->after('verification_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance', function (Blueprint $table) {
            $table->dropColumn([
                'biometric_transaction_id', 
                'biometric_data', 
                'punch_state', 
                'verification_type', 
                'terminal_alias'
            ]);
        });
    }
};