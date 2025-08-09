# PowerShell Phase 2 Database Setup - English-only content
# Encoding: UTF-8 (no BOM)

$ErrorActionPreference = 'Stop'

function Log([string]$msg) {
  $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  $logDir = Join-Path (Get-Location) 'storage\logs'
  if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
  $logFile = Join-Path $logDir ("cursor_log_{0}.txt" -f (Get-Date -Format 'yyyyMMdd'))
  Add-Content -Path $logFile -Value "[$ts] $msg"
}

function Write-TextFile($relativePath, [string]$content) {
  $fullPath = Join-Path (Get-Location) $relativePath
  $dir = Split-Path -Parent $fullPath
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($fullPath, $content, $utf8NoBom)
  Log "Wrote $relativePath"
}

try {
  Log '=== Phase 2 setup started ==='

  # -------------------- Migrations (English-only) --------------------
  $migUsers = @'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
'@
  Write-TextFile 'database/migrations/2025_08_09_025600_create_users_table.php' $migUsers

  $migCategories = @'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('image')->nullable();
            $table->string('color')->default('#3b82f6');
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['is_active', 'sort_order']);
            $table->index('parent_id');
            $table->foreign('parent_id')->references('id')->on('categories')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
'@
  Write-TextFile 'database/migrations/2025_08_09_025646_create_categories_table.php' $migCategories

  $migClients = @'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique()->nullable();
            $table->string('phone')->nullable();
            $table->string('mobile')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->default('Kuwait');
            $table->string('postal_code')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->enum('client_type', ['individual', 'business'])->default('individual');
            $table->string('business_name')->nullable();
            $table->string('tax_number')->nullable();
            $table->decimal('credit_limit', 10, 2)->default(0);
            $table->decimal('current_balance', 10, 2)->default(0);
            $table->enum('payment_terms', ['cash', 'credit_30', 'credit_60', 'credit_90'])->default('cash');
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_vip')->default(false);
            $table->date('registration_date')->default(now());
            $table->date('last_order_date')->nullable();
            $table->text('notes')->nullable();
            $table->json('preferences')->nullable();
            $table->json('measurements')->nullable();
            $table->timestamps();
            $table->index(['is_active', 'client_type']);
            $table->index('email');
            $table->index(['phone', 'mobile']);
            $table->index('last_order_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
'@
  Write-TextFile 'database/migrations/2025_08_09_025648_create_clients_table.php' $migClients

  $migWorkers = @'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workers', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id')->unique();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->string('email')->unique()->nullable();
            $table->string('phone')->nullable();
            $table->string('mobile')->nullable();
            $table->text('address')->nullable();
            $table->string('national_id')->unique()->nullable();
            $table->string('passport_number')->unique()->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female']);
            $table->string('nationality')->default('Kuwait');
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed'])->nullable();
            $table->string('department');
            $table->string('specialty');
            $table->string('position');
            $table->enum('employment_type', ['full_time', 'part_time', 'contract', 'temporary'])->default('full_time');
            $table->date('hire_date');
            $table->date('contract_end_date')->nullable();
            $table->enum('work_shift', ['morning', 'evening', 'night', 'rotating'])->default('morning');
            $table->json('skills')->nullable();
            $table->integer('experience_years')->default(0);
            $table->decimal('basic_salary', 10, 2);
            $table->decimal('housing_allowance', 10, 2)->default(0);
            $table->decimal('transportation_allowance', 10, 2)->default(0);
            $table->decimal('food_allowance', 10, 2)->default(0);
            $table->decimal('other_allowances', 10, 2)->default(0);
            $table->decimal('overtime_rate', 10, 2)->default(0);
            $table->enum('salary_currency', ['KWD', 'USD', 'EUR'])->default('KWD');
            $table->enum('payment_frequency', ['monthly', 'weekly', 'daily'])->default('monthly');
            $table->integer('annual_leave_days')->default(30);
            $table->integer('sick_leave_days')->default(10);
            $table->enum('performance_rating', ['excellent', 'good', 'average', 'poor'])->nullable();
            $table->decimal('productivity_score', 5, 2)->default(0);
            $table->integer('completed_orders')->default(0);
            $table->decimal('average_completion_time', 8, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_on_probation')->default(false);
            $table->date('probation_end_date')->nullable();
            $table->string('biometric_id')->unique()->nullable();
            $table->string('rfid_card')->unique()->nullable();
            $table->json('access_permissions')->nullable();
            $table->time('shift_start_time')->default('08:00:00');
            $table->time('shift_end_time')->default('17:00:00');
            $table->json('working_days')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->string('photo')->nullable();
            $table->text('notes')->nullable();
            $table->json('documents')->nullable();
            $table->timestamps();
            $table->index(['is_active', 'department']);
            $table->index(['specialty', 'is_active']);
            $table->index('employee_id');
            $table->index('hire_date');
            $table->index('performance_rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};
'@
  Write-TextFile 'database/migrations/2025_08_09_025649_create_workers_table.php' $migWorkers

  $migInventory = @'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('item_code')->unique();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->enum('type', ['fabric', 'accessory', 'tool', 'consumable', 'finished_product'])->default('fabric');
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('color')->nullable();
            $table->string('size')->nullable();
            $table->string('material')->nullable();
            $table->string('pattern')->nullable();
            $table->decimal('quantity', 10, 3)->default(0);
            $table->decimal('reserved_quantity', 10, 3)->default(0);
            $table->decimal('minimum_quantity', 10, 3)->default(0);
            $table->decimal('maximum_quantity', 10, 3)->default(0);
            $table->string('unit', 20)->default('piece');
            $table->decimal('unit_weight', 8, 3)->nullable();
            $table->string('weight_unit', 10)->default('kg');
            $table->decimal('purchase_price', 10, 2)->default(0);
            $table->decimal('selling_price', 10, 2)->default(0);
            $table->decimal('wholesale_price', 10, 2)->default(0);
            $table->string('currency', 3)->default('KWD');
            $table->decimal('cost_per_unit', 10, 2)->default(0);
            $table->string('supplier_name')->nullable();
            $table->string('supplier_code')->nullable();
            $table->string('supplier_item_code')->nullable();
            $table->date('last_purchase_date')->nullable();
            $table->decimal('last_purchase_price', 10, 2)->default(0);
            $table->string('warehouse_location')->nullable();
            $table->string('shelf_location')->nullable();
            $table->string('bin_location')->nullable();
            $table->string('barcode')->unique()->nullable();
            $table->string('qr_code')->unique()->nullable();
            $table->enum('status', ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'])->default('in_stock');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_trackable')->default(true);
            $table->boolean('allow_negative_stock')->default(false);
            $table->date('expiry_date')->nullable();
            $table->date('last_counted_date')->nullable();
            $table->date('last_movement_date')->nullable();
            $table->string('quality_grade')->nullable();
            $table->decimal('width', 8, 2)->nullable();
            $table->decimal('length', 8, 2)->nullable();
            $table->decimal('thickness', 8, 3)->nullable();
            $table->string('origin_country')->nullable();
            $table->string('certification')->nullable();
            $table->json('images')->nullable();
            $table->json('documents')->nullable();
            $table->json('tags')->nullable();
            $table->json('metadata')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['status', 'is_active']);
            $table->index(['type', 'category_id']);
            $table->index('item_code');
            $table->index(['quantity', 'minimum_quantity']);
            $table->index('last_movement_date');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
'@
  Write-TextFile 'database/migrations/2025_08_09_025651_create_inventory_items_table.php' $migInventory

  $migOrders = @'
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
'@
  Write-TextFile 'database/migrations/2025_08_09_025653_create_orders_table.php' $migOrders

  $migPayrolls = @'
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
'@
  Write-TextFile 'database/migrations/2025_08_09_025654_create_payrolls_table.php' $migPayrolls

  $migBiometric = @'
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
'@
  Write-TextFile 'database/migrations/2025_08_09_025656_create_biometric_records_table.php' $migBiometric

  # -------------------- Seeders (English-only) --------------------
  $seederDatabase = @'
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            ClientSeeder::class,
            WorkerSeeder::class,
            InventoryItemSeeder::class,
            OrderSeeder::class,
        ]);
    }
}
'@
  Write-TextFile 'database/seeders/DatabaseSeeder.php' $seederDatabase

  $seederCategory = @'
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Men Clothing', 'color' => '#3b82f6', 'sort_order' => 1],
            ['name' => 'Women Clothing', 'color' => '#ec4899', 'sort_order' => 2],
            ['name' => 'Traditional Wear', 'color' => '#059669', 'sort_order' => 3],
            ['name' => 'Formal Wear', 'color' => '#7c3aed', 'sort_order' => 4],
            ['name' => 'Alterations', 'color' => '#f59e0b', 'sort_order' => 5],
        ];
        foreach ($categories as $c) { Category::create($c); }
    }
}
'@
  Write-TextFile 'database/seeders/CategorySeeder.php' $seederCategory

  $seederClient = @'
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Client;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            ['name' => 'John Smith', 'email' => 'john@example.com'],
            ['name' => 'Sarah Johnson', 'email' => 'sarah@example.com'],
            ['name' => 'David Miller', 'email' => 'david@example.com'],
            ['name' => 'Emily Davis', 'email' => 'emily@example.com'],
            ['name' => 'Michael Brown', 'email' => 'michael@example.com'],
        ];
        foreach ($clients as $c) { Client::create($c); }
    }
}
'@
  Write-TextFile 'database/seeders/ClientSeeder.php' $seederClient

  $seederWorker = @'
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Worker;
use Illuminate\Support\Str;

