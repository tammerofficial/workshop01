<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Station;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        return response()->json(Station::all());
    }

    /**
     * Get available stations.
     */
    public function getAvailable(): JsonResponse
    {
        $stations = Station::where('is_active', true)
                           ->where('status', 'available')
                           ->get();
        return response()->json($stations);
    }
}
