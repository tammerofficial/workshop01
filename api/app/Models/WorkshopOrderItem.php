<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WorkshopOrderItem extends Model
{
    use HasFactory;

    protected $table = 'workshop_order_items';

    protected $fillable = [
        'workshop_order_id',
        'source_order_item_id',
        'product_id',
        'product_name',
        'product_sku',
        'quantity',
        'unit_cost',
        'total_cost',
        'unit_price',
        'total_price',
        'product_specifications',
        'materials_breakdown',
        'status',
        'progress_percentage',
        'assigned_worker_id',
        'production_notes',
        'quality_notes',
        'production_started_at',
        'completed_at',
    ];

    protected $casts = [
        'unit_cost' => 'decimal:3',
        'total_cost' => 'decimal:3',
        'unit_price' => 'decimal:3',
        'total_price' => 'decimal:3',
        'progress_percentage' => 'decimal:2',
        'product_specifications' => 'array',
        'materials_breakdown' => 'array',
        'production_started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Relationships

    public function workshopOrder(): BelongsTo
    {
        return $this->belongsTo(WorkshopOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function assignedWorker(): BelongsTo
    {
        return $this->belongsTo(Worker::class, 'assigned_worker_id');
    }

    // Helper Methods

    public function getTotalCostWithTaxAttribute()
    {
        // Assuming 10% tax rate
        return $this->total_cost * 1.1;
    }

    public function getProfitMarginAttribute()
    {
        if ($this->unit_cost > 0) {
            return (($this->unit_price - $this->unit_cost) / $this->unit_cost) * 100;
        }
        return 0;
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function canStartProduction(): bool
    {
        return in_array($this->status, ['pending', 'materials_reserved']);
    }
}
