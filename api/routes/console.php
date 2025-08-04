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

// Alternative: run every 30 minutes
// Schedule::command('workers:sync-scheduled')->everyThirtyMinutes();
