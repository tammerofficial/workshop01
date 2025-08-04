<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class BoutiqueSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'boutique_id',
        'client_id',
        'loyalty_customer_id',
        'cashier_id',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total_amount',
        'paid_amount',
        'change_amount',
        'payment_method',
        'payment_details',
        'loyalty_points_used',
        'loyalty_points_earned',
        'loyalty_discount',
        'status',
        'notes',
        'sale_date',
        'receipt_number',
        'is_loyalty_transaction',
    ];

    protected $casts = [
        'subtotal' => 'decimal:3',
        'discount_amount' => 'decimal:3',
        'tax_amount' => 'decimal:3',
        'total_amount' => 'decimal:3',
        'paid_amount' => 'decimal:3',
        'change_amount' => 'decimal:3',
        'loyalty_discount' => 'decimal:3',
        'payment_details' => 'array',
        'sale_date' => 'datetime',
        'is_loyalty_transaction' => 'boolean',
    ];

    // ================== علاقات النموذج ==================

    /**
     * البوتيك الذي تم فيه البيع
     */
    public function boutique(): BelongsTo
    {
        return $this->belongsTo(Boutique::class);
    }

    /**
     * العميل (إذا كان مسجل)
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * عميل الولاء (إذا كان مشترك في نظام الولاء)
     */
    public function loyaltyCustomer(): BelongsTo
    {
        return $this->belongsTo(LoyaltyCustomer::class);
    }

    /**
     * الكاشير الذي قام بالبيع
     */
    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    /**
     * معاملات نقاط البيع (تفاصيل المنتجات المباعة)
     */
    public function posTransactions(): HasMany
    {
        return $this->hasMany(PosTransaction::class);
    }

    // ================== نطاقات الاستعلام ==================

    /**
     * المبيعات المكتملة فقط
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    /**
     * مبيعات نظام الولاء
     */
    public function scopeLoyaltyTransactions(Builder $query): Builder
    {
        return $query->where('is_loyalty_transaction', true);
    }

    /**
     * المبيعات في فترة زمنية محددة
     */
    public function scopeInDateRange(Builder $query, $startDate, $endDate): Builder
    {
        return $query->whereBetween('sale_date', [$startDate, $endDate]);
    }

    /**
     * المبيعات لبوتيك محدد
     */
    public function scopeForBoutique(Builder $query, $boutiqueId): Builder
    {
        return $query->where('boutique_id', $boutiqueId);
    }

    /**
     * المبيعات التي يمكن للمستخدم الوصول إليها حسب الصلاحيات
     */
    public function scopeAccessibleByUser(Builder $query, User $user): Builder
    {
        // إذا كان مدير عام أو إقليمي، يمكنه رؤية جميع المبيعات
        if ($user->hasAnyRole(['super_admin', 'boutique_regional_manager'])) {
            return $query;
        }
        
        // إذا كان مدير بوتيك، يمكنه رؤية مبيعات بوتيكه فقط
        if ($user->hasRole('boutique_manager')) {
            $boutique = Boutique::where('manager_id', $user->id)->first();
            if ($boutique) {
                return $query->where('boutique_id', $boutique->id);
            }
        }
        
        // إذا كان موظف بوتيك، يمكنه رؤية مبيعات بوتيكه فقط
        if ($user->boutique_id) {
            return $query->where('boutique_id', $user->boutique_id);
        }
        
        // إذا كان الكاشير، يمكنه رؤية مبيعاته فقط (حسب الإعدادات)
        if ($user->hasRole('boutique_cashier')) {
            return $query->where('cashier_id', $user->id);
        }
        
        // أي مستخدم آخر لا يمكنه الوصول لأي مبيعات
        return $query->whereRaw('1 = 0');
    }

    // ================== الطرق المساعدة ==================

    /**
     * التحقق من قدرة المستخدم على الوصول لهذا البيع
     */
    public function canBeAccessedBy(User $user): bool
    {
        // التحقق من الصلاحيات الأساسية
        if (!$user->hasPermission('sales.view')) {
            return false;
        }
        
        // مدير عام أو إقليمي يمكنه الوصول لجميع المبيعات
        if ($user->hasAnyRole(['super_admin', 'boutique_regional_manager'])) {
            return true;
        }
        
        // مدير البوتيك يمكنه الوصول لمبيعات بوتيكه
        if ($user->hasRole('boutique_manager')) {
            $boutique = Boutique::where('manager_id', $user->id)->first();
            return $boutique && $this->boutique_id === $boutique->id;
        }
        
        // موظف البوتيك يمكنه الوصول لمبيعات بوتيكه
        if ($user->boutique_id === $this->boutique_id) {
            return true;
        }
        
        return false;
    }

    /**
     * التحقق من قدرة المستخدم على تعديل هذا البيع (مرتجعات، إلغاء، إلخ)
     */
    public function canBeModifiedBy(User $user): bool
    {
        // لا يمكن تعديل المبيعات المسترجعة أو الملغاة
        if (in_array($this->status, ['refunded', 'cancelled'])) {
            return false;
        }
        
        // يحتاج صلاحيات خاصة للتعديل
        if (!$user->hasAnyPermission(['pos.refund', 'pos.void_transaction'])) {
            return false;
        }
        
        // يجب أن يكون قادر على الوصول للبيع أولاً
        if (!$this->canBeAccessedBy($user)) {
            return false;
        }
        
        // التحقق من المدة الزمنية (مثلاً 24 ساعة للمرتجعات)
        if ($this->sale_date->diffInHours(now()) > 24) {
            // يحتاج صلاحيات إدارية لتعديل مبيعات قديمة
            return $user->hasAnyRole(['boutique_manager', 'boutique_regional_manager', 'super_admin']);
        }
        
        return true;
    }

    /**
     * إنشاء رقم فاتورة تلقائي
     */
    public static function generateInvoiceNumber(int $boutiqueId): string
    {
        $boutique = Boutique::find($boutiqueId);
        $boutiqueCode = $boutique ? $boutique->code : 'BTQ';
        $date = Carbon::now()->format('Ymd');
        $sequence = static::where('boutique_id', $boutiqueId)
                         ->whereDate('created_at', Carbon::today())
                         ->count() + 1;
        
        return sprintf('%s-%s-%04d', $boutiqueCode, $date, $sequence);
    }

    /**
     * حساب النقاط المكتسبة حسب نظام الولاء
     */
    public function calculateLoyaltyPoints(): int
    {
        if (!$this->is_loyalty_transaction || !$this->loyaltyCustomer) {
            return 0;
        }
        
        $boutique = $this->boutique;
        $loyaltyCustomer = $this->loyaltyCustomer;
        
        // حساب النقاط: المبلغ × النقاط لكل دينار × مضاعف المستوى
        $basePoints = $this->total_amount * $boutique->default_points_per_kwd;
        $multipliedPoints = $basePoints * $loyaltyCustomer->tier_multiplier;
        
        return (int) round($multipliedPoints);
    }

    /**
     * تطبيق خصم نقاط الولاء
     */
    public function applyLoyaltyDiscount(int $pointsToUse): bool
    {
        if (!$this->loyaltyCustomer || $pointsToUse <= 0) {
            return false;
        }
        
        // التحقق من توفر النقاط
        if ($this->loyaltyCustomer->available_points < $pointsToUse) {
            return false;
        }
        
        // تحويل النقاط إلى خصم (مثلاً كل 100 نقطة = 1 دينار)
        $discountAmount = $pointsToUse / 100; // يمكن تخصيص هذه النسبة
        
        // التأكد من أن الخصم لا يتجاوز مبلغ البيع
        $discountAmount = min($discountAmount, $this->subtotal);
        
        $this->loyalty_points_used = $pointsToUse;
        $this->loyalty_discount = $discountAmount;
        $this->total_amount = $this->subtotal - $this->discount_amount - $discountAmount + $this->tax_amount;
        
        return true;
    }

    /**
     * معالجة نظام الولاء عند إتمام البيع
     */
    public function processLoyalty(): void
    {
        if (!$this->is_loyalty_transaction || !$this->loyaltyCustomer) {
            return;
        }
        
        $loyaltyCustomer = $this->loyaltyCustomer;
        
        // خصم النقاط المستخدمة
        if ($this->loyalty_points_used > 0) {
            $loyaltyCustomer->available_points -= $this->loyalty_points_used;
        }
        
        // إضافة النقاط المكتسبة
        $earnedPoints = $this->calculateLoyaltyPoints();
        $this->loyalty_points_earned = $earnedPoints;
        $loyaltyCustomer->available_points += $earnedPoints;
        $loyaltyCustomer->total_points += $earnedPoints;
        
        // تحديث إحصائيات العميل
        $loyaltyCustomer->total_spent += $this->total_amount;
        $loyaltyCustomer->total_orders += 1;
        $loyaltyCustomer->last_purchase_at = $this->sale_date;
        
        $loyaltyCustomer->save();
    }

    // ================== أحداث النموذج ==================

    protected static function booted(): void
    {
        // إنشاء رقم فاتورة تلقائي عند الإنشاء
        static::creating(function (BoutiqueSale $sale) {
            if (!$sale->invoice_number) {
                $sale->invoice_number = static::generateInvoiceNumber($sale->boutique_id);
            }
            
            if (!$sale->sale_date) {
                $sale->sale_date = now();
            }
        });
        
        // معالجة نظام الولاء عند إتمام البيع
        static::created(function (BoutiqueSale $sale) {
            if ($sale->status === 'completed') {
                $sale->processLoyalty();
                
                // تحديث إحصائيات البوتيك
                $sale->boutique->updateStatistics();
            }
        });
        
        // تحديث الإحصائيات عند تغيير الحالة
        static::updated(function (BoutiqueSale $sale) {
            if ($sale->isDirty('status')) {
                $sale->boutique->updateStatistics();
            }
        });
    }
}