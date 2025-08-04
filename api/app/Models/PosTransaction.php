<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class PosTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'boutique_sale_id',
        'product_id',
        'processed_by',
        'quantity',
        'unit_price',
        'line_total',
        'discount_amount',
        'final_amount',
        'stock_before',
        'stock_after',
        'auto_deducted',
        'authorized_by',
        'requires_authorization',
        'authorization_status',
        'authorization_notes',
        'transaction_type',
        'original_transaction_id',
        'modification_reason',
    ];

    protected $casts = [
        'unit_price' => 'decimal:3',
        'line_total' => 'decimal:3',
        'discount_amount' => 'decimal:3',
        'final_amount' => 'decimal:3',
        'auto_deducted' => 'boolean',
        'requires_authorization' => 'boolean',
    ];

    // ================== علاقات النموذج ==================

    /**
     * البيع الذي تنتمي إليه هذه المعاملة
     */
    public function boutiqueSale(): BelongsTo
    {
        return $this->belongsTo(BoutiqueSale::class);
    }

    /**
     * المنتج المباع
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * المستخدم الذي قام بالمعاملة
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * المستخدم الذي صرح بالمعاملة (للخصومات الكبيرة أو المرتجعات)
     */
    public function authorizedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'authorized_by');
    }

    /**
     * المعاملة الأصلية (في حالة المرتجعات)
     */
    public function originalTransaction(): BelongsTo
    {
        return $this->belongsTo(PosTransaction::class, 'original_transaction_id');
    }

    // ================== نطاقات الاستعلام ==================

    /**
     * معاملات البيع العادية
     */
    public function scopeSales(Builder $query): Builder
    {
        return $query->where('transaction_type', 'sale');
    }

    /**
     * المرتجعات
     */
    public function scopeReturns(Builder $query): Builder
    {
        return $query->where('transaction_type', 'return');
    }

    /**
     * المعاملات التي تحتاج ترخيص
     */
    public function scopeRequiringAuthorization(Builder $query): Builder
    {
        return $query->where('requires_authorization', true);
    }

    /**
     * المعاملات المعلقة للموافقة
     */
    public function scopePendingApproval(Builder $query): Builder
    {
        return $query->where('authorization_status', 'pending');
    }

    /**
     * المعاملات التي يمكن للمستخدم الوصول إليها حسب الصلاحيات
     */
    public function scopeAccessibleByUser(Builder $query, User $user): Builder
    {
        // إذا كان مدير عام، يمكنه رؤية جميع المعاملات
        if ($user->hasAnyRole(['super_admin', 'boutique_regional_manager'])) {
            return $query;
        }
        
        // الوصول عبر البوتيك
        $accessibleBoutiqueIds = Boutique::accessibleByUser($user)->pluck('id');
        
        return $query->whereHas('boutiqueSale', function (Builder $saleQuery) use ($accessibleBoutiqueIds) {
            $saleQuery->whereIn('boutique_id', $accessibleBoutiqueIds);
        });
    }

    // ================== الطرق المساعدة ==================

    /**
     * التحقق من قدرة المستخدم على الوصول لهذه المعاملة
     */
    public function canBeAccessedBy(User $user): bool
    {
        // التحقق من الصلاحيات الأساسية
        if (!$user->hasPermission('pos.operate')) {
            return false;
        }
        
        // التحقق من إمكانية الوصول للبيع المرتبط
        return $this->boutiqueSale->canBeAccessedBy($user);
    }

    /**
     * التحقق من قدرة المستخدم على تعديل هذه المعاملة
     */
    public function canBeModifiedBy(User $user): bool
    {
        // لا يمكن تعديل المعاملات المكتملة أو المرفوضة
        if ($this->authorization_status === 'rejected') {
            return false;
        }
        
        // يحتاج صلاحيات خاصة للتعديل
        if (!$user->hasAnyPermission(['pos.refund', 'pos.void_transaction'])) {
            return false;
        }
        
        return $this->canBeAccessedBy($user);
    }

    /**
     * التحقق من قدرة المستخدم على ترخيص هذه المعاملة
     */
    public function canBeAuthorizedBy(User $user): bool
    {
        // لا تحتاج ترخيص
        if (!$this->requires_authorization) {
            return false;
        }
        
        // يجب أن تكون معلقة
        if ($this->authorization_status !== 'pending') {
            return false;
        }
        
        // يحتاج صلاحيات إدارية
        if (!$user->hasAnyRole(['boutique_supervisor', 'boutique_senior_supervisor', 'boutique_manager', 'boutique_regional_manager', 'super_admin'])) {
            return false;
        }
        
        // لا يمكن للمستخدم ترخيص معاملته الخاصة
        if ($this->processed_by === $user->id) {
            return false;
        }
        
        return $this->canBeAccessedBy($user);
    }

    /**
     * ترخيص المعاملة
     */
    public function authorize(User $user, bool $approved, string $notes = null): bool
    {
        if (!$this->canBeAuthorizedBy($user)) {
            return false;
        }
        
        $this->authorized_by = $user->id;
        $this->authorization_status = $approved ? 'approved' : 'rejected';
        $this->authorization_notes = $notes;
        
        return $this->save();
    }

    /**
     * حساب مبلغ السطر مع الخصم
     */
    public function calculateLineTotal(): float
    {
        $subtotal = $this->quantity * $this->unit_price;
        return $subtotal - $this->discount_amount;
    }

    /**
     * التحقق من الحاجة للترخيص (حسب قيمة الخصم أو نوع المعاملة)
     */
    public function shouldRequireAuthorization(): bool
    {
        // خصم أكبر من نسبة معينة (مثلاً 20%)
        $discountPercentage = ($this->discount_amount / ($this->quantity * $this->unit_price)) * 100;
        if ($discountPercentage > 20) {
            return true;
        }
        
        // المرتجعات تحتاج ترخيص
        if ($this->transaction_type === 'return') {
            return true;
        }
        
        // تعديلات الخصم تحتاج ترخيص
        if ($this->transaction_type === 'discount_adjustment') {
            return true;
        }
        
        return false;
    }

    /**
     * تحديث المخزون حسب نوع المعاملة
     */
    public function updateInventory(): bool
    {
        if (!$this->auto_deducted) {
            return true; // لا نحديث تلقائي
        }
        
        $product = $this->product;
        if (!$product || !$product->manage_stock) {
            return true; // المنتج لا يدار مخزونه
        }
        
        // حفظ المخزون قبل التحديث
        $this->stock_before = $product->stock_quantity;
        
        switch ($this->transaction_type) {
            case 'sale':
                $product->stock_quantity -= $this->quantity;
                break;
                
            case 'return':
                $product->stock_quantity += $this->quantity;
                break;
                
            default:
                return true; // لا تحديث للأنواع الأخرى
        }
        
        // حفظ المخزون بعد التحديث
        $this->stock_after = $product->stock_quantity;
        
        return $product->save() && $this->save();
    }

    /**
     * إنشاء معاملة مرتجع
     */
    public function createReturn(int $returnQuantity, User $processedBy, string $reason = null): ?PosTransaction
    {
        // التحقق من إمكانية الإرجاع
        if ($this->transaction_type !== 'sale' || $returnQuantity > $this->quantity) {
            return null;
        }
        
        // إنشاء معاملة المرتجع
        $return = new PosTransaction([
            'boutique_sale_id' => $this->boutique_sale_id,
            'product_id' => $this->product_id,
            'processed_by' => $processedBy->id,
            'quantity' => $returnQuantity,
            'unit_price' => $this->unit_price,
            'line_total' => $returnQuantity * $this->unit_price,
            'discount_amount' => 0,
            'final_amount' => $returnQuantity * $this->unit_price,
            'auto_deducted' => true,
            'requires_authorization' => true,
            'authorization_status' => 'pending',
            'transaction_type' => 'return',
            'original_transaction_id' => $this->id,
            'modification_reason' => $reason,
        ]);
        
        if ($return->save()) {
            $return->updateInventory();
            return $return;
        }
        
        return null;
    }

    // ================== أحداث النموذج ==================

    protected static function booted(): void
    {
        // التحقق من الحاجة للترخيص عند الإنشاء
        static::creating(function (PosTransaction $transaction) {
            $transaction->requires_authorization = $transaction->shouldRequireAuthorization();
            
            // حساب المبلغ النهائي
            $transaction->final_amount = $transaction->calculateLineTotal();
        });
        
        // تحديث المخزون عند الإنشاء
        static::created(function (PosTransaction $transaction) {
            if ($transaction->authorization_status === 'approved' || !$transaction->requires_authorization) {
                $transaction->updateInventory();
            }
        });
        
        // تحديث المخزون عند تغيير حالة الترخيص
        static::updated(function (PosTransaction $transaction) {
            if ($transaction->isDirty('authorization_status') && $transaction->authorization_status === 'approved') {
                $transaction->updateInventory();
            }
        });
    }
}