<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'log_name',
        'description',
        'subject_type',
        'subject_id',
        'causer_type',
        'causer_id',
        'properties',
        'event',
        'batch_uuid',
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * علاقة مع الكائن المتأثر
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * علاقة مع المستخدم المسبب
     */
    public function causer(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * الحصول على تفاصيل التغيير
     */
    public function getChanges(): array
    {
        return $this->properties['attributes'] ?? [];
    }

    /**
     * الحصول على القيم السابقة
     */
    public function getOldValues(): array
    {
        return $this->properties['old'] ?? [];
    }

    /**
     * فحص ما إذا كان النشاط من نوع معين
     */
    public function isEvent(string $event): bool
    {
        return $this->event === $event;
    }

    /**
     * الحصول على الأنشطة حسب المستخدم
     */
    public static function forUser($user)
    {
        return static::where('causer_type', get_class($user))
            ->where('causer_id', $user->id);
    }

    /**
     * الحصول على الأنشطة حسب النوع
     */
    public static function forSubject($subject)
    {
        return static::where('subject_type', get_class($subject))
            ->where('subject_id', $subject->id);
    }

    /**
     * الحصول على الأنشطة حسب اسم السجل
     */
    public static function inLog(string $logName)
    {
        return static::where('log_name', $logName);
    }

    /**
     * الحصول على أنشطة الأمان
     */
    public static function securityEvents()
    {
        return static::whereIn('log_name', [
            'authentication',
            'authorization',
            'permission_violation',
            'security_breach'
        ]);
    }

    /**
     * تنسيق الوصف للعرض
     */
    public function getFormattedDescriptionAttribute(): string
    {
        $description = $this->description;
        
        // استبدال المتغيرات في الوصف
        if ($this->causer) {
            $description = str_replace(
                ':causer',
                $this->causer->name ?? 'Unknown',
                $description
            );
        }

        if ($this->subject) {
            $subjectName = $this->subject->name ?? 
                          $this->subject->title ?? 
                          class_basename($this->subject) . ' #' . $this->subject->id;
            
            $description = str_replace(':subject', $subjectName, $description);
        }

        return $description;
    }

    /**
     * الحصول على مستوى الخطورة
     */
    public function getSeverityLevel(): string
    {
        return match($this->log_name) {
            'authentication' => 'medium',
            'authorization' => 'high',
            'permission_violation' => 'high',
            'security_breach' => 'critical',
            'data_modification' => 'medium',
            'system_change' => 'high',
            default => 'low'
        };
    }
}