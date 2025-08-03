<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class LoyaltyCustomer extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'membership_number',
        'name',
        'email',
        'phone',
        'date_of_birth',
        'tier',
        'total_points',
        'available_points',
        'total_spent',
        'total_orders',
        'last_purchase_at',
        'joined_at',
        'is_active',
        'wallet_pass_serial',
        'wallet_auth_token',
        'wallet_last_updated_at',
        'wallet_enabled',
        'points_per_kwd',
        'tier_multiplier',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'total_spent' => 'decimal:3',
        'points_per_kwd' => 'decimal:2',
        'tier_multiplier' => 'decimal:2',
        'last_purchase_at' => 'datetime',
        'joined_at' => 'datetime',
        'wallet_last_updated_at' => 'datetime',
        'is_active' => 'boolean',
        'wallet_enabled' => 'boolean',
    ];

    // العلاقات
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(LoyaltyTransaction::class);
    }

    public function workshopOrders()
    {
        return $this->hasManyThrough(
            WorkshopOrder::class,
            Client::class,
            'id',
            'client_id',
            'client_id',
            'id'
        );
    }

    // الطرق المساعدة

    /**
     * إنشاء رقم عضوية جديد
     */
    public static function generateMembershipNumber(): string
    {
        $lastCustomer = self::latest()->first();
        $lastNumber = $lastCustomer ? intval(substr($lastCustomer->membership_number, 3)) : 0;
        return 'LM-' . str_pad($lastNumber + 1, 6, '0', STR_PAD_LEFT);
    }

    /**
     * كسب نقاط من مبلغ معين
     */
    public function earnPoints(float $amount, string $description = null, ?WorkshopOrder $order = null, ?Sale $sale = null): int
    {
        $basePoints = (int) floor($amount * $this->points_per_kwd);
        $finalPoints = (int) floor($basePoints * $this->tier_multiplier);

        // تحديث النقاط
        $this->increment('total_points', $finalPoints);
        $this->increment('available_points', $finalPoints);
        $this->increment('total_spent', $amount);
        $this->increment('total_orders');
        $this->update(['last_purchase_at' => now()]);

        // إنشاء معاملة
        $this->transactions()->create([
            'client_id' => $this->client_id,
            'workshop_order_id' => $order?->id,
            'sale_id' => $sale?->id,
            'type' => 'earned',
            'points' => $finalPoints,
            'amount' => $amount,
            'description' => $description ?: "نقاط من طلب بقيمة {$amount} KWD",
            'reference_number' => $this->generateReferenceNumber(),
            'tier_at_time' => $this->tier,
            'multiplier_used' => $this->tier_multiplier,
            'expires_at' => now()->addMonths(12), // انتهاء بعد سنة
            'processed_at' => now(),
        ]);

        // تحديث المستوى
        $this->updateTier();

        return $finalPoints;
    }

    /**
     * استخدام النقاط
     */
    public function redeemPoints(int $points, string $description = null): bool
    {
        if ($this->available_points < $points) {
            return false;
        }

        $this->decrement('available_points', $points);

        // إنشاء معاملة الاستخدام
        $this->transactions()->create([
            'client_id' => $this->client_id,
            'type' => 'redeemed',
            'points' => -$points,
            'description' => $description ?: "استخدام {$points} نقطة",
            'reference_number' => $this->generateReferenceNumber(),
            'tier_at_time' => $this->tier,
            'processed_at' => now(),
        ]);

        return true;
    }

    /**
     * تحديث المستوى حسب إجمالي النقاط
     */
    public function updateTier(): void
    {
        $oldTier = $this->tier;
        
        if ($this->total_points >= 10000) {
            $newTier = 'vip';
            $multiplier = 2.0;
        } elseif ($this->total_points >= 5000) {
            $newTier = 'gold';
            $multiplier = 1.5;
        } elseif ($this->total_points >= 1000) {
            $newTier = 'silver';
            $multiplier = 1.25;
        } else {
            $newTier = 'bronze';
            $multiplier = 1.0;
        }

        if ($oldTier !== $newTier) {
            $this->update([
                'tier' => $newTier,
                'tier_multiplier' => $multiplier
            ]);

            // مكافأة ترقية المستوى
            if ($newTier !== 'bronze') {
                $bonusPoints = match($newTier) {
                    'silver' => 100,
                    'gold' => 250,
                    'vip' => 500,
                    default => 0
                };

                if ($bonusPoints > 0) {
                    $this->earnBonusPoints($bonusPoints, "مكافأة ترقية المستوى إلى {$newTier}");
                }
            }
        }
    }

    /**
     * إضافة نقاط مكافأة
     */
    public function earnBonusPoints(int $points, string $description): void
    {
        $this->increment('total_points', $points);
        $this->increment('available_points', $points);

        $this->transactions()->create([
            'client_id' => $this->client_id,
            'type' => 'bonus',
            'points' => $points,
            'description' => $description,
            'reference_number' => $this->generateReferenceNumber(),
            'tier_at_time' => $this->tier,
            'processed_at' => now(),
        ]);
    }

    /**
     * إنشاء رقم مرجعي للمعاملة
     */
    private function generateReferenceNumber(): string
    {
        return 'LTX-' . time() . '-' . mt_rand(1000, 9999);
    }

    /**
     * الحصول على النقاط التي ستنتهي صلاحيتها قريباً
     */
    public function getExpiringPoints(int $days = 30): int
    {
        return $this->transactions()
            ->where('type', 'earned')
            ->where('expires_at', '<=', now()->addDays($days))
            ->where('expires_at', '>', now())
            ->sum('points');
    }

    /**
     * إنتهاء صلاحية النقاط
     */
    public function expirePoints(): int
    {
        $expiredTransactions = $this->transactions()
            ->where('type', 'earned')
            ->where('expires_at', '<=', now())
            ->get();

        $totalExpired = 0;
        foreach ($expiredTransactions as $transaction) {
            $totalExpired += $transaction->points;
            
            // إنشاء معاملة انتهاء صلاحية
            $this->transactions()->create([
                'client_id' => $this->client_id,
                'type' => 'expired',
                'points' => -$transaction->points,
                'description' => "انتهاء صلاحية نقاط من معاملة {$transaction->reference_number}",
                'reference_number' => $this->generateReferenceNumber(),
                'tier_at_time' => $this->tier,
                'processed_at' => now(),
            ]);
        }

        if ($totalExpired > 0) {
            $this->decrement('available_points', $totalExpired);
        }

        return $totalExpired;
    }

    /**
     * الحصول على معلومات مفصلة للعميل
     */
    public function getCustomerInfo(): array
    {
        return [
            'membership_number' => $this->membership_number,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'tier' => $this->tier,
            'tier_name' => $this->getTierName(),
            'tier_color' => $this->getTierColor(),
            'total_points' => $this->total_points,
            'available_points' => $this->available_points,
            'total_spent' => $this->total_spent,
            'total_orders' => $this->total_orders,
            'member_since' => $this->joined_at?->format('Y-m-d'),
            'last_purchase' => $this->last_purchase_at?->format('Y-m-d'),
            'expiring_points' => $this->getExpiringPoints(),
            'next_tier' => $this->getNextTier(),
            'points_to_next_tier' => $this->getPointsToNextTier(),
        ];
    }

    /**
     * اسم المستوى
     */
    public function getTierName(): string
    {
        return match($this->tier) {
            'bronze' => 'برونزي',
            'silver' => 'فضي',
            'gold' => 'ذهبي',
            'vip' => 'VIP',
            default => 'غير محدد'
        };
    }

    /**
     * لون المستوى
     */
    public function getTierColor(): string
    {
        return match($this->tier) {
            'bronze' => '#CD7F32',
            'silver' => '#C0C0C0',
            'gold' => '#FFD700',
            'vip' => '#9B59B6',
            default => '#6B7280'
        };
    }

    /**
     * المستوى التالي
     */
    public function getNextTier(): ?string
    {
        return match($this->tier) {
            'bronze' => 'silver',
            'silver' => 'gold',
            'gold' => 'vip',
            'vip' => null,
            default => null
        };
    }

    /**
     * النقاط المطلوبة للمستوى التالي
     */
    public function getPointsToNextTier(): int
    {
        $required = match($this->tier) {
            'bronze' => 1000,
            'silver' => 5000,
            'gold' => 10000,
            'vip' => 0,
            default => 0
        };

        return max(0, $required - $this->total_points);
    }

    // Scopes للاستعلامات

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByTier($query, string $tier)
    {
        return $query->where('tier', $tier);
    }

    public function scopeWithExpiredPoints($query, int $days = 30)
    {
        return $query->whereHas('transactions', function($q) use ($days) {
            $q->where('type', 'earned')
              ->where('expires_at', '<=', now()->addDays($days))
              ->where('expires_at', '>', now());
        });
    }
}