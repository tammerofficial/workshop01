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
        Schema::table('materials', function (Blueprint $table) {
            // فحص ما إذا كان العمود موجود
            if (!Schema::hasColumn('materials', 'type')) {
                $table->string('type')->default('general')->after('description');
            }
            if (!Schema::hasColumn('materials', 'reserved_quantity')) {
                $table->decimal('reserved_quantity', 10, 2)->default(0)->after('quantity');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->dropColumn(['type', 'reserved_quantity']);
        });
    }
};
