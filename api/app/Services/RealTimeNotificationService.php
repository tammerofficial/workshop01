<?php

namespace App\Services;

use App\Models\RealTimeNotification;
use App\Models\Worker;
use App\Models\User;
use App\Models\WorkerStageAssignment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class RealTimeNotificationService
{
    /**
     * 📤 إرسال إشعار فوري
     */
    public function send($title, $message, $recipients, $options = [])
    {
        $defaultOptions = [
            'type' => 'system_alert',
            'priority' => 'normal',
            'show_popup' => false,
            'play_sound' => false,
            'send_push' => true,
            'send_in_app' => true,
            'expires_in_hours' => 24,
            'data' => []
        ];

        $options = array_merge($defaultOptions, $options);

        // تحديد المستقبلين
        $recipientList = $this->resolveRecipients($recipients);
        $notifications = [];

        foreach ($recipientList as $recipient) {
            $notification = RealTimeNotification::create([
                'title' => $title,
                'message' => $message,
                'type' => $options['type'],
                'recipient_type' => $recipient['type'],
                'recipient_user_id' => $recipient['user_id'] ?? null,
                'recipient_worker_id' => $recipient['worker_id'] ?? null,
                'priority' => $options['priority'],
                'data' => $options['data'],
                'show_popup' => $options['show_popup'],
                'play_sound' => $options['play_sound'],
                'send_push' => $options['send_push'],
                'send_in_app' => $options['send_in_app'],
                'expires_at' => now()->addHours($options['expires_in_hours']),
                'color' => $options['color'] ?? $this->getPriorityColor($options['priority']),
                'icon' => $options['icon'] ?? $this->getTypeIcon($options['type']),
                'sender_system' => 'Workflow Engine'
            ]);

            $notifications[] = $notification;

            // إرسال فوري للمستقبلين النشطين
            $this->deliverNotification($notification);
        }

        return $notifications;
    }

    /**
     * 🎯 إشعار تخصيص مهمة
     */
    public function notifyTaskAssigned($workerId, $taskId, $orderData)
    {
        $worker = Worker::find($workerId);
        if (!$worker) return null;

        return $this->send(
            'مهمة جديدة مخصصة لك',
            "تم تخصيص مهمة {$orderData['stage']} للطلبية #{$orderData['order_id']} لك",
            ['worker' => $workerId],
            [
                'type' => 'task_assigned',
                'priority' => $orderData['priority'] ?? 'normal',
                'show_popup' => true,
                'play_sound' => true,
                'color' => '#10B981',
                'action_url' => "/ipad/dashboard?worker_id={$workerId}",
                'action_text' => 'عرض المهمة',
                'data' => $orderData
            ]
        );
    }

    /**
     * ✅ إشعار إكمال مهمة
     */
    public function notifyTaskCompleted($workerId, $taskData, $nextWorkerData = null)
    {
        $notifications = [];

        // إشعار العامل الذي أكمل المهمة
        $notifications[] = $this->send(
            'تم إكمال المهمة بنجاح! 🎉',
            "تم إكمال مهمة {$taskData['stage']} للطلبية #{$taskData['order_id']}",
            ['worker' => $workerId],
            [
                'type' => 'task_completed',
                'priority' => 'normal',
                'show_popup' => true,
                'color' => '#10B981',
                'data' => $taskData
            ]
        );

        // إشعار العامل التالي إن وجد
        if ($nextWorkerData) {
            $notifications[] = $this->notifyTaskAssigned(
                $nextWorkerData['worker_id'],
                $nextWorkerData['task_id'],
                $nextWorkerData
            );
        }

        return $notifications;
    }

    /**
     * 🚨 إشعار طلبية عاجلة
     */
    public function notifyUrgentOrder($orderId, $stageId = null)
    {
        $recipients = $stageId ? 
            ['stage_workers' => $stageId] : 
            ['role' => 'Worker'];

        return $this->send(
            'طلبية عاجلة! 🚨',
            "الطلبية #{$orderId} تحتاج معالجة فورية",
            $recipients,
            [
                'type' => 'urgent_order',
                'priority' => 'urgent',
                'show_popup' => true,
                'play_sound' => true,
                'color' => '#EF4444',
                'data' => ['order_id' => $orderId, 'stage_id' => $stageId]
            ]
        );
    }

    /**
     * ⚠️ إشعار مشكلة جودة
     */
    public function notifyQualityIssue($workerId, $taskId, $issue, $qualityScore)
    {
        return $this->send(
            'مشكلة في الجودة',
            "المهمة #{$taskId} تحتاج إعادة عمل. السبب: {$issue}",
            ['worker' => $workerId],
            [
                'type' => 'quality_issue',
                'priority' => 'high',
                'show_popup' => true,
                'play_sound' => true,
                'color' => '#F59E0B',
                'action_url' => "/ipad/dashboard?worker_id={$workerId}",
                'action_text' => 'مراجعة المهمة',
                'data' => [
                    'task_id' => $taskId,
                    'issue' => $issue,
                    'quality_score' => $qualityScore
                ]
            ]
        );
    }

    /**
     * 🏆 إشعار إنجاز أو تميز
     */
    public function notifyAchievement($workerId, $achievement, $details = [])
    {
        return $this->send(
            'إنجاز جديد! 🏆',
            $achievement,
            ['worker' => $workerId],
            [
                'type' => 'achievement',
                'priority' => 'normal',
                'show_popup' => true,
                'play_sound' => true,
                'color' => '#8B5CF6',
                'data' => $details
            ]
        );
    }

    /**
     * ⏰ إشعار تذكير استراحة
     */
    public function notifyBreakReminder($workerId, $workHours)
    {
        return $this->send(
            'وقت الاستراحة ☕',
            "لقد عملت {$workHours} ساعات. حان وقت الاستراحة!",
            ['worker' => $workerId],
            [
                'type' => 'break_reminder',
                'priority' => 'normal',
                'show_popup' => true,
                'color' => '#F59E0B',
                'action_text' => 'أخذ استراحة',
                'data' => ['work_hours' => $workHours]
            ]
        );
    }

    /**
     * ⏱️ إشعار تحذير موعد إنجاز
     */
    public function notifyDeadlineWarning($workerId, $taskId, $remainingHours)
    {
        $urgency = $remainingHours <= 1 ? 'urgent' : 'high';
        $color = $remainingHours <= 1 ? '#EF4444' : '#F59E0B';

        return $this->send(
            'تحذير موعد الإنجاز ⏰',
            "المهمة #{$taskId} يجب إنجازها خلال {$remainingHours} ساعة",
            ['worker' => $workerId],
            [
                'type' => 'deadline_warning',
                'priority' => $urgency,
                'show_popup' => $remainingHours <= 1,
                'play_sound' => $remainingHours <= 1,
                'color' => $color,
                'data' => [
                    'task_id' => $taskId,
                    'remaining_hours' => $remainingHours
                ]
            ]
        );
    }

    /**
     * 📊 إشعار تحديث أداء
     */
    public function notifyPerformanceUpdate($workerId, $performanceData)
    {
        $isGoodPerformance = $performanceData['efficiency'] >= 100 && $performanceData['quality'] >= 8;
        
        $title = $isGoodPerformance ? 'أداء ممتاز! 🌟' : 'تحديث الأداء';
        $message = "كفاءتك اليوم: {$performanceData['efficiency']}% | الجودة: {$performanceData['quality']}/10";
        
        return $this->send(
            $title,
            $message,
            ['worker' => $workerId],
            [
                'type' => 'performance_alert',
                'priority' => 'normal',
                'color' => $isGoodPerformance ? '#10B981' : '#3B82F6',
                'data' => $performanceData
            ]
        );
    }

    /**
     * 👥 إشعار للمدراء
     */
    public function notifyManagers($title, $message, $priority = 'normal', $data = [])
    {
        return $this->send(
            $title,
            $message,
            ['role' => 'Administrator'],
            [
                'type' => 'manager_alert',
                'priority' => $priority,
                'show_popup' => $priority === 'urgent',
                'data' => $data
            ]
        );
    }

    /**
     * 🔧 تحليل المستقبلين
     */
    private function resolveRecipients($recipients)
    {
        $recipientList = [];

        if (isset($recipients['worker'])) {
            $recipientList[] = [
                'type' => 'worker',
                'worker_id' => $recipients['worker']
            ];
        }

        if (isset($recipients['user'])) {
            $recipientList[] = [
                'type' => 'worker',
                'user_id' => $recipients['user']
            ];
        }

        if (isset($recipients['stage_workers'])) {
            $stageWorkers = WorkerStageAssignment::where('stage_id', $recipients['stage_workers'])
                ->where('is_active', true)
                ->where('availability_status', 'available')
                ->get();

            foreach ($stageWorkers as $assignment) {
                $recipientList[] = [
                    'type' => 'worker',
                    'worker_id' => $assignment->worker_id
                ];
            }
        }

        if (isset($recipients['role'])) {
            $roleUsers = User::whereHas('roles', function ($q) use ($recipients) {
                $q->where('name', $recipients['role']);
            })->get();

            foreach ($roleUsers as $user) {
                $recipientList[] = [
                    'type' => 'worker',
                    'user_id' => $user->id
                ];
            }
        }

        if (isset($recipients['all_workers'])) {
            $allWorkers = Worker::where('is_active', true)->get();
            
            foreach ($allWorkers as $worker) {
                $recipientList[] = [
                    'type' => 'worker',
                    'worker_id' => $worker->id
                ];
            }
        }

        return $recipientList;
    }

    /**
     * 📱 تسليم الإشعار
     */
    private function deliverNotification($notification)
    {
        try {
            // تحديث حالة الإشعار إلى "مرسل"
            $notification->update([
                'status' => 'sent',
                'sent_at' => now()
            ]);

            // إضافة للكاش للحصول السريع
            $this->cacheNotificationForUser($notification);

            // محاولة التسليم الفوري
            $this->attemptRealTimeDelivery($notification);

            Log::info("تم إرسال إشعار #{$notification->id} بنجاح");

        } catch (\Exception $e) {
            $notification->update(['status' => 'failed']);
            Log::error("فشل إرسال الإشعار #{$notification->id}: " . $e->getMessage());
        }
    }

    /**
     * ⚡ محاولة التسليم الفوري
     */
    private function attemptRealTimeDelivery($notification)
    {
        // WebSocket/Pusher delivery (سيتم تطويره لاحقاً)
        // Push notification delivery
        // Email delivery if enabled
        
        // للآن، نحفظ في الكاش للوصول السريع
        $notification->markAsDelivered();
    }

    /**
     * 💾 حفظ الإشعار في الكاش
     */
    private function cacheNotificationForUser($notification)
    {
        $cacheKey = "user_notifications_{$notification->recipient_user_id}_{$notification->recipient_worker_id}";
        $cached = Cache::get($cacheKey, []);
        
        $cached[] = [
            'id' => $notification->id,
            'title' => $notification->title,
            'message' => $notification->getFormattedMessage(),
            'type' => $notification->type,
            'priority' => $notification->priority,
            'color' => $notification->color,
            'icon' => $notification->getTypeIcon(),
            'time_ago' => $notification->getTimeAgo(),
            'is_read' => false,
            'show_popup' => $notification->show_popup,
            'play_sound' => $notification->play_sound
        ];

        // الاحتفاظ بآخر 50 إشعار فقط
        $cached = array_slice($cached, -50);
        
        Cache::put($cacheKey, $cached, 3600); // ساعة واحدة
    }

    /**
     * 📋 الحصول على إشعارات المستخدم
     */
    public function getUserNotifications($userId = null, $workerId = null, $limit = 20)
    {
        $query = RealTimeNotification::active()
            ->orderByDesc('created_at')
            ->limit($limit);

        if ($userId) {
            $query->where('recipient_user_id', $userId);
        }

        if ($workerId) {
            $query->where('recipient_worker_id', $workerId);
        }

        return $query->get()->map(function ($notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->getFormattedMessage(),
                'type' => $notification->type,
                'priority' => $notification->priority,
                'color' => $notification->getPriorityColor(),
                'icon' => $notification->getTypeIcon(),
                'time_ago' => $notification->getTimeAgo(),
                'is_read' => !is_null($notification->read_at),
                'action_url' => $notification->action_url,
                'action_text' => $notification->action_text,
                'created_at' => $notification->created_at
            ];
        });
    }

    /**
     * ✅ تحديد الإشعار كمقروء
     */
    public function markAsRead($notificationId, $userId = null, $workerId = null)
    {
        $query = RealTimeNotification::where('id', $notificationId);

        if ($userId) {
            $query->where('recipient_user_id', $userId);
        }

        if ($workerId) {
            $query->where('recipient_worker_id', $workerId);
        }

        $notification = $query->first();
        
        if ($notification) {
            $notification->markAsRead();
            return true;
        }

        return false;
    }

    /**
     * 📊 إحصائيات الإشعارات
     */
    public function getNotificationStats($userId = null, $workerId = null)
    {
        $query = RealTimeNotification::active();

        if ($userId) {
            $query->where('recipient_user_id', $userId);
        }

        if ($workerId) {
            $query->where('recipient_worker_id', $workerId);
        }

        return [
            'total' => $query->count(),
            'unread' => $query->clone()->unread()->count(),
            'urgent' => $query->clone()->byPriority('urgent')->count(),
            'today' => $query->clone()->whereDate('created_at', today())->count()
        ];
    }

    // دوال مساعدة
    private function getPriorityColor($priority)
    {
        $colors = [
            'low' => '#6B7280',
            'normal' => '#3B82F6',
            'high' => '#F59E0B',
            'urgent' => '#EF4444',
            'critical' => '#DC2626'
        ];
        
        return $colors[$priority] ?? $colors['normal'];
    }

    private function getTypeIcon($type)
    {
        $icons = [
            'task_assigned' => 'clipboard-check',
            'task_completed' => 'check-circle',
            'urgent_order' => 'exclamation-triangle',
            'quality_issue' => 'shield-exclamation',
            'achievement' => 'award',
            'break_reminder' => 'coffee',
            'deadline_warning' => 'clock',
            'performance_alert' => 'trending-up'
        ];
        
        return $icons[$type] ?? 'bell';
    }
}