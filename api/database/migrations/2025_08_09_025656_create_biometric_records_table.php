<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('biometric_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('worker_id');
            $table->date('attendance_date');
            $table->time('check_in_time')->nullable();
            $table->time('check_out_time')->nullable();
            $table->time('break_start_time')->nullable();
            $table->time('break_end_time')->nullable();
            $table->time('lunch_start_time')->nullable();
            $table->time('lunch_end_time')->nullable();
            $table->decimal('total_hours', 8, 2)->default(0);
            $table->decimal('regular_hours', 8, 2)->default(0);
            $table->decimal('overtime_hours', 8, 2)->default(0);
            $table->decimal('break_hours', 8, 2)->default(0);
            $table->decimal('lunch_hours', 8, 2)->default(0);
            $table->decimal('net_working_hours', 8, 2)->default(0);
            $table->enum('attendance_status', ['present', 'absent', 'late', 'early_leave', 'half_day', 'holiday', 'sick_leave', 'vacation'])->default('present');
            $table->integer('late_minutes')->default(0);
            $table->integer('early_leave_minutes')->default(0);
            $table->boolean('is_holiday')->default(false);
            $table->boolean('is_weekend')->default(false);
            $table->string('device_id')->nullable();
            $table->string('device_location')->nullable();
            $table->string('biometric_type')->default('fingerprint');
            $table->string('scan_quality')->nullable();
            $table->integer('check_in_attempts')->default(1);
            $table->integer('check_out_attempts')->default(1);
            $table->boolean('is_verified')->default(true);
            $table->decimal('match_score', 5, 2)->nullable();
            $table->string('verification_method')->nullable();
            $table->unsignedBigInteger('verified_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->decimal('check_in_latitude', 10, 8)->nullable();
            $table->decimal('check_in_longitude', 11, 8)->nullable();
            $table->decimal('check_out_latitude', 10, 8)->nullable();
            $table->decimal('check_out_longitude', 11, 8)->nullable();
            $table->string('check_in_address')->nullable();
            $table->string('check_out_address')->nullable();
            $table->boolean('is_remote_checkin')->default(false);
            $table->time('scheduled_check_in')->nullable();
            $table->time('scheduled_check_out')->nullable();
            $table->string('shift_name')->nullable();
            $table->enum('shift_type', ['regular', 'overtime', 'holiday', 'night'])->default('regular');
            $table->boolean('has_exception')->default(false);
            $table->string('exception_type')->nullable();
            $table->text('exception_reason')->nullable();
            $table->enum('exception_status', ['pending', 'approved', 'rejected'])->nullable();
            $table->unsignedBigInteger('exception_approved_by')->nullable();
            $table->timestamp('exception_approved_at')->nullable();
            $table->decimal('temperature', 4, 1)->nullable();
            $table->boolean('health_check_passed')->default(true);
            $table->json('health_questionnaire')->nullable();
            $table->string('mask_detection')->nullable();
            $table->json('tasks_assigned')->nullable();
            $table->json('tasks_completed')->nullable();
            $table->decimal('productivity_score', 5, 2)->nullable();
            $table->text('work_notes')->nullable();
            $table->string('check_in_photo')->nullable();
            $table->string('check_out_photo')->nullable();
            $table->json('additional_photos')->nullable();
            $table->string('system_source')->default('biometric_device');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->json('raw_data')->nullable();
            $table->boolean('is_processed')->default(true);
            $table->boolean('requires_review')->default(false);
            $table->boolean('included_in_payroll')->default(false);
            $table->unsignedBigInteger('payroll_id')->nullable();
            $table->decimal('hours_for_pay', 8, 2)->default(0);
            $table->decimal('overtime_for_pay', 8, 2)->default(0);
            $table->text('supervisor_notes')->nullable();
            $table->text('worker_notes')->nullable();
            $table->text('hr_notes')->nullable();
            $table->timestamps();
            $table->index(['worker_id', 'attendance_date']);
            $table->index(['attendance_date', 'attendance_status']);
            $table->index(['device_id', 'attendance_date']);
            $table->index(['is_verified', 'requires_review']);
            $table->index(['has_exception', 'exception_status']);
            $table->index('included_in_payroll');
            $table->foreign('worker_id')->references('id')->on('workers')->onDelete('cascade');
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('exception_approved_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('payroll_id')->references('id')->on('payrolls')->onDelete('set null');
            $table->unique(['worker_id', 'attendance_date', 'system_source']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('biometric_records');
    }
};