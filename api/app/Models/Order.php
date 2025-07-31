<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'assigned_worker_id',
        'category_id',
        'product_id', // ربط مع المنتج
        'collection_id', // ربط مع الكولكشن
        'title',
        'description',
        'status',
        'priority',
        'production_stage', // المرحلة الحالية في الإنتاج
        'current_worker_id', // العامل الحالي المسؤول عن المرحلة
        'start_date',
        'due_date',
        'completed_date',
        'total_cost',
        'estimated_hours', // ساعات العمل المتوقعة
        'actual_hours', // ساعات العمل الفعلية
        'quality_status', // pending, approved, rejected
        'delivery_status', // pending, ready, delivered
        'notes',
        'specifications',
        'woocommerce_id',
        'progress',
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
        'completed_date' => 'date',
        'total_cost' => 'decimal:2',
        'estimated_hours' => 'integer',
        'actual_hours' => 'integer',
        'specifications' => 'array',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function worker()
    {
        return $this->belongsTo(Worker::class, 'assigned_worker_id');
    }

    public function currentWorker()
    {
        return $this->belongsTo(Worker::class, 'current_worker_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function collection()
    {
        return $this->belongsTo(Collection::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function materials()
    {
        return $this->belongsToMany(Material::class, 'order_materials')
                    ->withPivot('quantity_used', 'cost')
                    ->withTimestamps();
    }

    public function measurements()
    {
        return $this->hasMany(Measurement::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function productionTracking()
    {
        return $this->hasMany(OrderProductionTracking::class);
    }

    public function materialTransactions()
    {
        return $this->hasMany(MaterialTransaction::class);
    }

    // Helper methods for production workflow
    public function moveToNextStage()
    {
        $stages = ['pending', 'design', 'cutting', 'sewing', 'fitting', 'finishing', 'quality_check', 'ready_for_delivery', 'completed'];
        $currentIndex = array_search($this->production_stage ?: 'pending', $stages);
        
        if ($currentIndex !== false && $currentIndex < count($stages) - 1) {
            $nextStage = $stages[$currentIndex + 1];
            $this->update([
                'production_stage' => $nextStage,
                'status' => $nextStage === 'completed' ? 'completed' : 'in_progress'
            ]);
            
            // Auto-assign worker based on stage specialty
            $this->assignWorkerByStage($nextStage);
            
            return true;
        }
        
        return false;
    }

    public function assignWorkerByStage($stage)
    {
        $worker = Worker::where('is_active', true)
            ->where(function($query) use ($stage) {
                $query->where('specialty', $stage)
                      ->orWhereJsonContains('production_stages', $stage);
            })
            ->orderBy('id') // أو أي منطق لاختيار العامل الأنسب
            ->first();
            
        if ($worker) {
            $this->update(['current_worker_id' => $worker->id]);
            return $worker;
        }
        
        return null;
    }

    public function calculateEstimatedHours()
    {
        if ($this->product) {
            $this->update(['estimated_hours' => $this->product->getTotalProductionHours()]);
        }
    }

    // Generate order number
    public static function generateOrderNumber()
    {
        $lastOrder = self::latest()->first();
        $lastNumber = $lastOrder ? intval(substr($lastOrder->title, 4)) : 0;
        return 'ODR-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
    }
}
