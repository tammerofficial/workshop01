<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\Worker;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function index()
    {
        try {
            $payrolls = \Schema::hasTable('payrolls') ? 
                Payroll::with('worker')->orderBy('created_at', 'desc')->get() : 
                collect([]);
        } catch (\Exception $e) {
            $payrolls = collect([]);
        }
        
        return view('modules.payroll.index', compact('payrolls'));
    }

    public function show(Payroll $payroll)
    {
        $payroll->load('worker');
        return view('modules.payroll.show', compact('payroll'));
    }
}
