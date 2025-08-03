<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\LoyaltyService;
use App\Models\WorkshopOrder;
use App\Models\Sale;
use App\Models\LoyaltyCustomer;

class ProcessLoyaltyPoints extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'loyalty:process-points 
                           {--expire : Process point expiration}
                           {--orders : Process pending orders}
                           {--sales : Process pending sales}
                           {--reminders : Send expiry reminders}
                           {--all : Process all tasks}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process loyalty points for orders, sales, and handle expiration';

    protected LoyaltyService $loyaltyService;

    public function __construct(LoyaltyService $loyaltyService)
    {
        parent::__construct();
        $this->loyaltyService = $loyaltyService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🎯 بدء معالجة نظام الولاء...');

        if ($this->option('all')) {
            $this->processAll();
        } else {
            if ($this->option('orders')) {
                $this->processPendingOrders();
            }

            if ($this->option('sales')) {
                $this->processPendingSales();
            }

            if ($this->option('expire')) {
                $this->processPointExpiration();
            }

            if ($this->option('reminders')) {
                $this->sendExpiryReminders();
            }
        }

        $this->info('✅ تم الانتهاء من معالجة نظام الولاء');
    }

    protected function processAll()
    {
        $this->processPendingOrders();
        $this->processPendingSales();
        $this->processPointExpiration();
        $this->sendExpiryReminders();
    }

    protected function processPendingOrders()
    {
        $this->info('📋 معالجة الطلبات المعلقة...');

        // البحث عن طلبات مكتملة لم تتم معالجة نقاطها
        $completedOrders = WorkshopOrder::with('client.loyaltyCustomer')
            ->whereIn('status', ['completed', 'delivered'])
            ->whereDoesntHave('client.loyaltyTransactions', function($query) {
                $query->where('workshop_order_id', '!=', null)
                      ->where('type', 'earned');
            })
            ->where('client_id', '!=', null)
            ->get();

        $processed = 0;
        $errors = 0;

        foreach ($completedOrders as $order) {
            if (!$order->client || !$order->client->loyalty_enabled) {
                continue;
            }

            try {
                $result = $this->loyaltyService->processOrderLoyalty($order);
                if ($result) {
                    $processed++;
                    $this->line("  ✓ تم معالجة طلب #{$order->order_number} - {$result['points_earned']} نقطة");
                }
            } catch (\Exception $e) {
                $errors++;
                $this->error("  ✗ خطأ في طلب #{$order->order_number}: {$e->getMessage()}");
            }
        }

        $this->info("📊 تم معالجة {$processed} طلب، {$errors} خطأ");
    }

    protected function processPendingSales()
    {
        $this->info('💰 معالجة المبيعات المعلقة...');

        // البحث عن مبيعات مكتملة لم تتم معالجة نقاطها
        $completedSales = Sale::with('client.loyaltyCustomer')
            ->where('status', 'completed')
            ->whereDoesntHave('client.loyaltyTransactions', function($query) {
                $query->where('sale_id', '!=', null)
                      ->where('type', 'earned');
            })
            ->where('client_id', '!=', null)
            ->get();

        $processed = 0;
        $errors = 0;

        foreach ($completedSales as $sale) {
            if (!$sale->client || !$sale->client->loyalty_enabled) {
                continue;
            }

            try {
                $result = $this->loyaltyService->processSaleLoyalty($sale);
                if ($result) {
                    $processed++;
                    $this->line("  ✓ تم معالجة مبيعة #{$sale->sale_number} - {$result['points_earned']} نقطة");
                }
            } catch (\Exception $e) {
                $errors++;
                $this->error("  ✗ خطأ في مبيعة #{$sale->sale_number}: {$e->getMessage()}");
            }
        }

        $this->info("📊 تم معالجة {$processed} مبيعة، {$errors} خطأ");
    }

    protected function processPointExpiration()
    {
        $this->info('⏰ معالجة انتهاء صلاحية النقاط...');

        try {
            $results = $this->loyaltyService->expirePoints();
            
            $totalCustomers = count($results);
            $totalExpiredPoints = collect($results)->sum('expired_points');

            $this->info("📊 تم معالجة {$totalCustomers} عميل");
            $this->info("📊 انتهت صلاحية {$totalExpiredPoints} نقطة");

            foreach ($results as $result) {
                $this->line("  ✓ {$result['membership_number']}: {$result['expired_points']} نقطة منتهية");
            }

        } catch (\Exception $e) {
            $this->error("✗ خطأ في معالجة انتهاء الصلاحية: {$e->getMessage()}");
        }
    }

    protected function sendExpiryReminders()
    {
        $this->info('📢 إرسال تذكيرات انتهاء الصلاحية...');

        try {
            $reminders = $this->loyaltyService->sendExpiryReminders(30);
            
            $this->info("📊 تم إرسال {count($reminders)} تذكير");

            foreach ($reminders as $reminder) {
                $this->line("  ✓ {$reminder['name']}: {$reminder['expiring_points']} نقطة تنتهي خلال {$reminder['days_remaining']} يوم");
            }

        } catch (\Exception $e) {
            $this->error("✗ خطأ في إرسال التذكيرات: {$e->getMessage()}");
        }
    }
}