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
        Schema::create('system_alerts', function (Blueprint $table) {
            $table->id();
            $table->string('alert_id')->unique();
            $table->string('type');
            $table->string('category')->default('general');
            $table->enum('severity', ['low', 'warning', 'high', 'critical']);
            $table->text('message');
            $table->decimal('current_value', 10, 2)->nullable();
            $table->decimal('threshold', 10, 2)->nullable();
            $table->string('metric_name')->nullable();
            $table->json('context')->nullable();
            $table->boolean('resolved')->default(false);
            $table->text('resolution_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['type', 'created_at']);
            $table->index(['category', 'created_at']);
            $table->index(['severity', 'created_at']);
            $table->index(['resolved', 'created_at']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_alerts');
    }
};