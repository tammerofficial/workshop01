<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class RealTimeNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'message',
        'type',
        'recipient_type',
        'recipient_user_id',
        'recipient_worker_id',
        'recipient_role',
        'custom_recipients',
        'sender_user_id',
        'sender_system',
        'priority',
        'status',
        'data',
        'action_url',
        'action_text',
        'icon',
        'color',
        'show_on_dashboard',
        'show_popup',
        'play_sound',
        'sound_file',
        'scheduled_at',
        'sent_at',
        'delivered_at',
        'read_at',
        'expires_at',
        'retry_count',
        'max_retries',
        'next_retry_at',
        'related_order_id',
        'related_task_id',
        'related_stage_id',
        'send_push',
        'send_email',
        'send_sms',
        'send_in_app',
        'send_desktop',
        'device_token',
        'device_type',
        'delivery_status',
        'view_count',
        'click_count',
        'last_viewed_at',
        'group_key',
        'is_grouped',
        'group_count'
    ];

    protected $casts = [
        'custom_recipients' => 'array',
        'data' => 'array',
        'delivery_status' => 'array',
        'show_on_dashboard' => 'boolean',
        'show_popup' => 'boolean',
        'play_sound' => 'boolean',
        'send_push' => 'boolean',
        'send_email' => 'boolean',
        'send_sms' => 'boolean',
        'send_in_app' => 'boolean',
        'send_desktop' => 'boolean',
        'is_grouped' => 'boolean',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'expires_at' => 'datetime',
        'next_retry_at' => 'datetime',
        'last_viewed_at' => 'datetime'
    ];

    // العلاقات
    public function recipientUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    public function recipientWorker(): BelongsTo
    {
        return $this->belongsTo(Worker::class, 'recipient_worker_id');
    }

    public function senderUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }

    public function relatedOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'related_order_id');
    }

    public function relatedTask(): BelongsTo
    {
        return $this->belongsTo(OrderWorkflowProgress::class, 'related_task_id');
    }

    public function relatedStage(): BelongsTo
    {
        return $this->belongsTo(WorkflowStage::class, 'related_stage_id');
    }

    // المجالات المحلية (Scopes)
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('recipient_user_id', $userId);
    }

    public function scopeForWorker($query, $workerId)
    {
        return $query->where('recipient_worker_id', $workerId);
    }

    public function scopeByPriority($query, $priority = 'high')
    {
        return $query->where('priority', $priority);
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    public function scopeScheduled($query)
    {
        return $query->where('scheduled_at', '<=', now())
            ->where('status', 'pending');
    }

    public function scopeFailedRetries($query)
    {
        return $query->where('status', 'failed')
            ->where('retry_count', '<', 'max_retries')
            ->where(function ($q) {
                $q->whereNull('next_retry_at')
                  ->orWhere('next_retry_at', '<=', now());
            });
    }

    // دوال مساعدة
    public function markAsRead()
    {
        $this->update([
            'status' => 'read',
            'read_at' => now(),
            'view_count' => $this->view_count + 1,
            'last_viewed_at' => now()
        ]);
    }

    public function markAsDelivered()
    {
        $this->update([
            'status' => 'delivered',
            'delivered_at' => now()
        ]);
    }

    public function incrementClick()
    {
        $this->increment('click_count');
        $this->update(['last_viewed_at' => now()]);
    }

    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function canRetry()
    {
        return $this->status === 'failed' && 
               $this->retry_count < $this->max_retries && 
               (!$this->next_retry_at || $this->next_retry_at->isPast());
    }

    public function scheduleRetry()
    {
        $retryDelay = min(300 * pow(2, $this->retry_count), 3600); // Exponential backoff with max 1 hour
        
        $this->update([
            'retry_count' => $this->retry_count + 1,
            'next_retry_at' => now()->addSeconds($retryDelay),
            'status' => 'pending'
        ]);
    }

    public function getFormattedMessage()
    {
        $message = $this->message;
        
        // استبدال المتغيرات في الرسالة
        if ($this->data) {
            foreach ($this->data as $key => $value) {
                $message = str_replace("{{{$key}}}", $value, $message);
            }
        }
        
        return $message;
    }

    public function getPriorityColor()
    {
        $colors = [
            'low' => '#6B7280',
            'normal' => '#3B82F6',
            'high' => '#F59E0B',
            'urgent' => '#EF4444',
            'critical' => '#DC2626'
        ];
        
        return $colors[$this->priority] ?? $colors['normal'];
    }

    public function getTypeIcon()
    {
        $icons = [
            'task_assigned' => 'clipboard-check',
            'task_completed' => 'check-circle',
            'stage_change' => 'arrow-right',
            'urgent_order' => 'exclamation-triangle',
            'quality_issue' => 'shield-exclamation',
            'performance_alert' => 'trending-up',
            'break_reminder' => 'coffee',
            'shift_change' => 'clock',
            'system_alert' => 'bell',
            'achievement' => 'award',
            'deadline_warning' => 'clock',
            'worker_request' => 'user-plus',
            'manager_alert' => 'briefcase',
            'maintenance' => 'tool',
            'emergency' => 'exclamation-circle'
        ];
        
        return $this->icon ?? $icons[$this->type] ?? 'bell';
    }

    public function getTimeAgo()
    {
        if (!$this->created_at) return '';
        
        $diffInMinutes = now()->diffInMinutes($this->created_at);
        
        if ($diffInMinutes < 1) return 'الآن';
        if ($diffInMinutes < 60) return $diffInMinutes . ' دقيقة';
        if ($diffInMinutes < 1440) return round($diffInMinutes / 60) . ' ساعة';
        return round($diffInMinutes / 1440) . ' يوم';
    }

    public function shouldSendNow()
    {
        return $this->status === 'pending' && 
               (!$this->scheduled_at || $this->scheduled_at->isPast()) &&
               !$this->isExpired();
    }

    // دوال إنشاء إشعارات سريعة
    public static function createTaskAssigned($workerId, $taskId, $stageName)
    {
        return self::create([
            'title' => 'مهمة جديدة',
            'message' => "تم تخصيص مهمة {$stageName} لك",
            'type' => 'task_assigned',
            'recipient_type' => 'worker',
            'recipient_worker_id' => $workerId,
            'related_task_id' => $taskId,
            'priority' => 'normal',
            'show_popup' => true,
            'play_sound' => true,
            'color' => '#10B981'
        ]);
    }

    public static function createUrgentOrder($orderId, $priority = 'urgent')
    {
        return self::create([
            'title' => 'طلبية عاجلة',
            'message' => "طلبية #{$orderId} تحتاج معالجة فورية",
            'type' => 'urgent_order',
            'recipient_type' => 'all_workers',
            'related_order_id' => $orderId,
            'priority' => $priority,
            'show_popup' => true,
            'play_sound' => true,
            'color' => '#EF4444'
        ]);
    }

    public static function createQualityIssue($taskId, $workerId, $issue)
    {
        return self::create([
            'title' => 'مشكلة جودة',
            'message' => "تم رفض المهمة بسبب: {$issue}",
            'type' => 'quality_issue',
            'recipient_type' => 'worker',
            'recipient_worker_id' => $workerId,
            'related_task_id' => $taskId,
            'priority' => 'high',
            'show_popup' => true,
            'color' => '#F59E0B'
        ]);
    }

    public static function createAchievement($workerId, $achievement)
    {
        return self::create([
            'title' => 'إنجاز جديد! 🏆',
            'message' => $achievement,
            'type' => 'achievement',
            'recipient_type' => 'worker',
            'recipient_worker_id' => $workerId,
            'priority' => 'normal',
            'show_popup' => true,
            'play_sound' => true,
            'color' => '#8B5CF6'
        ]);
    }
}