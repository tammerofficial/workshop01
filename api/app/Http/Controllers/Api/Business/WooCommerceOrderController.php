<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use App\Models\WooCommerceOrder;
use App\Models\WooCommerceOrderItem;
use App\Models\WorkshopOrder;
use App\Models\WorkshopOrderItem;
use App\Models\Product;
use App\Models\ProductMaterial;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WooCommerceOrderController extends Controller
{
    /**
     * Get WooCommerce orders with pagination
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $status = $request->get('status');
            $cloned = $request->get('cloned'); // 'true', 'false', or null for all

            $query = WooCommerceOrder::with(['orderItems.product']);

            // Filter by status
            if ($status) {
                $query->where('status', $status);
            }

            // Filter by clone status
            if ($cloned !== null) {
                $query->where('is_cloned_to_workshop', $cloned === 'true');
            }

            // Order by most recent
            $query->orderBy('order_date', 'desc');

            $orders = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $orders->items(),
                'pagination' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total(),
                    'from' => $orders->firstItem(),
                    'to' => $orders->lastItem(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching WooCommerce orders: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب الطلبات',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync orders from WooCommerce API
     */
    public function syncFromWooCommerce(Request $request): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 20);

            // Here you would call WooCommerce API
            // For now, I'll create a mock response
            $wooOrders = $this->fetchOrdersFromWooCommerce($page, $perPage);

            $syncedCount = 0;
            $errors = [];

            foreach ($wooOrders['orders'] as $wooOrder) {
                try {
                    $this->createOrUpdateWooCommerceOrder($wooOrder);
                    $syncedCount++;
                } catch (\Exception $e) {
                    $errors[] = "Order {$wooOrder['id']}: " . $e->getMessage();
                    Log::error("Failed to sync WooCommerce order {$wooOrder['id']}: " . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => "تم مزامنة {$syncedCount} طلب بنجاح",
                'synced_count' => $syncedCount,
                'total_pages' => $wooOrders['total_pages'],
                'current_page' => $page,
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            Log::error('Error syncing WooCommerce orders: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'خطأ في مزامنة الطلبات',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clone WooCommerce order to workshop
     */
    public function cloneToWorkshop(Request $request, $orderId): JsonResponse
    {
        try {
            DB::beginTransaction();

            $wooOrder = WooCommerceOrder::with('orderItems.product')->findOrFail($orderId);
            
            if ($wooOrder->is_cloned_to_workshop) {
                return response()->json([
                    'success' => false,
                    'message' => 'هذا الطلب مستنسخ مسبقاً للورشة'
                ], 400);
            }

            // Create workshop order
            $workshopOrder = WorkshopOrder::create([
                'order_number' => $this->generateWorkshopOrderNumber(),
                'source_type' => 'woocommerce',
                'source_id' => $wooOrder->wc_order_id,
                'customer_name' => $wooOrder->customer_name,
                'customer_email' => $wooOrder->customer_email,
                'customer_phone' => $wooOrder->customer_phone,
                'selling_price' => $wooOrder->total_amount,
                'currency' => $wooOrder->currency,
                'status' => 'pending_acceptance',
                'priority' => 'medium',
                'delivery_address' => $wooOrder->shipping_address ?: $wooOrder->billing_address,
                'customer_notes' => $wooOrder->customer_notes,
                'special_requirements' => $wooOrder->order_notes ? ['woocommerce_notes' => $wooOrder->order_notes] : null,
            ]);

            // Clone order items with BOM
            $totalEstimatedCost = 0;

            foreach ($wooOrder->orderItems as $wooItem) {
                if (!$wooItem->product) {
                    Log::warning("WooCommerce item {$wooItem->id} has no linked product, skipping");
                    continue;
                }

                // Calculate materials breakdown
                $materialsBreakdown = $this->calculateMaterialsBreakdown($wooItem->product, $wooItem->quantity);
                
                // Calculate estimated cost
                $unitCost = $this->calculateUnitCost($wooItem->product, $materialsBreakdown);
                $totalCost = $unitCost * $wooItem->quantity;
                $totalEstimatedCost += $totalCost;

                WorkshopOrderItem::create([
                    'workshop_order_id' => $workshopOrder->id,
                    'source_order_item_id' => $wooItem->wc_order_item_id,
                    'product_id' => $wooItem->product_id,
                    'product_name' => $wooItem->product_name,
                    'product_sku' => $wooItem->product_sku,
                    'quantity' => $wooItem->quantity,
                    'unit_cost' => $unitCost,
                    'total_cost' => $totalCost,
                    'unit_price' => $wooItem->unit_price,
                    'total_price' => $wooItem->line_total,
                    'product_specifications' => $wooItem->product_attributes,
                    'materials_breakdown' => $materialsBreakdown,
                    'status' => 'pending',
                ]);

                // Mark WooCommerce item as cloned
                $wooItem->update([
                    'is_cloned_to_workshop' => true,
                    'workshop_order_item_id' => $workshopOrder->id, // This should reference the workshop order item, but simplified for now
                ]);
            }

            // Update workshop order with estimated cost
            $workshopOrder->update(['estimated_cost' => $totalEstimatedCost]);

            // Mark WooCommerce order as cloned
            $wooOrder->update([
                'is_cloned_to_workshop' => true,
                'workshop_order_id' => $workshopOrder->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم استنساخ الطلب بنجاح للورشة',
                'workshop_order' => $workshopOrder->load('orderItems'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error cloning WooCommerce order to workshop: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'خطأ في استنساخ الطلب',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order details
     */
    public function show($orderId): JsonResponse
    {
        try {
            $order = WooCommerceOrder::with([
                'orderItems.product.materials',
                'workshopOrder.orderItems'
            ])->findOrFail($orderId);

            return response()->json([
                'success' => true,
                'data' => $order,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'الطلب غير موجود',
            ], 404);
        }
    }

    /**
     * Auto-clone eligible orders
     */
    public function autoCloneEligibleOrders(): JsonResponse
    {
        try {
            $eligibleOrders = WooCommerceOrder::notCloned()
                ->whereIn('status', ['processing', 'completed'])
                ->whereHas('orderItems.product') // Only orders with linked products
                ->with(['orderItems.product'])
                ->get();

            $clonedCount = 0;
            $errors = [];

            foreach ($eligibleOrders as $order) {
                try {
                    // Auto-clone logic here
                    $clonedCount++;
                } catch (\Exception $e) {
                    $errors[] = "Order {$order->wc_order_id}: " . $e->getMessage();
                }
            }

            return response()->json([
                'success' => true,
                'message' => "تم استنساخ {$clonedCount} طلب تلقائياً",
                'cloned_count' => $clonedCount,
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            Log::error('Error auto-cloning orders: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'خطأ في الاستنساخ التلقائي',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Private helper methods

    private function fetchOrdersFromWooCommerce($page, $perPage): array
    {
        // Mock data - replace with actual WooCommerce API call
        return [
            'orders' => [
                [
                    'id' => 1001,
                    'number' => 'WC-1001',
                    'status' => 'processing',
                    'date_created' => '2025-07-31T10:00:00',
                    'total' => '250.500',
                    'currency' => 'KWD',
                    'customer_id' => 123,
                    'billing' => [
                        'first_name' => 'أحمد',
                        'last_name' => 'محمد',
                        'email' => 'ahmed@example.com',
                        'phone' => '+965123456789',
                    ],
                    'line_items' => [
                        [
                            'id' => 1,
                            'product_id' => 100,
                            'name' => 'بدلة رسمية',
                            'sku' => 'SUIT-001',
                            'quantity' => 1,
                            'price' => 250.500,
                            'total' => '250.500',
                        ]
                    ]
                ]
            ],
            'total_pages' => 10,
        ];
    }

    private function createOrUpdateWooCommerceOrder(array $wooOrderData): WooCommerceOrder
    {
        $orderData = [
            'wc_order_id' => $wooOrderData['id'],
            'order_number' => $wooOrderData['number'],
            'customer_name' => ($wooOrderData['billing']['first_name'] ?? '') . ' ' . ($wooOrderData['billing']['last_name'] ?? ''),
            'customer_email' => $wooOrderData['billing']['email'] ?? null,
            'customer_phone' => $wooOrderData['billing']['phone'] ?? null,
            'total_amount' => $wooOrderData['total'],
            'currency' => $wooOrderData['currency'],
            'status' => $wooOrderData['status'],
            'billing_address' => $wooOrderData['billing'] ?? null,
            'order_date' => $wooOrderData['date_created'],
        ];

        $order = WooCommerceOrder::updateOrCreate(
            ['wc_order_id' => $wooOrderData['id']],
            $orderData
        );

        // Create order items
        foreach ($wooOrderData['line_items'] as $item) {
            WooCommerceOrderItem::updateOrCreate(
                [
                    'woocommerce_order_id' => $order->id,
                    'wc_order_item_id' => $item['id']
                ],
                [
                    'wc_product_id' => $item['product_id'],
                    'product_name' => $item['name'],
                    'product_sku' => $item['sku'] ?? null,
                    'unit_price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'line_total' => $item['total'],
                ]
            );
        }

        return $order;
    }

    private function calculateMaterialsBreakdown(Product $product, int $quantity): array
    {
        $materials = ProductMaterial::where('product_id', $product->id)
            ->with('material')
            ->get();

        $breakdown = [];
        foreach ($materials as $productMaterial) {
            $totalNeeded = $productMaterial->total_quantity_with_waste * $quantity;
            
            $breakdown[] = [
                'material_id' => $productMaterial->material_id,
                'material_name' => $productMaterial->material->name ?? 'مادة غير محددة',
                'quantity_per_unit' => $productMaterial->quantity_needed,
                'waste_percentage' => $productMaterial->waste_percentage,
                'total_quantity_needed' => $totalNeeded,
                'unit' => $productMaterial->unit,
                'is_critical' => $productMaterial->is_critical,
            ];
        }

        return $breakdown;
    }

    private function calculateUnitCost(Product $product, array $materialsBreakdown): float
    {
        $totalCost = 0;
        
        foreach ($materialsBreakdown as $material) {
            // This would typically fetch current material cost from materials table
            $materialCost = 5.0; // Mock cost per unit
            $totalCost += $material['total_quantity_needed'] * $materialCost;
        }

        // Add labor cost (could be calculated based on production stages)
        $laborCost = 20.0; // Mock labor cost
        
        return $totalCost + $laborCost;
    }

    private function generateWorkshopOrderNumber(): string
    {
        $lastOrder = WorkshopOrder::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastOrder ? (int)substr($lastOrder->order_number, -4) + 1 : 1;
        
        return 'WS-' . now()->format('Ymd') . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}