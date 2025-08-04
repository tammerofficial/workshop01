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
        Schema::table('workers', function (Blueprint $table) {
            // Personal Information from Biometric
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->string('nationality')->nullable();
            $table->string('id_number')->nullable(); // رقم الهوية
            $table->string('passport_number')->nullable();
            $table->string('visa_number')->nullable();
            $table->date('visa_expiry')->nullable();
            
            // Contact Information
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            
            // Employment Details
            $table->string('position_code')->nullable();
            $table->string('position_name')->nullable();
            $table->string('department_code')->nullable();
            $table->string('area_code')->nullable();
            $table->string('area_name')->nullable();
            $table->string('shift_type')->nullable(); // نوبة العمل
            $table->time('work_start_time')->nullable();
            $table->time('work_end_time')->nullable();
            $table->integer('work_days_per_week')->nullable();
            $table->string('employment_type')->nullable(); // دوام كامل/جزئي
            $table->string('contract_type')->nullable(); // محدد/غير محدد
            $table->date('contract_start_date')->nullable();
            $table->date('contract_end_date')->nullable();
            
            // Salary and Financial Information
            $table->decimal('basic_salary', 10, 2)->nullable();
            $table->decimal('allowances', 10, 2)->nullable(); // البدلات
            $table->decimal('overtime_hourly_rate', 8, 2)->nullable();
            $table->decimal('bonus_rate', 5, 2)->nullable(); // نسبة البونص
            $table->string('salary_currency', 3)->default('KWD');
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('iban')->nullable();
            
            // Performance and Skills
            $table->json('technical_skills')->nullable(); // المهارات التقنية
            $table->json('certifications')->nullable(); // الشهادات
            $table->json('training_history')->nullable(); // تاريخ التدريب
            $table->decimal('performance_rating', 3, 2)->nullable(); // من 1 إلى 5
            $table->json('performance_history')->nullable(); // تاريخ الأداء
            $table->integer('productivity_score')->nullable(); // نقاط الإنتاجية
            $table->json('completed_projects')->nullable(); // المشاريع المكتملة
            $table->decimal('quality_score', 5, 2)->nullable(); // نقاط الجودة
            $table->integer('attendance_score')->nullable(); // نقاط الحضور
            
            // Attendance and Time Tracking
            $table->time('regular_check_in_time')->nullable();
            $table->time('regular_check_out_time')->nullable();
            $table->integer('total_working_days')->default(0);
            $table->integer('total_absent_days')->default(0);
            $table->integer('total_late_days')->default(0);
            $table->integer('total_overtime_hours')->default(0);
            $table->decimal('total_overtime_amount', 10, 2)->default(0);
            $table->integer('vacation_days_used')->default(0);
            $table->integer('vacation_days_remaining')->default(0);
            $table->integer('sick_days_used')->default(0);
            $table->decimal('attendance_percentage', 5, 2)->nullable();
            
            // Production Tracking
            $table->json('production_stages_mastered')->nullable(); // المراحل التي يتقنها
            $table->json('current_assignments')->nullable(); // المهام الحالية
            $table->integer('total_orders_completed')->default(0);
            $table->decimal('average_completion_time', 8, 2)->nullable(); // متوسط وقت الإنجاز
            $table->decimal('efficiency_rating', 5, 2)->nullable(); // تقييم الكفاءة
            $table->integer('quality_rejections')->default(0); // عدد المرفوضات
            $table->decimal('defect_rate', 5, 2)->nullable(); // معدل العيوب
            $table->json('stage_performance')->nullable(); // أداء كل مرحلة
            
            // Biometric Data
            $table->json('fingerprint_templates')->nullable();
            $table->json('face_templates')->nullable();
            $table->json('palm_templates')->nullable();
            $table->boolean('fingerprint_enrolled')->default(false);
            $table->boolean('face_enrolled')->default(false);
            $table->boolean('palm_enrolled')->default(false);
            $table->string('biometric_device_id')->nullable();
            $table->timestamp('last_biometric_sync')->nullable();
            
            // Payroll Information
            $table->json('payroll_history')->nullable(); // تاريخ الرواتب
            $table->decimal('ytd_gross_pay', 12, 2)->default(0); // إجمالي الراتب السنوي
            $table->decimal('ytd_net_pay', 12, 2)->default(0); // صافي الراتب السنوي
            $table->decimal('ytd_overtime', 10, 2)->default(0); // إجمالي الإضافي السنوي
            $table->decimal('ytd_bonuses', 10, 2)->default(0); // إجمالي البونصات السنوي
            $table->decimal('ytd_deductions', 10, 2)->default(0); // إجمالي الخصومات السنوي
            $table->json('tax_information')->nullable(); // معلومات الضرائب
            
            // Health and Safety
            $table->json('medical_information')->nullable(); // المعلومات الطبية
            $table->json('safety_training')->nullable(); // تدريب السلامة
            $table->integer('safety_incidents')->default(0); // حوادث السلامة
            $table->date('last_medical_checkup')->nullable();
            $table->json('work_restrictions')->nullable(); // قيود العمل
            
            // Status and Flags
            $table->boolean('is_probation')->default(false); // فترة تجريبية
            $table->date('probation_end_date')->nullable();
            $table->boolean('is_terminated')->default(false);
            $table->date('termination_date')->nullable();
            $table->string('termination_reason')->nullable();
            $table->boolean('is_rehireable')->default(true);
            $table->boolean('requires_training')->default(false);
            $table->json('required_training_modules')->nullable();
            
            // Communication and Notifications
            $table->string('preferred_language', 10)->default('ar');
            $table->json('notification_preferences')->nullable();
            $table->boolean('email_notifications')->default(true);
            $table->boolean('sms_notifications')->default(false);
            
            // Metadata
            $table->timestamp('last_api_sync')->nullable();
            $table->json('api_sync_errors')->nullable();
            $table->integer('sync_attempts')->default(0);
            $table->timestamp('last_login_attempt')->nullable();
            $table->integer('failed_login_attempts')->default(0);
            $table->json('audit_trail')->nullable(); // مسار التدقيق
            
            // Indexes for better performance
            $table->index(['biometric_id', 'is_active']);
            $table->index(['department', 'position_name']);
            $table->index(['hire_date', 'is_active']);
            $table->index(['employee_code', 'user_id']);
            $table->index('last_api_sync');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            // Drop all added columns
            $table->dropColumn([
                'first_name', 'last_name', 'middle_name', 'birth_date', 'gender', 
                'nationality', 'id_number', 'passport_number', 'visa_number', 'visa_expiry',
                'address', 'city', 'country', 'emergency_contact_name', 'emergency_contact_phone',
                'position_code', 'position_name', 'department_code', 'area_code', 'area_name',
                'shift_type', 'work_start_time', 'work_end_time', 'work_days_per_week',
                'employment_type', 'contract_type', 'contract_start_date', 'contract_end_date',
                'basic_salary', 'allowances', 'overtime_hourly_rate', 'bonus_rate',
                'salary_currency', 'bank_name', 'bank_account_number', 'iban',
                'technical_skills', 'certifications', 'training_history', 'performance_rating',
                'performance_history', 'productivity_score', 'completed_projects',
                'quality_score', 'attendance_score', 'regular_check_in_time', 'regular_check_out_time',
                'total_working_days', 'total_absent_days', 'total_late_days', 
                'total_overtime_hours', 'total_overtime_amount', 'vacation_days_used',
                'vacation_days_remaining', 'sick_days_used', 'attendance_percentage',
                'production_stages_mastered', 'current_assignments', 'total_orders_completed',
                'average_completion_time', 'efficiency_rating', 'quality_rejections',
                'defect_rate', 'stage_performance', 'fingerprint_templates', 'face_templates',
                'palm_templates', 'fingerprint_enrolled', 'face_enrolled', 'palm_enrolled',
                'biometric_device_id', 'last_biometric_sync', 'payroll_history',
                'ytd_gross_pay', 'ytd_net_pay', 'ytd_overtime', 'ytd_bonuses', 'ytd_deductions',
                'tax_information', 'medical_information', 'safety_training', 'safety_incidents',
                'last_medical_checkup', 'work_restrictions', 'is_probation', 'probation_end_date',
                'is_terminated', 'termination_date', 'termination_reason', 'is_rehireable',
                'requires_training', 'required_training_modules', 'preferred_language',
                'notification_preferences', 'email_notifications', 'sms_notifications',
                'last_api_sync', 'api_sync_errors', 'sync_attempts', 'last_login_attempt',
                'failed_login_attempts', 'audit_trail'
            ]);
            
            // Drop indexes
            $table->dropIndex(['biometric_id', 'is_active']);
            $table->dropIndex(['department', 'position_name']);
            $table->dropIndex(['hire_date', 'is_active']);
            $table->dropIndex(['employee_code', 'user_id']);
            $table->dropIndex(['last_api_sync']);
        });
    }
};