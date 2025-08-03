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
        Schema::table('roles', function (Blueprint $table) {
            // إضافة الهيكل الهرمي للأدوار
            $table->unsignedBigInteger('parent_role_id')->nullable()->after('id');
            $table->integer('hierarchy_level')->default(0)->after('parent_role_id');
            $table->integer('priority')->default(0)->after('hierarchy_level');
            
            // إضافة معلومات إضافية للأدوار
            $table->string('department')->nullable()->after('description');
            $table->json('conditions')->nullable()->after('permissions');
            $table->boolean('is_inheritable')->default(true)->after('is_system_role');
            $table->timestamp('expires_at')->nullable()->after('is_inheritable');
            
            // إضافة الفهارس
            $table->foreign('parent_role_id')->references('id')->on('roles')->onDelete('set null');
            $table->index(['hierarchy_level', 'priority']);
            $table->index('department');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropForeign(['parent_role_id']);
            $table->dropIndex(['hierarchy_level', 'priority']);
            $table->dropIndex(['department']);
            
            $table->dropColumn([
                'parent_role_id',
                'hierarchy_level', 
                'priority',
                'department',
                'conditions',
                'is_inheritable',
                'expires_at'
            ]);
        });
    }
};