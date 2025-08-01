<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use App\Models\WorkshopOrder;
use App\Models\WorkshopOrderItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WorkshopOrderController extends Controller
{
    /**
     * Get workshop orders with pagination and filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $status = $request->get('status');
            $sourceType = $request->get('source_type');

            $query = WorkshopOrder::with(['orderItems.product', 'client', 'assignedManager']);

            if ($status) {
                $query->where('status', $status);
            }

            if ($sourceType) {
                $query->where('source_type', $sourceType);
            }

            $query->orderBy('priority', 'desc')->orderBy('created_at', 'desc');
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
            Log::error('Error fetching workshop orders: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب طلبات الورشة',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Accept workshop order
     */
    public function accept(Request $request, $orderId): JsonResponse
    {
        try {
            $order = WorkshopOrder::findOrFail($orderId);
            
            if ($order->status !== 'pending_acceptance') {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن قبول هذا الطلب في الحالة الحالية'
                ], 400);
            }

            $order->update([
                'status' => 'accepted',
                'accepted_at' => now(),
                'assigned_manager_id' => auth()->id() ?? 1,
                'manager_notes' => $request->get('manager_notes', 'تمت الموافقة على الطلب'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تمت الموافقة على الطلب بنجاح',
                'data' => $order->fresh(['orderItems.product', 'client', 'assignedManager']),
            ]);

        } catch (\Exception $e) {
            Log::error('Error accepting workshop order: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'خطأ في الموافقة على الطلب',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Start production
     */
    public function startProduction($orderId): JsonResponse
    {
        try {
            $order = WorkshopOrder::findOrFail($orderId);
            
            if (!in_array($order->status, ['accepted', 'materials_reserved'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن بدء الإنتاج لهذا الطلب في الحالة الحالية'
                ], 400);
            }

            $order->update([
                'status' => 'in_production',
                'production_started_at' => now(),
                'progress_percentage' => 5.00,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم بدء الإنتاج بنجاح',
                'data' => $order->fresh(['orderItems.product', 'client', 'assignedManager']),
            ]);

        } catch (\Exception $e) {
            Log::error('Error starting production: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'خطأ في بدء الإنتاج',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, $orderId): JsonResponse
    {
        try {
            $order = WorkshopOrder::findOrFail($orderId);
            $newStatus = $request->get('status');
            $notes = $request->get('notes');

            $updateData = ['status' => $newStatus];
            
            if ($notes) {
                $updateData['production_notes'] = $notes;
            }

            if ($newStatus === 'completed') {
                $updateData['completed_at'] = now();
                $updateData['progress_percentage'] = 100.00;
            }

            $order->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث حالة الطلب بنجاح',
                'data' => $order->fresh(['orderItems.product', 'client', 'assignedManager']),
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating order status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تحديث حالة الطلب',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
