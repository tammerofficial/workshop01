<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Boutique extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'location',
        'address',
        'phone',
        'email',
        'manager_id',
        'business_hours',
        'is_active',
        'loyalty_enabled',
        'pos_enabled',
        'default_points_per_kwd',
        'tier_multiplier',
        'total_sales_count',
        'total_sales_amount',
        'monthly_sales_amount',
    ];

    protected $casts = [
        'business_hours' => 'array',
        'is_active' => 'boolean',
        'loyalty_enabled' => 'boolean',
        'pos_enabled' => 'boolean',
        'default_points_per_kwd' => 'decimal:2',
        'tier_multiplier' => 'decimal:2',
        'total_sales_amount' => 'decimal:3',
        'monthly_sales_amount' => 'decimal:3',
    ];

    // ================== علاقات النموذج ==================

    /**
     * مدير البوتيك
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * مبيعات البوتيك
     */
    public function sales(): HasMany
    {
        return $this->hasMany(BoutiqueSale::class);
    }

    /**
     * موظفي البوتيك (المستخدمين المرتبطين بهذا البوتيك)
     */
    public function staff(): HasMany
    {
        return $this->hasMany(User::class, 'boutique_id');
    }

    // ================== نطاقات الاستعلام ==================

    /**
     * البوتيكات النشطة فقط
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * البوتيكات التي تدعم نظام الولاء
     */
    public function scopeLoyaltyEnabled(Builder $query): Builder
    {
        return $query->where('loyalty_enabled', true);
    }

    /**
     * البوتيكات التي تدعم نقاط البيع
     */
    public function scopePosEnabled(Builder $query): Builder
    {
        return $query->where('pos_enabled', true);
    }

    /**
     * البوتيكات التي يمكن للمستخدم الوصول إليها حسب الصلاحيات
     */
    public function scopeAccessibleByUser(Builder $query, User $user): Builder
    {
        // إذا كان المستخدم مدير عام، يمكنه الوصول لجميع البوتيكات
        if ($user->hasAnyRole(['super_admin', 'boutique_regional_manager'])) {
            return $query;
        }
        
        // إذا كان مدير بوتيك، يمكنه الوصول للبوتيك الخاص به فقط
        if ($user->hasRole('boutique_manager')) {
            return $query->where('manager_id', $user->id);
        }
        
        // إذا كان موظف بوتيك، يمكنه الوصول للبوتيك الذي يعمل به
        if ($user->boutique_id) {
            return $query->where('id', $user->boutique_id);
        }
        
        // أي مستخدم آخر لا يمكنه الوصول لأي بوتيك
        return $query->whereRaw('1 = 0');
    }

    // ================== الطرق المساعدة ==================

    /**
     * التحقق من قدرة المستخدم على إدارة هذا البوتيك
     */
    public function canBeAccessedBy(User $user): bool
    {
        // مدير النظام يمكنه الوصول لجميع البوتيكات
        if ($user->hasAnyRole(['super_admin', 'boutique_regional_manager'])) {
            return true;
        }
        
        // مدير البوتيك يمكنه الوصول لبوتيكه فقط
        if ($user->hasRole('boutique_manager') && $this->manager_id === $user->id) {
            return true;
        }
        
        // موظف البوتيك يمكنه الوصول للبوتيك الذي يعمل به
        if ($user->boutique_id === $this->id) {
            return true;
        }
        
        return false;
    }

    /**
     * التحقق من قدرة المستخدم على تعديل هذا البوتيك
     */
    public function canBeEditedBy(User $user): bool
    {
        // يحتاج صلاحية إدارة البوتيك
        if (!$user->hasPermission('boutique.manage') && !$user->hasPermission('boutique.edit')) {
            return false;
        }
        
        return $this->canBeAccessedBy($user);
    }

    /**
     * حساب إجمالي المبيعات لفترة معينة
     */
    public function calculateSalesForPeriod($startDate = null, $endDate = null): array
    {
        $query = $this->sales()->where('status', 'completed');
        
        if ($startDate) {
            $query->where('sale_date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('sale_date', '<=', $endDate);
        }
        
        return [
            'total_amount' => $query->sum('total_amount'),
            'total_count' => $query->count(),
            'average_sale' => $query->avg('total_amount'),
            'loyalty_sales' => $query->where('is_loyalty_transaction', true)->sum('total_amount'),
        ];
    }

    /**
     * تحديث إحصائيات البوتيك
     */
    public function updateStatistics(): void
    {
        $totalSales = $this->sales()->where('status', 'completed')->sum('total_amount');
        $totalCount = $this->sales()->where('status', 'completed')->count();
        $monthlySales = $this->sales()
            ->where('status', 'completed')
            ->whereBetween('sale_date', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('total_amount');
        
        $this->update([
            'total_sales_amount' => $totalSales,
            'total_sales_count' => $totalCount,
            'monthly_sales_amount' => $monthlySales,
        ]);
    }

    /**
     * الحصول على ساعات العمل لليوم المحدد
     */
    public function getBusinessHoursForDay(string $day): ?array
    {
        return $this->business_hours[$day] ?? null;
    }

    /**
     * التحقق من كون البوتيك مفتوح حالياً
     */
    public function isOpenNow(): bool
    {
        if (!$this->is_active) {
            return false;
        }
        
        $dayName = strtolower(now()->format('l'));
        $todayHours = $this->getBusinessHoursForDay($dayName);
        
        if (!$todayHours || !isset($todayHours['open']) || !isset($todayHours['close'])) {
            return false;
        }
        
        $currentTime = now()->format('H:i');
        return $currentTime >= $todayHours['open'] && $currentTime <= $todayHours['close'];
    }

    // ================== أحداث النموذج ==================

    protected static function booted(): void
    {
        // إنشاء كود تلقائي عند الإنشاء
        static::creating(function (Boutique $boutique) {
            if (!$boutique->code) {
                $boutique->code = 'BTQ-' . strtoupper(uniqid());
            }
        });
        
        // تحديث الإحصائيات عند التحديث
        static::updated(function (Boutique $boutique) {
            if ($boutique->isDirty(['total_sales_amount', 'total_sales_count'])) {
                // يمكن إضافة منطق إضافي هنا
            }
        });
    }
}