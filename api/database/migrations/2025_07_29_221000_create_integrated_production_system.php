<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // تحديث جدول المواد لدعم الحجوزات
        Schema::table('materials', function (Blueprint $table) {
            if (!Schema::hasColumn('materials', 'reserved_quantity')) {
                $table->decimal('reserved_quantity', 10, 2)->default(0)->after('quantity');
            }
            if (!Schema::hasColumn('materials', 'minimum_stock')) {
                $table->decimal('minimum_stock', 10, 2)->default(0)->after('reorder_level');
            }
            if (!Schema::hasColumn('materials', 'maximum_stock')) {
                $table->decimal('maximum_stock', 10, 2)->default(0)->after('minimum_stock');
            }
            if (!Schema::hasColumn('materials', 'last_purchase_price')) {
                $table->decimal('last_purchase_price', 10, 2)->nullable()->after('cost_per_unit');
            }
            if (!Schema::hasColumn('materials', 'last_purchase_date')) {
                $table->timestamp('last_purchase_date')->nullable()->after('last_purchase_price');
            }
        });

        // جدول حجوزات المواد
        if (!Schema::hasTable('material_reservations')) {
            Schema::create('material_reservations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained()->onDelete('cascade');
                $table->foreignId('material_id')->constrained();
                $table->decimal('reserved_quantity', 10, 2);
                $table->timestamp('reserved_at');
                $table->timestamp('expires_at')->nullable();
                $table->enum('status', ['active', 'used', 'cancelled', 'expired'])->default('active');
                $table->text('notes')->nullable();
                $table->timestamps();
                
                $table->index(['order_id', 'material_id']);
                $table->index('status');
            });
        }

        // جدول متطلبات المواد للمنتجات
        if (!Schema::hasTable('product_material_requirements')) {
            Schema::create('product_material_requirements', function (Blueprint $table) {
                $table->id();
                $table->string('product_type'); // 'suit', 'dress', 'shirt', etc.
                $table->string('product_size')->nullable(); // 'S', 'M', 'L', 'XL', 'custom'
                $table->foreignId('material_id')->constrained();
                $table->decimal('required_quantity', 10, 2);
                $table->decimal('waste_percentage', 5, 2)->default(10); // نسبة الفاقد
                $table->text('notes')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                $table->index(['product_type', 'product_size']);
            });
        }

        // جدول تقديرات الوقت للمراحل حسب نوع المنتج
        if (!Schema::hasTable('stage_time_estimates')) {
            Schema::create('stage_time_estimates', function (Blueprint $table) {
                $table->id();
                $table->string('product_type');
                $table->string('complexity_level')->default('medium'); // 'simple', 'medium', 'complex'
                $table->foreignId('production_stage_id')->constrained();
                $table->integer('estimated_minutes');
                $table->integer('minimum_minutes');
                $table->integer('maximum_minutes');
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                $table->unique(['product_type', 'complexity_level', 'production_stage_id']);
            });
        }

        // جدول قوائم فحص الجودة
        if (!Schema::hasTable('quality_checklist_templates')) {
            Schema::create('quality_checklist_templates', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('product_type');
                $table->foreignId('production_stage_id')->constrained();
                $table->json('checklist_items'); // قائمة بنود الفحص
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // جدول نتائج فحص الجودة
        if (!Schema::hasTable('quality_check_results')) {
            Schema::create('quality_check_results', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained()->onDelete('cascade');
                $table->foreignId('production_stage_id')->constrained();
                $table->foreignId('checklist_template_id')->constrained('quality_checklist_templates');
                $table->foreignId('inspector_id')->constrained('workers');
                $table->json('check_results'); // نتائج الفحص
                $table->enum('overall_status', ['passed', 'failed', 'needs_rework']);
                $table->text('notes')->nullable();
                $table->timestamp('checked_at');
                $table->timestamps();
            });
        }

        // جدول الإشعارات
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->string('type'); // 'order_update', 'stage_completed', 'material_low', 'quality_issue'
                $table->string('title');
                $table->text('message');
                $table->json('data')->nullable(); // بيانات إضافية
                $table->foreignId('user_id')->nullable()->constrained();
                $table->foreignId('order_id')->nullable()->constrained();
                $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
                
                $table->index(['user_id', 'read_at']);
                $table->index('type');
            });
        }

        // جدول سجل التكاليف التفصيلي
        if (!Schema::hasTable('order_cost_breakdown')) {
            Schema::create('order_cost_breakdown', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained()->onDelete('cascade');
                $table->enum('cost_type', ['material', 'labor', 'overhead', 'other']);
                $table->string('description');
                $table->decimal('amount', 10, 2);
                $table->text('notes')->nullable();
                $table->timestamp('recorded_at');
                $table->timestamps();
                
                $table->index(['order_id', 'cost_type']);
            });
        }

        // جدول تقييم أداء العمال
        if (!Schema::hasTable('worker_performance_logs')) {
            Schema::create('worker_performance_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('worker_id')->constrained();
                $table->foreignId('order_id')->constrained();
                $table->foreignId('production_stage_id')->constrained();
                $table->integer('estimated_minutes');
                $table->integer('actual_minutes');
                $table->decimal('efficiency_score', 5, 2); // نسبة الكفاءة
                $table->integer('quality_score')->nullable(); // من 1 إلى 10
                $table->text('notes')->nullable();
                $table->timestamp('completed_at');
                $table->timestamps();
                
                $table->index(['worker_id', 'completed_at']);
            });
        }

        // جدول تنبيهات النظام
        if (!Schema::hasTable('system_alerts')) {
            Schema::create('system_alerts', function (Blueprint $table) {
                $table->id();
                $table->enum('alert_type', [
                    'material_low_stock',
                    'order_overdue', 
                    'quality_failure',
                    'worker_idle',
                    'equipment_maintenance',
                    'cost_overrun'
                ]);
                $table->string('title');
                $table->text('description');
                $table->json('related_data')->nullable();
                $table->enum('severity', ['info', 'warning', 'error', 'critical']);
                $table->enum('status', ['active', 'acknowledged', 'resolved'])->default('active');
                $table->timestamp('triggered_at');
                $table->timestamp('acknowledged_at')->nullable();
                $table->timestamp('resolved_at')->nullable();
                $table->timestamps();
                
                $table->index(['alert_type', 'status']);
                $table->index('severity');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('system_alerts');
        Schema::dropIfExists('worker_performance_logs');
        Schema::dropIfExists('order_cost_breakdown');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('quality_check_results');
        Schema::dropIfExists('quality_checklist_templates');
        Schema::dropIfExists('stage_time_estimates');
        Schema::dropIfExists('product_material_requirements');
        Schema::dropIfExists('material_reservations');
        
        // إزالة الأعمدة المضافة (اختياري في البيئة التطوير)
        if (Schema::hasTable('materials')) {
            Schema::table('materials', function (Blueprint $table) {
                if (Schema::hasColumn('materials', 'reserved_quantity')) {
                    $table->dropColumn('reserved_quantity');
                }
                if (Schema::hasColumn('materials', 'minimum_stock')) {
                    $table->dropColumn('minimum_stock');
                }
                if (Schema::hasColumn('materials', 'maximum_stock')) {
                    $table->dropColumn('maximum_stock');
                }
                if (Schema::hasColumn('materials', 'last_purchase_price')) {
                    $table->dropColumn('last_purchase_price');
                }
                if (Schema::hasColumn('materials', 'last_purchase_date')) {
                    $table->dropColumn('last_purchase_date');
                }
            });
        }
    }
};
