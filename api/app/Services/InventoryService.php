<?php

namespace App\Services;

use App\Models\Material;
use App\Models\MaterialReservation;
use App\Models\Order;
use App\Models\ProductionStage;
use App\Models\ProductBillOfMaterial;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoryService
{
    /**
     * Reserve materials for a production stage.
     */
    public function reserveMaterialsForStage(Order $order, ProductionStage $stage): array
    {
        $results = ['success' => [], 'failed' => []];

        DB::beginTransaction();
        
        try {
            // Get required materials for this stage from product BOM
            $requiredMaterials = $this->getRequiredMaterialsForStage($order, $stage);

            foreach ($requiredMaterials as $materialData) {
                $material = Material::find($materialData['material_id']);
                $requiredQuantity = $materialData['quantity'];

                if ($this->checkMaterialAvailability($material, $requiredQuantity)) {
                    // Reserve the material
                    $reservation = $this->createReservation($order, $material, $stage, $requiredQuantity);
                    
                    // Decrease available stock
                    $material->decrement('quantity', $requiredQuantity);
                    
                    $results['success'][] = [
                        'material' => $material->name,
                        'quantity' => $requiredQuantity,
                        'reservation_id' => $reservation->id
                    ];

                    Log::info("Material reserved", [
                        'order_id' => $order->id,
                        'material_id' => $material->id,
                        'quantity' => $requiredQuantity,
                        'stage' => $stage->name
                    ]);
                } else {
                    $results['failed'][] = [
                        'material' => $material->name,
                        'required' => $requiredQuantity,
                        'available' => $material->quantity,
                        'reason' => 'insufficient_stock'
                    ];
                }
            }

            DB::commit();
            return $results;

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Failed to reserve materials", [
                'order_id' => $order->id,
                'stage_id' => $stage->id,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Update inventory usage when materials are consumed.
     */
    public function updateInventoryUsage(Order $order, ProductionStage $stage, array $usedMaterials): void
    {
        DB::beginTransaction();
        
        try {
            foreach ($usedMaterials as $materialId => $quantityUsed) {
                $reservation = MaterialReservation::where('order_id', $order->id)
                    ->where('material_id', $materialId)
                    ->where('production_stage_id', $stage->id)
                    ->where('status', 'reserved')
                    ->first();

                if ($reservation) {
                    $reservation->update([
                        'quantity_used' => $quantityUsed,
                        'usage_date' => now(),
                        'status' => $reservation->isFullyUsed() ? 'used' : 'reserved'
                    ]);

                    // If less than reserved, return unused quantity to stock
                    if ($quantityUsed < $reservation->quantity_reserved) {
                        $unusedQuantity = $reservation->quantity_reserved - $quantityUsed;
                        $reservation->material->increment('quantity', $unusedQuantity);
                    }

                    Log::info("Material usage updated", [
                        'order_id' => $order->id,
                        'material_id' => $materialId,
                        'used_quantity' => $quantityUsed,
                        'reserved_quantity' => $reservation->quantity_reserved
                    ]);
                }
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Failed to update inventory usage", [
                'order_id' => $order->id,
                'stage_id' => $stage->id,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Check if sufficient material is available.
     */
    public function checkMaterialAvailability(Material $material, float $requiredQuantity): bool
    {
        return $material->quantity >= $requiredQuantity;
    }

    /**
     * Release unused material reservations.
     */
    public function releaseMaterialReservation(Order $order, ProductionStage $stage): void
    {
        $reservations = MaterialReservation::where('order_id', $order->id)
            ->where('production_stage_id', $stage->id)
            ->where('status', 'reserved')
            ->get();

        foreach ($reservations as $reservation) {
            $reservation->release();
        }
    }

    /**
     * Get low stock materials.
     */
    public function getLowStockMaterials(int $threshold = 10): array
    {
        return Material::where('quantity', '<=', $threshold)
            ->where('is_active', true)
            ->get()
            ->toArray();
    }

    /**
     * Get material consumption report for an order.
     */
    public function getOrderMaterialReport(Order $order): array
    {
        $reservations = MaterialReservation::with(['material', 'productionStage'])
            ->where('order_id', $order->id)
            ->get();

        $report = [
            'total_reserved' => 0,
            'total_used' => 0,
            'total_cost' => 0,
            'materials' => []
        ];

        foreach ($reservations as $reservation) {
            $materialCost = $reservation->quantity_used * $reservation->material->cost_per_unit;
            
            $report['materials'][] = [
                'name' => $reservation->material->name,
                'stage' => $reservation->productionStage->name,
                'reserved' => $reservation->quantity_reserved,
                'used' => $reservation->quantity_used,
                'cost' => $materialCost,
                'waste' => $reservation->quantity_reserved - $reservation->quantity_used,
                'status' => $reservation->status
            ];

            $report['total_reserved'] += $reservation->quantity_reserved;
            $report['total_used'] += $reservation->quantity_used;
            $report['total_cost'] += $materialCost;
        }

        return $report;
    }

    /**
     * Get required materials for a specific stage.
     */
    private function getRequiredMaterialsForStage(Order $order, ProductionStage $stage): array
    {
        // Get BOM for the order's product
        $bomItems = ProductBillOfMaterial::where('product_id', $order->product_id)
            ->with('material')
            ->get();

        $requiredMaterials = [];

        foreach ($bomItems as $bomItem) {
            // For simplicity, assume all materials are needed for all stages
            // In a real scenario, you might have stage-specific material requirements
            $requiredMaterials[] = [
                'material_id' => $bomItem->material_id,
                'quantity' => $bomItem->quantity * $order->quantity // multiply by order quantity
            ];
        }

        return $requiredMaterials;
    }

    /**
     * Create a material reservation.
     */
    private function createReservation(Order $order, Material $material, ProductionStage $stage, float $quantity): MaterialReservation
    {
        return MaterialReservation::create([
            'order_id' => $order->id,
            'material_id' => $material->id,
            'production_stage_id' => $stage->id,
            'quantity_reserved' => $quantity,
            'reservation_date' => now(),
            'status' => 'reserved'
        ]);
    }
}