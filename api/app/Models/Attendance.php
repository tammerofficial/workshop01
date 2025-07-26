<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'worker_id',
        'attendance_date',
        'check_in_time',
        'check_out_time',
        'break_start',
        'break_end',
        'total_hours',
        'status',
        'device_id',
        'notes'
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'check_in_time' => 'datetime:H:i',
        'check_out_time' => 'datetime:H:i',
        'break_start' => 'datetime:H:i',
        'break_end' => 'datetime:H:i'
    ];

    // Relationships
    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    // Calculate total hours
    public function calculateTotalHours()
    {
        if ($this->check_in_time && $this->check_out_time) {
            $checkIn = \Carbon\Carbon::parse($this->check_in_time);
            $checkOut = \Carbon\Carbon::parse($this->check_out_time);
            
            $totalMinutes = $checkOut->diffInMinutes($checkIn);
            
            // Subtract break time if exists
            if ($this->break_start && $this->break_end) {
                $breakStart = \Carbon\Carbon::parse($this->break_start);
                $breakEnd = \Carbon\Carbon::parse($this->break_end);
                $breakMinutes = $breakEnd->diffInMinutes($breakStart);
                $totalMinutes -= $breakMinutes;
            }
            
            $this->total_hours = round($totalMinutes / 60, 2);
        }
        
        return $this->total_hours;
    }
} 