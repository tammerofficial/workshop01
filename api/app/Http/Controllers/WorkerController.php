<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use Illuminate\Http\Request;

class WorkerController extends Controller
{
    public function index()
    {
        try {
            $workers = \Schema::hasTable('workers') ? 
                Worker::orderBy('name')->get() : 
                collect([]);
        } catch (\Exception $e) {
            $workers = collect([]);
        }
        
        return view('modules.workers.index', compact('workers'));
    }

    public function create()
    {
        return view('modules.workers.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['nullable','email','max:255'],
            'department' => ['nullable','string','max:255'],
            'specialty' => ['nullable','string','max:255'],
        ]);
        $worker = new Worker($data);
        $worker->employee_id = 'W'.now()->format('His');
        $worker->gender = 'male';
        $worker->department = $worker->department ?: 'General';
        $worker->specialty = $worker->specialty ?: 'Staff';
        $worker->hire_date = now();
        $worker->basic_salary = $worker->basic_salary ?? 0;
        $worker->save();
        return redirect()->route('ui.workers.show', $worker)->with('success', __('Saved successfully'));
    }

    public function show(Worker $worker)
    {
        return view('modules.workers.show', compact('worker'));
    }

    public function edit(Worker $worker)
    {
        return view('modules.workers.edit', compact('worker'));
    }

    public function update(Request $request, Worker $worker)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['nullable','email','max:255'],
            'department' => ['nullable','string','max:255'],
            'specialty' => ['nullable','string','max:255'],
        ]);
        $worker->update($data);
        return redirect()->route('ui.workers.show', $worker)->with('success', __('Updated successfully'));
    }

    public function destroy(Worker $worker)
    {
        $worker->delete();
        return redirect()->route('ui.workers.index')->with('success', __('Deleted successfully'));
    }
}
