<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stations', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Station 1, Station 2, etc.
            $table->text('description')->nullable();
            $table->foreignId('production_stage_id')->constrained()->onDelete('cascade');
            $table->foreignId('assigned_worker_id')->nullable()->constrained('workers')->onDelete('set null');
            $table->enum('status', ['available', 'busy', 'maintenance', 'offline'])->default('available');
            $table->json('equipment')->nullable(); // Equipment at this station
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stations');
    }
}; 