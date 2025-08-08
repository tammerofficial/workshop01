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
        Schema::create('error_logs', function (Blueprint $table) {
            $table->id();
            $table->string('error_id')->unique();
            $table->string('type');
            $table->text('message');
            $table->string('file');
            $table->integer('line');
            $table->string('code')->nullable();
            $table->text('url');
            $table->string('method');
            $table->string('ip');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->json('context')->nullable();
            $table->longText('stack_trace')->nullable();
            $table->boolean('resolved')->default(false);
            $table->text('resolution_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['created_at', 'severity']);
            $table->index(['type', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['ip', 'created_at']);
            $table->index('resolved');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('error_logs');
    }
};
