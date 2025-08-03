<?php

namespace App\Observers;

use App\Models\WorkshopOrder;
use App\Services\LoyaltyService;
use Illuminate\Support\Facades\Log;

class WorkshopOrderObserver
{
    protected LoyaltyService $loyaltyService;

    public function __construct(LoyaltyService $loyaltyService)
    {
        $this->loyaltyService = $loyaltyService;
    }

    /**
     * Handle the WorkshopOrder "created" event.
     */
    public function created(WorkshopOrder $workshopOrder): void
    {
        // يمكن إضافة منطق هنا عند إنشاء الطلب
    }

    /**
     * Handle the WorkshopOrder "updated" event.
     */
    public function updated(WorkshopOrder $workshopOrder): void
    {
        // معالجة النقاط عند تغيير حالة الطلب إلى "completed" أو "delivered"
        if ($workshopOrder->isDirty('status') && 
            in_array($workshopOrder->status, ['completed', 'delivered']) &&
            config('loyalty.system.auto_process_orders', true)) {
            
            try {
                $result = $this->loyaltyService->processOrderLoyalty($workshopOrder);
                
                if ($result) {
                    Log::info('Loyalty points auto-processed for order', [
                        'order_id' => $workshopOrder->id,
                        'order_number' => $workshopOrder->order_number,
                        'points_earned' => $result['points_earned'],
                        'client_id' => $workshopOrder->client_id
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to auto-process loyalty points for order', [
                    'order_id' => $workshopOrder->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Handle the WorkshopOrder "deleted" event.
     */
    public function deleted(WorkshopOrder $workshopOrder): void
    {
        // يمكن إضافة منطق لإلغاء النقاط عند حذف الطلب
        if ($workshopOrder->client && $workshopOrder->client->loyaltyCustomer) {
            try {
                // البحث عن معاملات الولاء المرتبطة بهذا الطلب
                $transactions = $workshopOrder->client->loyaltyCustomer
                    ->transactions()
                    ->where('workshop_order_id', $workshopOrder->id)
                    ->where('type', 'earned')
                    ->get();

                foreach ($transactions as $transaction) {
                    // إنشاء معاملة عكسية لإلغاء النقاط
                    $workshopOrder->client->loyaltyCustomer->transactions()->create([
                        'client_id' => $workshopOrder->client_id,
                        'type' => 'adjusted',
                        'points' => -$transaction->points,
                        'description' => "إلغاء نقاط طلب محذوف #{$workshopOrder->order_number}",
                        'reference_number' => 'ADJ-' . time() . '-' . mt_rand(1000, 9999),
                        'tier_at_time' => $workshopOrder->client->loyaltyCustomer->tier,
                        'processed_at' => now(),
                    ]);
                }

                // تحديث نقاط العميل
                $totalDeducted = $transactions->sum('points');
                if ($totalDeducted > 0) {
                    $workshopOrder->client->loyaltyCustomer->decrement('total_points', $totalDeducted);
                    $workshopOrder->client->loyaltyCustomer->decrement('available_points', $totalDeducted);
                    $workshopOrder->client->syncLoyaltyPoints();
                }

                Log::info('Loyalty points reversed for deleted order', [
                    'order_id' => $workshopOrder->id,
                    'points_reversed' => $totalDeducted
                ]);

            } catch (\Exception $e) {
                Log::error('Failed to reverse loyalty points for deleted order', [
                    'order_id' => $workshopOrder->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Handle the WorkshopOrder "restored" event.
     */
    public function restored(WorkshopOrder $workshopOrder): void
    {
        // يمكن إضافة منطق لاستعادة النقاط عند استعادة الطلب
    }

    /**
     * Handle the WorkshopOrder "force deleted" event.
     */
    public function forceDeleted(WorkshopOrder $workshopOrder): void
    {
        // نفس منطق الحذف العادي
        $this->deleted($workshopOrder);
    }
}