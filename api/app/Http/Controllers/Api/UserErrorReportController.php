<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\UserErrorReportingService;

class UserErrorReportController extends Controller
{
    private UserErrorReportingService $reportingService;

    public function __construct(UserErrorReportingService $reportingService)
    {
        $this->reportingService = $reportingService;
    }

    /**
     * Submit a user error report
     */
    public function submitReport(Request $request): JsonResponse
    {
        try {
            $result = $this->reportingService->submitErrorReport(
                $request->all(),
                $request
            );

            return response()->json($result, $result['success'] ? 201 : 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to submit error report.',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get user report dashboard data (admin only)
     */
    public function getDashboard(): JsonResponse
    {
        try {
            $data = $this->reportingService->getDashboardData();

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to retrieve dashboard data.',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get report categories and metadata
     */
    public function getReportMetadata(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'categories' => [
                    ['value' => 'bug', 'label' => 'Bug Report', 'description' => 'Something is not working as expected'],
                    ['value' => 'feature_request', 'label' => 'Feature Request', 'description' => 'Suggest a new feature or improvement'],
                    ['value' => 'performance', 'label' => 'Performance Issue', 'description' => 'Slow loading or performance problems'],
                    ['value' => 'ui_issue', 'label' => 'UI/UX Issue', 'description' => 'Problems with the user interface or experience'],
                    ['value' => 'data_issue', 'label' => 'Data Issue', 'description' => 'Incorrect or missing data'],
                    ['value' => 'security', 'label' => 'Security Concern', 'description' => 'Potential security vulnerability or concern'],
                    ['value' => 'other', 'label' => 'Other', 'description' => 'Other issues not covered above'],
                ],
                'severities' => [
                    ['value' => 'low', 'label' => 'Low', 'description' => 'Minor issue that doesn\'t impact usage'],
                    ['value' => 'medium', 'label' => 'Medium', 'description' => 'Moderate issue that impacts some functionality'],
                    ['value' => 'high', 'label' => 'High', 'description' => 'Significant issue that impacts major functionality'],
                    ['value' => 'critical', 'label' => 'Critical', 'description' => 'Severe issue that prevents system usage'],
                ],
                'form_fields' => [
                    'title' => [
                        'required' => true,
                        'max_length' => 200,
                        'placeholder' => 'Brief description of the issue',
                    ],
                    'description' => [
                        'required' => true,
                        'max_length' => 2000,
                        'placeholder' => 'Detailed description of what happened',
                    ],
                    'steps_to_reproduce' => [
                        'required' => false,
                        'max_length' => 1000,
                        'placeholder' => 'Step-by-step instructions to reproduce the issue',
                    ],
                    'expected_behavior' => [
                        'required' => false,
                        'max_length' => 500,
                        'placeholder' => 'What you expected to happen',
                    ],
                    'actual_behavior' => [
                        'required' => false,
                        'max_length' => 500,
                        'placeholder' => 'What actually happened',
                    ],
                    'additional_info' => [
                        'required' => false,
                        'max_length' => 1000,
                        'placeholder' => 'Any additional information that might be helpful',
                    ],
                    'screenshot' => [
                        'required' => false,
                        'max_size' => 5242880, // 5MB in bytes
                        'accepted_formats' => ['png', 'jpg', 'jpeg', 'gif'],
                    ],
                ],
                'rate_limits' => [
                    'max_reports_per_hour' => 10,
                    'message' => 'You can submit up to 10 reports per hour',
                ],
            ],
        ]);
    }
}