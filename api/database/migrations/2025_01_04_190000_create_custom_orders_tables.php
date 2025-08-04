<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // جدول الطلبات المخصصة
        Schema::create('custom_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->constrained('users');
            $table->foreignId('product_id')->nullable()->constrained(); // base product if any
            $table->string('product_type'); // shirt, dress, suit, etc.
            $table->string('fabric_type')->nullable();
            $table->string('fabric_color')->nullable();
            $table->json('measurements'); // customer measurements
            $table->json('design_specifications'); // design details
            $table->json('custom_features')->nullable(); // buttons, pockets, etc.
            $table->text('special_instructions')->nullable();
            $table->json('reference_images')->nullable(); // uploaded images
            $table->decimal('quoted_price', 10, 3)->nullable();
            $table->decimal('final_price', 10, 3)->nullable();
            $table->date('estimated_completion_date')->nullable();
            $table->date('promised_delivery_date')->nullable();
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->enum('status', [
                'pending_quote', 'quoted', 'confirmed', 'in_production', 
                'quality_check', 'completed', 'delivered', 'cancelled'
            ])->default('pending_quote');
            $table->foreignId('assigned_to')->nullable()->constrained('users'); // assigned worker
            $table->foreignId('created_by')->constrained('users');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'created_at']);
            $table->index(['assigned_to', 'status']);
            $table->index('customer_id');
        });

        // جدول قياسات العملاء
        Schema::create('customer_measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users');
            $table->string('measurement_type'); // shirt, trouser, dress, etc.
            $table->json('measurements'); // all measurements for this type
            $table->boolean('is_default')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['customer_id', 'measurement_type']);
        });

        // جدول مراحل الإنتاج
        Schema::create('production_stages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->text('description')->nullable();
            $table->integer('order_sequence'); // order of stages
            $table->integer('estimated_duration_hours')->default(24);
            $table->boolean('requires_approval')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('order_sequence');
        });

        // جدول تقدم الإنتاج
        Schema::create('production_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('production_stage_id')->constrained();
            $table->enum('status', ['pending', 'in_progress', 'completed', 'on_hold', 'skipped'])->default('pending');
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('actual_duration_minutes')->nullable();
            $table->text('notes')->nullable();
            $table->json('progress_images')->nullable(); // work in progress images
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            
            $table->unique(['custom_order_id', 'production_stage_id']);
            $table->index(['status', 'assigned_to']);
        });

        // جدول قوالب التصميم
        Schema::create('design_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->string('category'); // shirt, dress, suit, etc.
            $table->text('description')->nullable();
            $table->json('default_measurements'); // standard measurements
            $table->json('customizable_features'); // what can be customized
            $table->json('design_specifications'); // default design specs
            $table->decimal('base_price', 10, 3);
            $table->json('images')->nullable(); // template images
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['category', 'is_active']);
        });

        // جدول تقييم جودة المنتجات المخصصة
        Schema::create('quality_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('checked_by')->constrained('users');
            $table->json('check_points'); // list of quality points checked
            $table->enum('overall_status', ['passed', 'failed', 'needs_rework'])->default('passed');
            $table->text('issues_found')->nullable();
            $table->text('corrective_actions')->nullable();
            $table->json('quality_images')->nullable(); // images of quality issues
            $table->timestamp('checked_at');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        // جدول تتبع المواد المستخدمة
        Schema::create('material_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained(); // material/fabric used
            $table->decimal('quantity_used', 8, 3);
            $table->string('unit'); // meter, piece, etc.
            $table->decimal('cost_per_unit', 10, 3);
            $table->decimal('total_cost', 10, 3);
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->constrained('users');
            $table->timestamps();
        });

        // جدول الاتصالات مع العملاء
        Schema::create('customer_communications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_order_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['call', 'sms', 'email', 'whatsapp', 'visit']);
            $table->text('subject')->nullable();
            $table->text('content');
            $table->enum('direction', ['outgoing', 'incoming']);
            $table->foreignId('handled_by')->constrained('users');
            $table->json('attachments')->nullable();
            $table->boolean('requires_followup')->default(false);
            $table->date('followup_date')->nullable();
            $table->timestamps();
            
            $table->index(['custom_order_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('customer_communications');
        Schema::dropIfExists('material_usage');
        Schema::dropIfExists('quality_checks');
        Schema::dropIfExists('design_templates');
        Schema::dropIfExists('production_progress');
        Schema::dropIfExists('production_stages');
        Schema::dropIfExists('customer_measurements');
        Schema::dropIfExists('custom_orders');
    }
};