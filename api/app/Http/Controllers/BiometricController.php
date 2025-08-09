<?php

namespace App\Http\Controllers;

use App\Models\BiometricRecord;
use App\Models\Worker;
use Illuminate\Http\Request;

class BiometricController extends Controller
{
    public function index()
    {
        try {
            $records = \Schema::hasTable('biometric_records') ? 
                BiometricRecord::with('worker')->orderBy('attendance_date', 'desc')->get() : 
                collect([]);
        } catch (\Exception $e) {
            $records = collect([]);
        }
        
        return view('modules.biometrics.index', compact('records'));
    }

    public function show(BiometricRecord $record)
    {
        $record->load('worker');
        return view('modules.biometrics.show', compact('record'));
    }
}
