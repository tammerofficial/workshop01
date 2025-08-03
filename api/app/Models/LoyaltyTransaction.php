<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoyaltyTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'loyalty_customer_id',
        'client_id',
        'workshop_order_id',
        'sale_id',
        'type',
        'points',
        'amount',
        'currency',
        'description',
        'reference_number',
        'tier_at_time',
        'multiplier_used',
        'metadata',
        'expires_at',
        'processed_at',
        'is_processed',
    ];

    protected $casts = [
        'amount' => 'decimal:3',
        'multiplier_used' => 'decimal:2',
        'metadata' => 'array',
        'expires_at' => 'datetime',
        'processed_at' => 'datetime',
        'is_processed' => 'boolean',
    ];

    // العلاقات
    public function loyaltyCustomer(): BelongsTo
    {
        return $this->belongsTo(LoyaltyCustomer::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function workshopOrder(): BelongsTo
    {
        return $this->belongsTo(WorkshopOrder::class);
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    // Scopes
    public function scopeEarned($query)
    {
        return $query->where('type', 'earned');
    }

    public function scopeRedeemed($query)
    {
        return $query->where('type', 'redeemed');
    }

    public function scopeExpired($query)
    {
        return $query->where('type', 'expired');
    }

    public function scopeBonus($query)
    {
        return $query->where('type', 'bonus');
    }

    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now())
                    ->orWhereNull('expires_at');
    }

    public function scopeProcessed($query)
    {
        return $query->where('is_processed', true);
    }

    // Helper methods
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function getTypeLabel(): string
    {
        return match($this->type) {
            'earned' => 'نقاط مكتسبة',
            'redeemed' => 'نقاط مستخدمة',
            'expired' => 'نقاط منتهية الصلاحية',
            'adjusted' => 'تعديل النقاط',
            'bonus' => 'نقاط مكافأة',
            default => 'غير محدد'
        };
    }

    public function getFormattedAmount(): string
    {
        if ($this->amount) {
            return number_format((float)$this->amount, 3) . ' ' . $this->currency;
        }
        return '';
    }

    public function getFormattedPoints(): string
    {
        $prefix = $this->points > 0 ? '+' : '';
        return $prefix . number_format((float)$this->points) . ' نقطة';
    }
}