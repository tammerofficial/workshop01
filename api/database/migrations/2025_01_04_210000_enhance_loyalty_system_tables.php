<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // تحسين جدول نقاط الولاء الموجود
        if (Schema::hasTable('loyalty_points')) {
            Schema::table('loyalty_points', function (Blueprint $table) {
                if (!Schema::hasColumn('loyalty_points', 'source_type')) {
                    $table->string('source_type')->default('purchase'); // purchase, referral, bonus, custom_order, etc.
                }
                if (!Schema::hasColumn('loyalty_points', 'source_id')) {
                    $table->unsignedBigInteger('source_id')->nullable(); // transaction_id, custom_order_id, etc.
                }
                if (!Schema::hasColumn('loyalty_points', 'expiry_date')) {
                    $table->date('expiry_date')->nullable();
                }
                if (!Schema::hasColumn('loyalty_points', 'is_expired')) {
                    $table->boolean('is_expired')->default(false);
                }
                if (!Schema::hasColumn('loyalty_points', 'notes')) {
                    $table->text('notes')->nullable();
                }
                if (!Schema::hasColumn('loyalty_points', 'multiplier')) {
                    $table->decimal('multiplier', 3, 2)->default(1.00); // bonus multiplier
                }
            });
        }

        // جدول برامج الولاء المتقدمة
        Schema::create('loyalty_programs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->enum('type', ['points', 'cashback', 'discount', 'tier']);
            $table->json('rules'); // program rules and conditions
            $table->decimal('points_per_currency', 5, 2)->default(1.00); // points per 1 KWD spent
            $table->decimal('currency_per_point', 8, 4)->default(0.001); // KWD value per 1 point
            $table->integer('min_points_redemption')->default(100);
            $table->integer('max_points_redemption')->nullable();
            $table->integer('points_expiry_days')->default(365);
            $table->boolean('is_active')->default(true);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->json('applicable_categories')->nullable(); // which product categories
            $table->json('applicable_channels')->nullable(); // POS, ecommerce, workshop
            $table->decimal('min_purchase_amount', 10, 3)->default(0);
            $table->decimal('max_purchase_amount', 10, 3)->nullable();
            $table->timestamps();
            
            $table->index(['is_active', 'start_date', 'end_date']);
        });

        // جدول مستويات الولاء (Tiers)
        Schema::create('loyalty_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->integer('level'); // 1=Bronze, 2=Silver, 3=Gold, 4=Platinum, 5=VIP
            $table->decimal('min_spending_amount', 10, 3); // minimum spending to reach this tier
            $table->decimal('points_multiplier', 3, 2)->default(1.00); // bonus multiplier for this tier
            $table->json('benefits'); // list of benefits for this tier
            $table->json('perks')->nullable(); // special perks (free shipping, early access, etc.)
            $table->string('badge_color')->default('#808080'); // color for badges
            $table->string('badge_icon')->nullable(); // icon for tier
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique('level');
            $table->index('min_spending_amount');
        });

        // جدول ربط العملاء بمستويات الولاء
        Schema::create('customer_loyalty_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('loyalty_tier_id')->constrained()->onDelete('cascade');
            $table->decimal('total_spending', 10, 3)->default(0);
            $table->decimal('current_year_spending', 10, 3)->default(0);
            $table->date('tier_achieved_date');
            $table->date('tier_expires_date')->nullable();
            $table->boolean('is_current')->default(true);
            $table->timestamps();
            
            $table->index(['customer_id', 'is_current']);
        });

        // جدول استبدال النقاط
        Schema::create('loyalty_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->enum('redemption_type', ['discount', 'cashback', 'product', 'service', 'custom']);
            $table->integer('points_used');
            $table->decimal('value_redeemed', 10, 3); // monetary value
            $table->string('reference_type')->nullable(); // order, transaction, etc.
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('description');
            $table->text('description_ar')->nullable();
            $table->enum('status', ['pending', 'approved', 'completed', 'cancelled'])->default('pending');
            $table->foreignId('processed_by')->nullable()->constrained('users');
            $table->timestamp('processed_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('redemption_details')->nullable(); // additional details
            $table->timestamps();
            
            $table->index(['customer_id', 'status']);
            $table->index(['redemption_type', 'status']);
        });

        // جدول حملات الولاء والعروض الخاصة
        Schema::create('loyalty_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->enum('type', ['bonus_points', 'double_points', 'cashback', 'free_shipping', 'early_access']);
            $table->json('conditions'); // campaign conditions
            $table->json('rewards'); // what customers get
            $table->json('target_tiers')->nullable(); // which tiers are eligible
            $table->json('target_categories')->nullable(); // which product categories
            $table->json('target_channels')->nullable(); // which sales channels
            $table->decimal('min_purchase_amount', 10, 3)->default(0);
            $table->integer('max_uses_per_customer')->nullable();
            $table->integer('total_uses_limit')->nullable();
            $table->integer('current_uses')->default(0);
            $table->boolean('is_active')->default(true);
            $table->datetime('start_date');
            $table->datetime('end_date');
            $table->string('promo_code')->nullable()->unique();
            $table->timestamps();
            
            $table->index(['is_active', 'start_date', 'end_date']);
            $table->index('promo_code');
        });

        // جدول استخدام حملات الولاء
        Schema::create('loyalty_campaign_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loyalty_campaign_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->string('reference_type'); // order, transaction
            $table->unsignedBigInteger('reference_id');
            $table->integer('points_earned')->default(0);
            $table->decimal('discount_amount', 10, 3)->default(0);
            $table->json('campaign_details')->nullable();
            $table->timestamps();
            
            $table->unique(['loyalty_campaign_id', 'customer_id', 'reference_type', 'reference_id'], 'unique_campaign_usage');
        });

        // جدول بطاقات الولاء الرقمية (Apple Wallet, Google Pay)
        Schema::create('digital_loyalty_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->string('card_type'); // apple_wallet, google_pay
            $table->string('card_identifier')->unique(); // unique identifier for the card
            $table->string('pass_type_identifier'); // for Apple Wallet
            $table->string('serial_number')->unique();
            $table->json('card_data'); // card design and data
            $table->json('locations')->nullable(); // where card can be used
            $table->boolean('is_active')->default(true);
            $table->timestamp('issued_at');
            $table->timestamp('last_updated_at')->nullable();
            $table->timestamps();
            
            $table->index(['customer_id', 'card_type']);
            $table->index('serial_number');
        });

        // جدول تحديثات البطاقات الرقمية
        Schema::create('digital_card_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('digital_loyalty_card_id')->constrained()->onDelete('cascade');
            $table->enum('update_type', ['points_update', 'tier_change', 'offer_notification', 'general_update']);
            $table->json('update_data');
            $table->boolean('is_sent')->default(false);
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamps();
        });

        // جدول تحليلات الولاء
        Schema::create('loyalty_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('analytics_date');
            $table->integer('total_active_customers');
            $table->integer('new_customers_joined');
            $table->integer('total_points_earned');
            $table->integer('total_points_redeemed');
            $table->decimal('total_value_redeemed', 10, 3);
            $table->decimal('average_points_per_customer', 8, 2);
            $table->json('tier_distribution'); // how many customers in each tier
            $table->json('channel_performance'); // points earned per channel
            $table->json('campaign_performance')->nullable(); // active campaigns performance
            $table->timestamps();
            
            $table->unique('analytics_date');
        });
    }

    public function down()
    {
        Schema::dropIfExists('loyalty_analytics');
        Schema::dropIfExists('digital_card_updates');
        Schema::dropIfExists('digital_loyalty_cards');
        Schema::dropIfExists('loyalty_campaign_usage');
        Schema::dropIfExists('loyalty_campaigns');
        Schema::dropIfExists('loyalty_redemptions');
        Schema::dropIfExists('customer_loyalty_tiers');
        Schema::dropIfExists('loyalty_tiers');
        Schema::dropIfExists('loyalty_programs');
        
        // Remove added columns from existing table
        if (Schema::hasTable('loyalty_points')) {
            Schema::table('loyalty_points', function (Blueprint $table) {
                $table->dropColumn(['source_type', 'source_id', 'expiry_date', 'is_expired', 'notes', 'multiplier']);
            });
        }
    }
};