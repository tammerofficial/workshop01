<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('worker_id')->constrained()->onDelete('cascade');
            $table->date('attendance_date');
            $table->time('check_in_time')->nullable(); // 9:00
            $table->time('check_out_time')->nullable(); // 17:00
            $table->time('break_start')->nullable();
            $table->time('break_end')->nullable();
            $table->integer('total_hours')->default(0);
            $table->enum('status', ['present', 'absent', 'late', 'half_day', 'leave'])->default('present');
            $table->string('device_id')->nullable(); // ZKTeco device ID
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Unique constraint for worker and date
            $table->unique(['worker_id', 'attendance_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance');
    }
}; 