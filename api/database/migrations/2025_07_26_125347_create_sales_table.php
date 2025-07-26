<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->foreignId('worker_id')->nullable()->constrained('workers')->onDelete('set null');
            $table->string('sale_number')->unique(); // SALE-XXXX
            $table->decimal('amount', 10, 2); // 80 KWD
            $table->enum('payment_method', ['cash', 'card', 'bank_transfer', 'check'])->default('cash');
            $table->enum('status', ['pending', 'completed', 'refunded', 'cancelled'])->default('completed');
            $table->date('sale_date');
            $table->time('sale_time');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
