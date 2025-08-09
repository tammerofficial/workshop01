<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('worker_id');
            $table->string('payroll_number')->unique();
            $table->string('period');
            $table->date('period_start');
            $table->date('period_end');
            $table->date('pay_date');
            $table->decimal('basic_salary', 10, 2)->default(0);
            $table->decimal('housing_allowance', 10, 2)->default(0);
            $table->decimal('transportation_allowance', 10, 2)->default(0);
            $table->decimal('food_allowance', 10, 2)->default(0);
            $table->decimal('communication_allowance', 10, 2)->default(0);
            $table->decimal('other_allowances', 10, 2)->default(0);
            $table->decimal('performance_bonus', 10, 2)->default(0);
            $table->decimal('overtime_amount', 10, 2)->default(0);
            $table->decimal('commission_amount', 10, 2)->default(0);
            $table->decimal('production_bonus', 10, 2)->default(0);
            $table->decimal('quality_bonus', 10, 2)->default(0);
            $table->decimal('attendance_bonus', 10, 2)->default(0);
            $table->decimal('regular_hours', 8, 2)->default(0);
            $table->decimal('overtime_hours', 8, 2)->default(0);
            $table->decimal('double_time_hours', 8, 2)->default(0);
            $table->decimal('holiday_hours', 8, 2)->default(0);
            $table->decimal('sick_hours', 8, 2)->default(0);
            $table->decimal('vacation_hours', 8, 2)->default(0);
            $table->decimal('regular_rate', 10, 2)->default(0);
            $table->decimal('overtime_rate', 10, 2)->default(0);
            $table->decimal('double_time_rate', 10, 2)->default(0);
            $table->decimal('holiday_rate', 10, 2)->default(0);
            $table->decimal('social_security_deduction', 10, 2)->default(0);
            $table->decimal('tax_deduction', 10, 2)->default(0);
            $table->decimal('insurance_deduction', 10, 2)->default(0);
            $table->decimal('loan_deduction', 10, 2)->default(0);
            $table->decimal('advance_deduction', 10, 2)->default(0);
            $table->decimal('penalty_deduction', 10, 2)->default(0);
            $table->decimal('other_deductions', 10, 2)->default(0);
            $table->decimal('gross_salary', 10, 2)->default(0);
            $table->decimal('total_allowances', 10, 2)->default(0);
            $table->decimal('total_bonuses', 10, 2)->default(0);
            $table->decimal('total_deductions', 10, 2)->default(0);
            $table->decimal('net_salary', 10, 2)->default(0);
            $table->enum('payment_status', ['pending', 'processing', 'paid', 'cancelled', 'on_hold'])->default('pending');
            $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque', 'digital_wallet'])->default('bank_transfer');
            $table->string('payment_reference')->nullable();
            $table->date('payment_date')->nullable();
            $table->text('payment_notes')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->string('iban')->nullable();
            $table->integer('days_worked')->default(0);
            $table->integer('days_absent')->default(0);
            $table->integer('days_late')->default(0);
            $table->integer('days_early_leave')->default(0);
            $table->decimal('attendance_percentage', 5, 2)->default(100);
            $table->integer('orders_completed')->default(0);
            $table->decimal('productivity_score', 5, 2)->default(0);
            $table->decimal('quality_score', 5, 2)->default(0);
            $table->decimal('customer_satisfaction', 5, 2)->default(0);
            $table->string('currency', 3)->default('KWD');
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->decimal('base_currency_amount', 10, 2)->default(0);
            $table->enum('approval_status', ['draft', 'pending_approval', 'approved', 'rejected'])->default('draft');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('approval_notes')->nullable();
            $table->json('calculation_details')->nullable();
            $table->json('adjustments')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_final')->default(false);
            $table->boolean('is_advance')->default(false);
            $table->string('payslip_path')->nullable();
            $table->timestamps();
            $table->index(['worker_id', 'period']);
            $table->index(['payment_status', 'pay_date']);
            $table->index('payroll_number');
            $table->index(['period_start', 'period_end']);
            $table->index('approval_status');
            $table->foreign('worker_id')->references('id')->on('workers')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->unique(['worker_id', 'period', 'is_advance']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};