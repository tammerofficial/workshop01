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
        Schema::create('plugins', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('version')->default('1.0.0');
            $table->string('author')->nullable();
            $table->string('author_email')->nullable();
            $table->boolean('status')->default(false); // active/inactive
            $table->json('config')->nullable(); // plugin configuration
            $table->json('dependencies')->nullable(); // required plugins/packages
            $table->json('permissions')->nullable(); // required permissions
            $table->json('routes')->nullable(); // plugin routes
            $table->json('hooks')->nullable(); // event hooks
            $table->json('assets')->nullable(); // CSS/JS assets
            $table->timestamp('install_date')->nullable();
            $table->timestamp('last_update')->nullable();
            $table->string('compatibility_version')->default('1.0.0'); // min system version
            $table->integer('priority')->default(10); // execution priority
            $table->string('category')->default('other'); // plugin category
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['status', 'priority']);
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plugins');
    }
};
