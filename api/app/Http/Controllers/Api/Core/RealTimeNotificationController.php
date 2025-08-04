<?php

namespace App\Http\Controllers\Api\Core;

use App\Http\Controllers\Controller;
use App\Services\RealTimeNotificationService;
use Illuminate\Http\Request;

class RealTimeNotificationController extends Controller
{
    protected $notificationService;

    public function __construct(RealTimeNotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * 📋 الحصول على إشعارات المستخدم
     */
    public function index(Request $request)
    {
        $userId = $request->input('user_id');
        $workerId = $request->input('worker_id');
        $limit = $request->input('limit', 20);

        $notifications = $this->notificationService->getUserNotifications($userId, $workerId, $limit);
        $stats = $this->notificationService->getNotificationStats($userId, $workerId);

        return response()->json([
            'success' => true,
            'notifications' => $notifications,
            'stats' => $stats
        ]);
    }

    /**
     * ✅ تحديد إشعار كمقروء
     */
    public function markAsRead(Request $request, $notificationId)
    {
        $userId = $request->input('user_id');
        $workerId = $request->input('worker_id');

        $success = $this->notificationService->markAsRead($notificationId, $userId, $workerId);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'تم تحديد الإشعار كمقروء' : 'لم يتم العثور على الإشعار'
        ]);
    }

    /**
     * 📊 إحصائيات الإشعارات
     */
    public function stats(Request $request)
    {
        $userId = $request->input('user_id');
        $workerId = $request->input('worker_id');

        $stats = $this->notificationService->getNotificationStats($userId, $workerId);

        return response()->json([
            'success' => true,
            'stats' => $stats
        ]);
    }

    /**
     * 📤 إرسال إشعار جديد (للمدراء)
     */
    public function send(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'recipients' => 'required|array',
            'type' => 'sometimes|string',
            'priority' => 'sometimes|in:low,normal,high,urgent,critical'
        ]);

        $notifications = $this->notificationService->send(
            $request->title,
            $request->message,
            $request->recipients,
            $request->only(['type', 'priority', 'show_popup', 'play_sound', 'data'])
        );

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال الإشعار بنجاح',
            'sent_count' => count($notifications)
        ]);
    }
}