<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->unsignedBigInteger('client_id');
            $table->unsignedBigInteger('assigned_worker_id')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['custom_tailoring', 'alteration', 'repair', 'cleaning', 'design'])->default('custom_tailoring');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->enum('status', ['draft', 'confirmed', 'in_progress', 'quality_check', 'completed', 'delivered', 'cancelled'])->default('draft');
            $table->date('order_date')->default(now());
            $table->date('delivery_date');
            $table->date('promised_date')->nullable();
            $table->date('started_date')->nullable();
            $table->date('completed_date')->nullable();
            $table->date('delivered_date')->nullable();
            $table->json('measurements')->nullable();
            $table->json('specifications')->nullable();
            $table->json('fabric_details')->nullable();
            $table->json('style_preferences')->nullable();
            $table->decimal('fabric_cost', 10, 2)->default(0);
            $table->decimal('labor_cost', 10, 2)->default(0);
            $table->decimal('additional_costs', 10, 2)->default(0);
            $table->decimal('total_cost', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('final_amount', 10, 2)->default(0);
            $table->string('currency', 3)->default('KWD');
            $table->decimal('deposit_amount', 10, 2)->default(0);
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->decimal('remaining_amount', 10, 2)->default(0);
            $table->enum('payment_status', ['unpaid', 'partial', 'paid', 'refunded'])->default('unpaid');
            $table->enum('payment_method', ['cash', 'card', 'bank_transfer', 'cheque'])->nullable();
            $table->decimal('progress_percentage', 5, 2)->default(0);
            $table->json('progress_stages')->nullable();
            $table->integer('estimated_hours')->default(0);
            $table->integer('actual_hours')->default(0);
            $table->json('time_logs')->nullable();
            $table->enum('quality_status', ['pending', 'passed', 'failed', 'rework_required'])->nullable();
            $table->text('quality_notes')->nullable();
            $table->decimal('customer_rating', 2, 1)->nullable();
            $table->text('customer_feedback')->nullable();
            $table->boolean('is_rush_order')->default(false);
            $table->decimal('rush_charge', 10, 2)->default(0);
            $table->json('special_instructions')->nullable();
            $table->json('images')->nullable();
            $table->json('attachments')->nullable();
            $table->text('internal_notes')->nullable();
            $table->text('customer_notes')->nullable();
            $table->boolean('sms_notifications')->default(true);
            $table->boolean('email_notifications')->default(true);
            $table->json('notification_history')->nullable();
            $table->date('last_contact_date')->nullable();
            $table->string('source', 50)->default('walk_in');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_template')->default(false);
            $table->unsignedBigInteger('template_order_id')->nullable();
            $table->boolean('requires_fitting')->default(true);
            $table->integer('fitting_sessions')->default(0);
            $table->date('last_fitting_date')->nullable();
            $table->timestamps();
            $table->index(['status', 'is_active']);
            $table->index(['client_id', 'order_date']);
            $table->index(['assigned_worker_id', 'status']);
            $table->index('order_number');
            $table->index(['delivery_date', 'status']);
            $table->index(['type', 'priority']);
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->foreign('assigned_worker_id')->references('id')->on('workers')->onDelete('set null');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('template_order_id')->references('id')->on('orders')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};