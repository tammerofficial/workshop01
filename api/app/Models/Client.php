<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'notes',
        'woocommerce_id',
        'loyalty_customer_id',
        'loyalty_tier',
        'loyalty_points',
        'available_loyalty_points',
        'loyalty_enabled',
        'loyalty_joined_at',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function measurements()
    {
        return $this->hasMany(Measurement::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function loyaltyCustomer()
    {
        return $this->hasOne(LoyaltyCustomer::class);
    }

    public function loyaltyTransactions()
    {
        return $this->hasMany(LoyaltyTransaction::class);
    }

    public function workshopOrders()
    {
        return $this->hasMany(WorkshopOrder::class);
    }

    public function sales()
    {
        return $this->hasManyThrough(Sale::class, Order::class);
    }

    // Casts for loyalty fields
    protected $casts = [
        'loyalty_enabled' => 'boolean',
        'loyalty_joined_at' => 'datetime',
    ];

    // Helper methods for loyalty
    public function hasLoyaltyAccount(): bool
    {
        return $this->loyalty_enabled && $this->loyalty_customer_id !== null;
    }

    public function getLoyaltyTierName(): string
    {
        return match($this->loyalty_tier) {
            'bronze' => 'برونزي',
            'silver' => 'فضي',
            'gold' => 'ذهبي',
            'vip' => 'VIP',
            default => 'غير محدد'
        };
    }

    public function getLoyaltyTierColor(): string
    {
        return match($this->loyalty_tier) {
            'bronze' => '#CD7F32',
            'silver' => '#C0C0C0',
            'gold' => '#FFD700',
            'vip' => '#9B59B6',
            default => '#6B7280'
        };
    }

    /**
     * إنشاء حساب ولاء للعميل
     */
    public function createLoyaltyAccount(): ?LoyaltyCustomer
    {
        if ($this->hasLoyaltyAccount()) {
            return $this->loyaltyCustomer;
        }

        $loyaltyCustomer = LoyaltyCustomer::create([
            'client_id' => $this->id,
            'membership_number' => LoyaltyCustomer::generateMembershipNumber(),
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'tier' => 'bronze',
            'tier_multiplier' => 1.0,
            'points_per_kwd' => 1.0,
            'joined_at' => now(),
        ]);

        $this->update([
            'loyalty_customer_id' => $loyaltyCustomer->id,
            'loyalty_tier' => 'bronze',
            'loyalty_enabled' => true,
            'loyalty_joined_at' => now(),
        ]);

        return $loyaltyCustomer;
    }

    /**
     * مزامنة نقاط الولاء من LoyaltyCustomer
     */
    public function syncLoyaltyPoints(): void
    {
        if ($this->loyaltyCustomer) {
            $this->update([
                'loyalty_tier' => $this->loyaltyCustomer->tier,
                'loyalty_points' => $this->loyaltyCustomer->total_points,
                'available_loyalty_points' => $this->loyaltyCustomer->available_points,
            ]);
        }
    }
} 