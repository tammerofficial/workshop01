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
        Schema::create('security_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_type'); // login_attempt, permission_violation, suspicious_activity
            $table->string('severity'); // low, medium, high, critical
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('ip_address', 45);
            $table->string('user_agent')->nullable();
            $table->json('event_data'); // specific event details
            $table->string('action_taken')->nullable(); // blocked, logged, alerted
            $table->boolean('investigated')->default(false);
            $table->text('investigation_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            // إضافة المفاتيح الخارجية والفهارس
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['event_type', 'severity']);
            $table->index(['user_id', 'created_at']);
            $table->index(['ip_address']);
            $table->index(['investigated', 'severity']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_events');
    }
};