class WorkerSeeder extends Seeder
{
    public function run(): void
    {
        $workers = [
            ['employee_id' => 'W001', 'name' => 'Ali Hassan', 'gender' => 'male', 'department' => 'Tailoring', 'specialty' => 'Tailor', 'position' => 'Senior Tailor', 'employment_type' => 'full_time', 'hire_date' => now()->subYears(3)->toDateString(), 'basic_salary' => 400],
            ['employee_id' => 'W002', 'name' => 'Omar Saleh', 'gender' => 'male', 'department' => 'Cutting', 'specialty' => 'Cutter', 'position' => 'Cutter', 'employment_type' => 'full_time', 'hire_date' => now()->subYears(2)->toDateString(), 'basic_salary' => 350],
            ['employee_id' => 'W003', 'name' => 'Yousef Ali', 'gender' => 'male', 'department' => 'Design', 'specialty' => 'Designer', 'position' => 'Designer', 'employment_type' => 'full_time', 'hire_date' => now()->subYears(1)->toDateString(), 'basic_salary' => 450],
            ['employee_id' => 'W004', 'name' => 'Khaled Noor', 'gender' => 'male', 'department' => 'Tailoring', 'specialty' => 'Tailor', 'position' => 'Tailor', 'employment_type' => 'full_time', 'hire_date' => now()->subMonths(8)->toDateString(), 'basic_salary' => 320],
            ['employee_id' => 'W005', 'name' => 'Hamad Faisal', 'gender' => 'male', 'department' => 'Finishing', 'specialty' => 'Finisher', 'position' => 'Finisher', 'employment_type' => 'full_time', 'hire_date' => now()->subMonths(5)->toDateString(), 'basic_salary' => 300],
        ];
        foreach ($workers as $w) { Worker::create($w); }
    }
}
'@
  Write-TextFile 'database/seeders/WorkerSeeder.php' $seederWorker

  $seederInventory = @'
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryItem;
use App\Models\Category;

