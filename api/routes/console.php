<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule automatic worker synchronization
Schedule::command('workers:sync-scheduled')
    ->hourly() // كل ساعة
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/workers-sync.log'));

// 🚀 جدولة الإدارة التلقائية للتدفق
Schedule::command('workflow:auto-manage --mode=assignments')
    ->everyFiveMinutes() // كل 5 دقائق - تخصيصات سريعة
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/workflow-auto.log'));

Schedule::command('workflow:auto-manage --mode=performance')
    ->everyThirtyMinutes() // كل 30 دقيقة - تحليل الأداء
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/workflow-performance.log'));

Schedule::command('workflow:auto-manage --mode=full')
    ->hourly() // كل ساعة - إدارة شاملة
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/workflow-full.log'));

Schedule::command('workflow:auto-manage --mode=summary')
    ->dailyAt('23:30') // يومياً في 11:30 مساءً - الملخص اليومي
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/daily-summary.log'));
