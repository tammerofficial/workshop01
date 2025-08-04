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
        Schema::create('scan_logs', function (Blueprint $table) {
            $table->id();
            
            // Scanner info
            $table->enum('scan_type', ['barcode', 'qrcode']);
            $table->text('scanned_data'); // Raw scan data
            $table->json('parsed_data')->nullable(); // Parsed JSON data
            
            // Related entities
            $table->string('entity_type')->nullable(); // product, order, material, production_stage
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->foreignId('worker_id')->nullable()->constrained('workers')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Scan context
            $table->enum('scan_purpose', [
                'information', 
                'update_status', 
                'track_production', 
                'inventory_check',
                'quality_control'
            ])->default('information');
            
            // Results
            $table->boolean('scan_successful')->default(true);
            $table->string('action_taken')->nullable(); // What action was performed
            $table->json('update_data')->nullable(); // Data that was updated
            $table->text('error_message')->nullable();
            
            // Metadata
            $table->string('device_type')->nullable(); // mobile, desktop, scanner
            $table->string('scanner_model')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->json('location_data')->nullable(); // GPS coordinates if available
            
            // Timestamps
            $table->timestamp('scanned_at');
            $table->timestamps();
            
            // Indexes
            $table->index(['scan_type', 'scanned_at']);
            $table->index(['entity_type', 'entity_id']);
            $table->index(['worker_id', 'scanned_at']);
            $table->index(['scan_successful', 'scanned_at']);
            $table->index('scan_purpose');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scan_logs');
    }
};