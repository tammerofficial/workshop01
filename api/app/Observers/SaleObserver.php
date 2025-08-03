<?php

namespace App\Observers;

use App\Models\Sale;
use App\Services\LoyaltyService;
use Illuminate\Support\Facades\Log;

class SaleObserver
{
    protected LoyaltyService $loyaltyService;

    public function __construct(LoyaltyService $loyaltyService)
    {
        $this->loyaltyService = $loyaltyService;
    }

    /**
     * Handle the Sale "created" event.
     */
    public function created(Sale $sale): void
    {
        // معالجة النقاط تلقائياً عند إنشاء مبيعة جديدة
        if ($sale->status === 'completed' && 
            config('loyalty.system.auto_process_orders', true)) {
            
            try {
                $result = $this->loyaltyService->processSaleLoyalty($sale);
                
                if ($result) {
                    Log::info('Loyalty points auto-processed for sale', [
                        'sale_id' => $sale->id,
                        'sale_number' => $sale->sale_number,
                        'points_earned' => $result['points_earned'],
                        'client_id' => $sale->client_id
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to auto-process loyalty points for sale', [
                    'sale_id' => $sale->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Handle the Sale "updated" event.
     */
    public function updated(Sale $sale): void
    {
        // معالجة النقاط عند تغيير حالة المبيعة إلى "completed"
        if ($sale->isDirty('status') && 
            $sale->status === 'completed' &&
            $sale->getOriginal('status') !== 'completed' &&
            config('loyalty.system.auto_process_orders', true)) {
            
            try {
                $result = $this->loyaltyService->processSaleLoyalty($sale);
                
                if ($result) {
                    Log::info('Loyalty points auto-processed for updated sale', [
                        'sale_id' => $sale->id,
                        'sale_number' => $sale->sale_number,
                        'points_earned' => $result['points_earned'],
                        'client_id' => $sale->client_id
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to auto-process loyalty points for updated sale', [
                    'sale_id' => $sale->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // إلغاء النقاط عند تغيير حالة المبيعة إلى "refunded" أو "cancelled"
        if ($sale->isDirty('status') && 
            in_array($sale->status, ['refunded', 'cancelled']) &&
            in_array($sale->getOriginal('status'), ['completed'])) {
            
            try {
                $this->reverseSaleLoyaltyPoints($sale);
            } catch (\Exception $e) {
                Log::error('Failed to reverse loyalty points for refunded/cancelled sale', [
                    'sale_id' => $sale->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Handle the Sale "deleted" event.
     */
    public function deleted(Sale $sale): void
    {
        if ($sale->client && $sale->client->loyaltyCustomer) {
            try {
                $this->reverseSaleLoyaltyPoints($sale);
            } catch (\Exception $e) {
                Log::error('Failed to reverse loyalty points for deleted sale', [
                    'sale_id' => $sale->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    /**
     * عكس نقاط الولاء للمبيعة
     */
    protected function reverseSaleLoyaltyPoints(Sale $sale): void
    {
        if (!$sale->client || !$sale->client->loyaltyCustomer) {
            return;
        }

        // البحث عن معاملات الولاء المرتبطة بهذه المبيعة
        $transactions = $sale->client->loyaltyCustomer
            ->transactions()
            ->where('sale_id', $sale->id)
            ->where('type', 'earned')
            ->get();

        foreach ($transactions as $transaction) {
            // إنشاء معاملة عكسية لإلغاء النقاط
            $sale->client->loyaltyCustomer->transactions()->create([
                'client_id' => $sale->client_id,
                'sale_id' => $sale->id,
                'type' => 'adjusted',
                'points' => -$transaction->points,
                'description' => "إلغاء نقاط مبيعة #{$sale->sale_number} - " . 
                                ($sale->status === 'refunded' ? 'مسترد' : 
                                ($sale->status === 'cancelled' ? 'ملغي' : 'محذوف')),
                'reference_number' => 'ADJ-' . time() . '-' . mt_rand(1000, 9999),
                'tier_at_time' => $sale->client->loyaltyCustomer->tier,
                'processed_at' => now(),
            ]);
        }

        // تحديث نقاط العميل
        $totalDeducted = $transactions->sum('points');
        if ($totalDeducted > 0) {
            $sale->client->loyaltyCustomer->decrement('total_points', $totalDeducted);
            $sale->client->loyaltyCustomer->decrement('available_points', $totalDeducted);
            $sale->client->syncLoyaltyPoints();
        }

        Log::info('Loyalty points reversed for sale', [
            'sale_id' => $sale->id,
            'sale_number' => $sale->sale_number,
            'points_reversed' => $totalDeducted,
            'reason' => $sale->status
        ]);
    }

    /**
     * Handle the Sale "restored" event.
     */
    public function restored(Sale $sale): void
    {
        // يمكن إضافة منطق لاستعادة النقاط عند استعادة المبيعة
        if ($sale->status === 'completed' && 
            config('loyalty.system.auto_process_orders', true)) {
            
            try {
                $result = $this->loyaltyService->processSaleLoyalty($sale);
                
                if ($result) {
                    Log::info('Loyalty points restored for sale', [
                        'sale_id' => $sale->id,
                        'points_earned' => $result['points_earned']
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to restore loyalty points for sale', [
                    'sale_id' => $sale->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Handle the Sale "force deleted" event.
     */
    public function forceDeleted(Sale $sale): void
    {
        $this->deleted($sale);
    }
}