class InventoryItemSeeder extends Seeder
{
    public function run(): void
    {
        $cat = Category::first();
        $items = [
            ['item_code' => 'FAB-001', 'name' => 'Cotton Fabric', 'category_id' => optional($cat)->id, 'type' => 'fabric', 'quantity' => 100, 'unit' => 'meter', 'purchase_price' => 2.5, 'selling_price' => 4.0],
            ['item_code' => 'FAB-002', 'name' => 'Linen Fabric', 'category_id' => optional($cat)->id, 'type' => 'fabric', 'quantity' => 80, 'unit' => 'meter', 'purchase_price' => 3.0, 'selling_price' => 5.0],
            ['item_code' => 'BTN-001', 'name' => 'Buttons Pack', 'category_id' => optional($cat)->id, 'type' => 'accessory', 'quantity' => 500, 'unit' => 'piece', 'purchase_price' => 0.02, 'selling_price' => 0.05],
        ];
        foreach ($items as $i) { InventoryItem::create($i); }
    }
}
'@
  Write-TextFile 'database/seeders/InventoryItemSeeder.php' $seederInventory

  $seederOrder = @'
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\Client;
use App\Models\Worker;
use App\Models\Category;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $client = Client::first();
        $worker = Worker::first();
        $cat = Category::first();
        if (!$client) { return; }
        $orders = [
            ['order_number' => 'ORD-2025-001', 'client_id' => $client->id, 'assigned_worker_id' => optional($worker)->id, 'category_id' => optional($cat)->id, 'title' => 'Custom Thobe', 'delivery_date' => now()->addDays(10)->toDateString(), 'status' => 'confirmed', 'deposit_amount' => 10, 'paid_amount' => 10, 'final_amount' => 50],
            ['order_number' => 'ORD-2025-002', 'client_id' => $client->id, 'assigned_worker_id' => optional($worker)->id, 'category_id' => optional($cat)->id, 'title' => 'Suit Alteration', 'delivery_date' => now()->addDays(7)->toDateString(), 'status' => 'in_progress', 'deposit_amount' => 5, 'paid_amount' => 5, 'final_amount' => 20],
        ];
        foreach ($orders as $o) { Order::create($o); }
    }
}
'@
  Write-TextFile 'database/seeders/OrderSeeder.php' $seederOrder

  # -------------------- Run artisan commands --------------------
  Log 'Running optimize:clear'
  & php artisan optimize:clear | Out-Null

  Log 'Running migrate:fresh --seed'
  & php artisan migrate:fresh --seed | Tee-Object -Variable migrateOut | Out-Null
  Log ("Migrate output:\n" + ($migrateOut -join "`n"))

  Log '=== Phase 2 setup completed successfully ==='
  Write-Output 'Phase 2 completed successfully.'
}
catch {
  Log "ERROR: $($_.Exception.Message)"
  Write-Error $_.Exception.Message
  exit 1
}
