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
            // Add user_id to connect worker with user account
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Add index for better performance
            $table->index(['user_id', 'biometric_id']);
            $table->index(['is_active', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex(['user_id', 'biometric_id']);
            $table->dropIndex(['is_active', 'user_id']);
            $table->dropColumn('user_id');
        });
    }
};