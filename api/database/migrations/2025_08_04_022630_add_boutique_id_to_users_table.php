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
        Schema::table('users', function (Blueprint $table) {
            // ربط المستخدم بالبوتيك الذي يعمل فيه
            $table->foreignId('boutique_id')->nullable()->after('role_id')->constrained('boutiques')->onDelete('set null');
            
            // فهرس للأداء
            $table->index('boutique_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['boutique_id']);
            $table->dropColumn('boutique_id');
        });
    }
};