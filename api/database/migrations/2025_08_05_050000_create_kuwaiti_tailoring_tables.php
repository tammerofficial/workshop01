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
        // Create clients table if not exists
        if (!Schema::hasTable('clients')) {
            Schema::create('clients', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique()->nullable();
                $table->string('phone')->nullable();
                $table->text('address')->nullable();
                $table->json('preferences')->nullable();
                $table->json('body_measurements')->nullable();
                $table->string('source')->default('local');
                $table->string('status')->default('active');
                $table->integer('total_orders')->default(0);
                $table->decimal('total_spent', 10, 3)->default(0);
                $table->timestamps();
            });
        }

        // Create workers table if not exists
        if (!Schema::hasTable('workers')) {
            Schema::create('workers', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique()->nullable();
                $table->string('phone')->nullable();
                $table->string('employee_code')->unique();
                $table->string('department');
                $table->string('position');
                $table->string('speciality')->nullable();
                $table->integer('experience_years')->default(0);
                $table->decimal('hourly_rate', 8, 3)->default(0);
                $table->integer('efficiency_rating')->default(0);
                $table->integer('quality_score')->default(0);
                $table->string('status')->default('active');
                $table->date('hire_date')->nullable();
                $table->timestamps();
            });
        }

        // Create orders table if not exists
        if (!Schema::hasTable('orders')) {
            Schema::create('orders', function (Blueprint $table) {
                $table->id();
                $table->string('order_number')->unique();
                $table->string('client_name');
                $table->string('item_type');
                $table->text('description');
                $table->string('fabric')->nullable();
                $table->string('color')->nullable();
                $table->string('size')->nullable();
                $table->integer('quantity')->default(1);
                $table->decimal('price', 10, 3);
                $table->decimal('total_amount', 10, 3);
                $table->string('currency')->default('KWD');
                $table->string('status')->default('pending');
                $table->string('priority')->default('medium');
                $table->date('delivery_date')->nullable();
                $table->text('special_requests')->nullable();
                $table->integer('progress_percentage')->default(0);
                $table->timestamps();
            });
        }

        // Create inventory table if not exists  
        if (!Schema::hasTable('inventory')) {
            Schema::create('inventory', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('category');
                $table->string('sku')->unique();
                $table->string('unit');
                $table->integer('quantity');
                $table->decimal('cost_per_unit', 10, 3);
                $table->decimal('total_value', 12, 3);
                $table->string('supplier')->nullable();
                $table->integer('reorder_level')->default(10);
                $table->string('location')->nullable();
                $table->text('description')->nullable();
                $table->string('status')->default('available');
                $table->timestamps();
            });
        }

        // Create production_tasks table if not exists
        if (!Schema::hasTable('production_tasks')) {
            Schema::create('production_tasks', function (Blueprint $table) {
                $table->id();
                $table->string('task_name');
                $table->unsignedBigInteger('order_id')->nullable();
                $table->string('assigned_worker')->nullable();
                $table->string('stage');
                $table->integer('estimated_hours')->default(0);
                $table->integer('actual_hours')->default(0);
                $table->string('status')->default('pending');
                $table->integer('quality_score')->default(0);
                $table->text('notes')->nullable();
                $table->timestamp('start_date')->nullable();
                $table->timestamp('completion_date')->nullable();
                $table->timestamps();
            });
        }

        // Create boutique_products table if not exists
        if (!Schema::hasTable('boutique_products')) {
            Schema::create('boutique_products', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('category');
                $table->decimal('price', 10, 3);
                $table->text('description')->nullable();
                $table->boolean('in_stock')->default(true);
                $table->integer('quantity')->default(0);
                $table->timestamps();
            });
        }

        // Create loyalty_customers table if not exists
        if (!Schema::hasTable('loyalty_customers')) {
            Schema::create('loyalty_customers', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('phone');
                $table->integer('points_balance')->default(0);
                $table->decimal('total_spent', 10, 3)->default(0);
                $table->string('membership_level')->default('bronze');
                $table->timestamps();
            });
        }

        // Create sales table if not exists
        if (!Schema::hasTable('sales')) {
            Schema::create('sales', function (Blueprint $table) {
                $table->id();
                $table->date('sale_date');
                $table->decimal('total_amount', 10, 3);
                $table->integer('items_count');
                $table->string('customer_name');
                $table->string('payment_method');
                $table->string('currency')->default('KWD');
                $table->decimal('tax_amount', 10, 3)->default(0);
                $table->decimal('discount_amount', 10, 3)->default(0);
                $table->decimal('net_amount', 10, 3);
                $table->string('sales_person')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // Create expenses table if not exists
        if (!Schema::hasTable('expenses')) {
            Schema::create('expenses', function (Blueprint $table) {
                $table->id();
                $table->date('expense_date');
                $table->string('category');
                $table->decimal('amount', 10, 3);
                $table->text('description');
                $table->string('currency')->default('KWD');
                $table->string('payment_method')->nullable();
                $table->string('vendor')->nullable();
                $table->string('approved_by')->nullable();
                $table->string('receipt_number')->nullable();
                $table->timestamps();
            });
        }

        // Create daily_analytics table if not exists
        if (!Schema::hasTable('daily_analytics')) {
            Schema::create('daily_analytics', function (Blueprint $table) {
                $table->id();
                $table->date('date');
                $table->integer('orders_received')->default(0);
                $table->integer('orders_completed')->default(0);
                $table->decimal('revenue', 12, 3)->default(0);
                $table->decimal('expenses', 12, 3)->default(0);
                $table->integer('active_workers')->default(0);
                $table->integer('production_hours')->default(0);
                $table->integer('efficiency_percentage')->default(0);
                $table->integer('quality_score')->default(0);
                $table->integer('customer_satisfaction')->default(0);
                $table->timestamps();
            });
        }

        // Create attendance table if not exists
        if (!Schema::hasTable('attendance')) {
            Schema::create('attendance', function (Blueprint $table) {
                $table->id();
                $table->string('worker_code');
                $table->date('date');
                $table->timestamp('check_in')->nullable();
                $table->timestamp('check_out')->nullable();
                $table->integer('hours_worked')->default(0);
                $table->string('status')->default('present');
                $table->integer('overtime_hours')->default(0);
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // Create quality_control table if not exists
        if (!Schema::hasTable('quality_control')) {
            Schema::create('quality_control', function (Blueprint $table) {
                $table->id();
                $table->string('order_number');
                $table->string('inspector_name');
                $table->integer('quality_score');
                $table->date('inspection_date');
                $table->boolean('passed')->default(false);
                $table->integer('defects_found')->default(0);
                $table->text('notes')->nullable();
                $table->text('recommendations')->nullable();
                $table->timestamps();
            });
        }

        // Create additional tables for analytics
        if (!Schema::hasTable('monthly_summaries')) {
            Schema::create('monthly_summaries', function (Blueprint $table) {
                $table->id();
                $table->string('month');
                $table->decimal('total_revenue', 12, 3)->default(0);
                $table->decimal('total_expenses', 12, 3)->default(0);
                $table->decimal('net_profit', 12, 3)->default(0);
                $table->integer('orders_completed')->default(0);
                $table->integer('orders_pending')->default(0);
                $table->integer('active_clients')->default(0);
                $table->integer('new_clients')->default(0);
                $table->decimal('worker_efficiency', 5, 2)->default(0);
                $table->decimal('quality_average', 5, 2)->default(0);
                $table->decimal('customer_satisfaction', 5, 2)->default(0);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('annual_targets')) {
            Schema::create('annual_targets', function (Blueprint $table) {
                $table->id();
                $table->integer('year');
                $table->decimal('revenue_target', 12, 3)->default(0);
                $table->integer('orders_target')->default(0);
                $table->decimal('efficiency_target', 5, 2)->default(0);
                $table->decimal('quality_target', 5, 2)->default(0);
                $table->decimal('customer_satisfaction_target', 5, 2)->default(0);
                $table->integer('new_clients_target')->default(0);
                $table->decimal('current_revenue', 12, 3)->default(0);
                $table->integer('current_orders')->default(0);
                $table->decimal('achievement_percentage', 5, 2)->default(0);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('workshop_capacity')) {
            Schema::create('workshop_capacity', function (Blueprint $table) {
                $table->id();
                $table->integer('total_workstations')->default(0);
                $table->integer('active_workstations')->default(0);
                $table->integer('max_daily_orders')->default(0);
                $table->decimal('current_utilization', 5, 2)->default(0);
                $table->integer('peak_season_capacity')->default(0);
                $table->integer('off_season_capacity')->default(0);
                $table->integer('overtime_capacity')->default(0);
                $table->integer('quality_stations')->default(0);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'workshop_capacity',
            'annual_targets', 
            'monthly_summaries',
            'quality_control',
            'attendance',
            'daily_analytics',
            'expenses',
            'sales',
            'loyalty_customers',
            'boutique_products',
            'production_tasks',
            'inventory',
            'orders',
            'workers',
            'clients'
        ];

        foreach ($tables as $table) {
            Schema::dropIfExists($table);
        }
    }
};