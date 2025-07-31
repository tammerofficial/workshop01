<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use App\Models\Measurement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MeasurementController extends Controller
{
    public function index(): JsonResponse
    {
        $measurements = Measurement::with(['client', 'order'])->get();
        return response()->json($measurements);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'order_id' => 'nullable|exists:orders,id',
            'chest' => 'nullable|numeric|min:0',
            'waist' => 'nullable|numeric|min:0',
            'hip' => 'nullable|numeric|min:0',
            'shoulder' => 'nullable|numeric|min:0',
            'arm_length' => 'nullable|numeric|min:0',
            'leg_length' => 'nullable|numeric|min:0',
            'neck' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $measurement = Measurement::create($request->all());
        return response()->json($measurement->load(['client', 'order']), 201);
    }

    public function show(Measurement $measurement): JsonResponse
    {
        return response()->json($measurement->load(['client', 'order']));
    }

    public function update(Request $request, Measurement $measurement): JsonResponse
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'order_id' => 'nullable|exists:orders,id',
            'chest' => 'nullable|numeric|min:0',
            'waist' => 'nullable|numeric|min:0',
            'hip' => 'nullable|numeric|min:0',
            'shoulder' => 'nullable|numeric|min:0',
            'arm_length' => 'nullable|numeric|min:0',
            'leg_length' => 'nullable|numeric|min:0',
            'neck' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $measurement->update($request->all());
        return response()->json($measurement->load(['client', 'order']));
    }

    public function destroy(Measurement $measurement): JsonResponse
    {
        $measurement->delete();
        return response()->json(['message' => 'Measurement deleted successfully']);
    }

    public function getByClient($clientId): JsonResponse
    {
        $measurements = Measurement::where('client_id', $clientId)
                                  ->with(['client', 'order'])
                                  ->get();
        return response()->json($measurements);
    }
} 