<?php

namespace App\Http\Controllers\Api\Production;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\WorkerStatusService;

class WorkflowController extends Controller
{
    protected $workerStatusService;

    public function __construct(WorkerStatusService $workerStatusService)
    {
        $this->workerStatusService = $workerStatusService;
    }

    /**
     * Get the summary of worker statuses.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getWorkerStatusSummary()
    {
        try {
            $summary = $this->workerStatusService->getStatusSummary();
            return response()->json([
                'success' => true,
                'data' => $summary
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve worker status summary.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
