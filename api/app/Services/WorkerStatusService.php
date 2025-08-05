<?php

namespace App\Services;

use App\Models\Worker;
use App\Models\Attendance;
use Carbon\Carbon;

class WorkerStatusService
{
    const STATUS_AVAILABLE = 'available';
    const STATUS_BUSY = 'busy';
    const STATUS_ON_BREAK = 'on_break';
    const STATUS_OFFLINE = 'offline';

    /**
     * Get the real-time status of a single worker.
     *
     * @param Worker $worker
     * @return string
     */
    public function getWorkerStatus(Worker $worker): string
    {
        $now = Carbon::now();
        
        // Find the last attendance record for today
        $lastAttendance = Attendance::where('worker_code', $worker->employee_code)
            ->whereDate('date', $now->toDateString())
            ->latest('check_in')
            ->first();

        // If no attendance today, worker is offline
        if (!$lastAttendance) {
            return self::STATUS_OFFLINE;
        }

        // Check if the worker has clocked out
        if ($lastAttendance->check_out) {
            return self::STATUS_OFFLINE;
        }

        // Worker is currently clocked in. Now check if they are on a break.
        // This logic assumes a break is recorded by clocking out and then back in.
        // A more sophisticated system might have a dedicated break start/end time.
        // Let's check for a recent clock-out within the day.
        $lastCheckOutToday = Attendance::where('worker_code', $worker->employee_code)
            ->whereDate('date', $now->toDateString())
            ->whereNotNull('check_out')
            ->latest('check_out')
            ->first();
            
        if ($lastCheckOutToday && $lastCheckOutToday->check_out->gt($lastAttendance->check_in)) {
             // This means they clocked in again after clocking out, so the last "out" was a break.
             // If the last action was a clock-out, they are on break. We need to compare latest actions.
             if ($lastCheckOutToday->check_out > $lastAttendance->check_in) {
                 return self::STATUS_ON_BREAK;
             }
        }


        // Worker is clocked in and not on a break. Check if they have an active task.
        $hasActiveTask = $worker->tasks()->where('status', 'in_progress')->exists();

        if ($hasActiveTask) {
            return self::STATUS_BUSY;
        }

        return self::STATUS_AVAILABLE;
    }

    /**
     * Get a summary of all worker statuses.
     *
     * @return array
     */
    public function getStatusSummary(): array
    {
        $activeWorkers = Worker::where('is_active', true)->get();
        
        $summary = [
            'total_active' => $activeWorkers->count(),
            self::STATUS_AVAILABLE => 0,
            self::STATUS_BUSY => 0,
            self::STATUS_ON_BREAK => 0,
            self::STATUS_OFFLINE => 0,
        ];

        foreach ($activeWorkers as $worker) {
            $status = $this->getWorkerStatus($worker);
            if (isset($summary[$status])) {
                $summary[$status]++;
            }
        }

        return $summary;
    }
}

