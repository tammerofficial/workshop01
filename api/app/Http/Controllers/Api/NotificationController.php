<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Order;
use App\Models\ProductionStage;
use App\Models\Material;
use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Get all notifications
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::with(['order', 'worker', 'material'])
            ->orderBy('created_at', 'desc')
            ->when($request->has('unread_only'), function($query) {
                return $query->where('is_read', false);
            })
            ->when($request->has('type'), function($query) use ($request) {
                return $query->where('type', $request->type);
            })
            ->paginate(20);

        return response()->json($notifications);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Notification $notification): JsonResponse
    {
        $notification->update(['is_read' => true, 'read_at' => now()]);
        
        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(): JsonResponse
    {
        Notification::where('is_read', false)->update([
            'is_read' => true,
            'read_at' => now()
        ]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Delete notification
     */
    public function destroy(Notification $notification): JsonResponse
    {
        $notification->delete();
        
        return response()->json(['message' => 'Notification deleted successfully']);
    }

    /**
     * Get notification statistics
     */
    public function getStats(): JsonResponse
    {
        $stats = [
            'total' => Notification::count(),
            'unread' => Notification::where('is_read', false)->count(),
            'today' => Notification::whereDate('created_at', today())->count(),
            'types' => Notification::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray()
        ];

        return response()->json($stats);
    }

    /**
     * Send stage completion notification
     */
    public function sendStageCompletionNotification(Order $order, ProductionStage $stage, ?Worker $worker = null): void
    {
        try {
            $this->createNotification([
                'type' => 'stage_completion',
                'title' => 'مرحلة مكتملة',
                'title_en' => 'Stage Completed',
                'message' => "تم إكمال مرحلة '{$stage->name}' للطلبية '{$order->title}'",
                'message_en' => "Stage '{$stage->name}' completed for order '{$order->title}'",
                'order_id' => $order->id,
                'worker_id' => $worker?->id,
                'priority' => 'medium',
                'data' => [
                    'stage_name' => $stage->name,
                    'order_title' => $order->title,
                    'worker_name' => $worker?->name,
                    'completion_time' => now()->toISOString()
                ]
            ]);

            Log::info('Stage completion notification sent', [
                'order_id' => $order->id,
                'stage_id' => $stage->id,
                'worker_id' => $worker?->id
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send stage completion notification', [
                'order_id' => $order->id,
                'stage_id' => $stage->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send delay alert notification
     */
    public function sendDelayAlert(Order $order, string $reason = ''): void
    {
        try {
            $daysDelayed = $order->due_date ? 
                now()->diffInDays($order->due_date, false) : 0;

            $this->createNotification([
                'type' => 'delay_alert',
                'title' => 'تأخير في الطلبية',
                'title_en' => 'Order Delayed',
                'message' => "الطلبية '{$order->title}' متأخرة بـ {$daysDelayed} يوم" . 
                           ($reason ? " - السبب: {$reason}" : ''),
                'message_en' => "Order '{$order->title}' is delayed by {$daysDelayed} days" . 
                              ($reason ? " - Reason: {$reason}" : ''),
                'order_id' => $order->id,
                'priority' => 'high',
                'data' => [
                    'order_title' => $order->title,
                    'due_date' => $order->due_date,
                    'days_delayed' => $daysDelayed,
                    'reason' => $reason
                ]
            ]);

            Log::warning('Delay alert sent', [
                'order_id' => $order->id,
                'days_delayed' => $daysDelayed,
                'reason' => $reason
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send delay alert', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send low stock alert notification
     */
    public function sendLowStockAlert(Material $material): void
    {
        try {
            $this->createNotification([
                'type' => 'low_stock',
                'title' => 'مخزون منخفض',
                'title_en' => 'Low Stock Alert',
                'message' => "المادة '{$material->name}' وصلت لمستوى منخفض: {$material->quantity} {$material->unit}",
                'message_en' => "Material '{$material->name}' is running low: {$material->quantity} {$material->unit}",
                'material_id' => $material->id,
                'priority' => 'medium',
                'data' => [
                    'material_name' => $material->name,
                    'current_quantity' => $material->quantity,
                    'unit' => $material->unit,
                    'minimum_quantity' => $material->minimum_quantity ?? 10
                ]
            ]);

            Log::warning('Low stock alert sent', [
                'material_id' => $material->id,
                'material_name' => $material->name,
                'current_quantity' => $material->quantity
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send low stock alert', [
                'material_id' => $material->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send worker assignment notification
     */
    public function sendWorkerAssignmentNotification(Worker $worker, Order $order, ProductionStage $stage): void
    {
        try {
            $this->createNotification([
                'type' => 'worker_assignment',
                'title' => 'مهمة جديدة',
                'title_en' => 'New Task Assigned',
                'message' => "تم تعيينك لمرحلة '{$stage->name}' في الطلبية '{$order->title}'",
                'message_en' => "You have been assigned to stage '{$stage->name}' for order '{$order->title}'",
                'order_id' => $order->id,
                'worker_id' => $worker->id,
                'priority' => 'medium',
                'data' => [
                    'stage_name' => $stage->name,
                    'order_title' => $order->title,
                    'assignment_time' => now()->toISOString()
                ]
            ]);

            Log::info('Worker assignment notification sent', [
                'worker_id' => $worker->id,
                'order_id' => $order->id,
                'stage_id' => $stage->id
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send worker assignment notification', [
                'worker_id' => $worker->id,
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send quality issue notification
     */
    public function sendQualityIssueNotification(Order $order, ProductionStage $stage, int $qualityScore): void
    {
        if ($qualityScore >= 7) return; // Only send for low quality scores

        try {
            $this->createNotification([
                'type' => 'quality_issue',
                'title' => 'مشكلة في الجودة',
                'title_en' => 'Quality Issue',
                'message' => "الطلبية '{$order->title}' في مرحلة '{$stage->name}' حصلت على تقييم جودة منخفض: {$qualityScore}/10",
                'message_en' => "Order '{$order->title}' in stage '{$stage->name}' received low quality score: {$qualityScore}/10",
                'order_id' => $order->id,
                'priority' => 'high',
                'data' => [
                    'order_title' => $order->title,
                    'stage_name' => $stage->name,
                    'quality_score' => $qualityScore,
                    'threshold' => 7
                ]
            ]);

            Log::warning('Quality issue notification sent', [
                'order_id' => $order->id,
                'stage_id' => $stage->id,
                'quality_score' => $qualityScore
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send quality issue notification', [
                'order_id' => $order->id,
                'stage_id' => $stage->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Create notification helper
     */
    private function createNotification(array $data): Notification
    {
        return Notification::create([
            'type' => $data['type'],
            'title' => $data['title'],
            'title_en' => $data['title_en'] ?? $data['title'],
            'message' => $data['message'],
            'message_en' => $data['message_en'] ?? $data['message'],
            'order_id' => $data['order_id'] ?? null,
            'worker_id' => $data['worker_id'] ?? null,
            'material_id' => $data['material_id'] ?? null,
            'priority' => $data['priority'] ?? 'medium',
            'data' => json_encode($data['data'] ?? []),
            'is_read' => false
        ]);
    }
}