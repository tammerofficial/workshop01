<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Worker;
use App\Models\Material;
use App\Models\ProductionStage;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdvancedFeaturesController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * AI Worker Assignment Engine
     */
    public function aiWorkerAssignment(Order $order, ProductionStage $stage): JsonResponse
    {
        // Get available workers for this stage
        $availableWorkers = Worker::where('is_active', true)
            ->where('status', 'available')
            ->get();

        $recommendations = [];

        foreach ($availableWorkers as $worker) {
            $efficiency = $this->calculateWorkerEfficiency($worker, $stage);
            $workload = $this->calculateWorkerWorkload($worker);
            $skillMatch = $this->calculateSkillMatch($worker, $stage);
            
            $score = ($efficiency * 0.4) + ($skillMatch * 0.4) + ((100 - $workload) * 0.2);
            
            $recommendations[] = [
                'worker_id' => $worker->id,
                'worker_name' => $worker->name,
                'score' => round($score, 2),
                'efficiency' => $efficiency,
                'workload' => $workload,
                'skill_match' => $skillMatch,
                'estimated_completion_hours' => $this->estimateCompletionTime($worker, $stage)
            ];
        }

        // Sort by score (highest first)
        usort($recommendations, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        return response()->json([
            'order_id' => $order->id,
            'stage_id' => $stage->id,
            'recommendations' => array_slice($recommendations, 0, 5), // Top 5
            'ai_suggestion' => $recommendations[0] ?? null
        ]);
    }

    /**
     * Predictive Analytics Dashboard
     */
    public function predictiveAnalytics(): JsonResponse
    {
        $predictions = [
            'order_completion' => $this->predictOrderCompletion(),
            'material_shortage' => $this->predictMaterialShortage(),
            'production_bottlenecks' => $this->identifyBottlenecks(),
            'demand_forecast' => $this->forecastDemand(),
            'efficiency_trends' => $this->analyzeEfficiencyTrends()
        ];

        return response()->json($predictions);
    }

    /**
     * Smart Production Optimization
     */
    public function optimizeProduction(): JsonResponse
    {
        $optimization = [
            'stage_reordering' => $this->optimizeStageOrder(),
            'worker_redistribution' => $this->optimizeWorkerDistribution(),
            'material_allocation' => $this->optimizeMaterialAllocation(),
            'bottleneck_solutions' => $this->suggestBottleneckSolutions(),
            'cost_reduction' => $this->suggestCostReductions()
        ];

        return response()->json($optimization);
    }

    /**
     * Quality Prediction System
     */
    public function predictQuality(Order $order): JsonResponse
    {
        $qualityFactors = [
            'worker_performance' => $this->analyzeWorkerQualityHistory($order),
            'material_quality' => $this->analyzeMaterialQuality($order),
            'stage_complexity' => $this->analyzeStageComplexity($order),
            'time_pressure' => $this->analyzeTimePressure($order)
        ];

        $predictedQuality = $this->calculateQualityScore($qualityFactors);
        $riskFactors = $this->identifyQualityRisks($qualityFactors);

        return response()->json([
            'order_id' => $order->id,
            'predicted_quality_score' => $predictedQuality,
            'risk_level' => $this->determineRiskLevel($predictedQuality),
            'quality_factors' => $qualityFactors,
            'risk_factors' => $riskFactors,
            'recommendations' => $this->generateQualityRecommendations($predictedQuality, $riskFactors)
        ]);
    }

    /**
     * Calculate worker efficiency for specific stage
     */
    private function calculateWorkerEfficiency(Worker $worker, ProductionStage $stage): float
    {
        // Get worker's historical performance for this stage type
        $completedTasks = DB::table('order_production_tracking')
            ->where('worker_id', $worker->id)
            ->where('production_stage_id', $stage->id)
            ->where('status', 'completed')
            ->get();

        if ($completedTasks->isEmpty()) {
            return 75; // Default efficiency for new workers
        }

        $totalEfficiency = 0;
        foreach ($completedTasks as $task) {
            $efficiency = $task->quality_score ?? 7;
            $totalEfficiency += ($efficiency / 10) * 100;
        }

        return $totalEfficiency / $completedTasks->count();
    }

    /**
     * Calculate current worker workload
     */
    private function calculateWorkerWorkload(Worker $worker): float
    {
        $activeTasks = DB::table('order_production_tracking')
            ->where('worker_id', $worker->id)
            ->where('status', 'in_progress')
            ->count();

        return min($activeTasks * 25, 100); // Each task = 25% workload
    }

    /**
     * Calculate skill match between worker and stage
     */
    private function calculateSkillMatch(Worker $worker, ProductionStage $stage): float
    {
        $workerSkills = json_decode($worker->skills ?? '[]', true);
        $stageRequiredSkills = ['cutting', 'sewing', 'finishing', 'design']; // Example skills

        if (empty($workerSkills)) {
            return 50; // Default skill match
        }

        $matchCount = count(array_intersect($workerSkills, $stageRequiredSkills));
        return ($matchCount / count($stageRequiredSkills)) * 100;
    }

    /**
     * Estimate completion time for worker-stage combination
     */
    private function estimateCompletionTime(Worker $worker, ProductionStage $stage): float
    {
        $avgTime = DB::table('order_production_tracking')
            ->where('worker_id', $worker->id)
            ->where('production_stage_id', $stage->id)
            ->where('status', 'completed')
            ->avg('hours_worked');

        return $avgTime ?? $stage->estimated_hours ?? 4;
    }

    /**
     * Predict order completion times
     */
    private function predictOrderCompletion(): array
    {
        $activeOrders = Order::where('status', 'in_progress')->get();
        $predictions = [];

        foreach ($activeOrders as $order) {
            $remainingStages = ProductionStage::whereNotIn('id', function($query) use ($order) {
                $query->select('production_stage_id')
                      ->from('order_production_tracking')
                      ->where('order_id', $order->id)
                      ->where('status', 'completed');
            })->get();

            $estimatedHours = $remainingStages->sum('estimated_hours');
            $completionDate = now()->addHours($estimatedHours);

            $predictions[] = [
                'order_id' => $order->id,
                'order_title' => $order->title,
                'estimated_completion' => $completionDate,
                'remaining_hours' => $estimatedHours,
                'on_time_probability' => $this->calculateOnTimeProbability($order, $completionDate)
            ];
        }

        return $predictions;
    }

    /**
     * Predict material shortages
     */
    private function predictMaterialShortage(): array
    {
        $materials = Material::where('is_active', true)->get();
        $shortages = [];

        foreach ($materials as $material) {
            $currentStock = $material->quantity;
            $reservedQuantity = DB::table('material_reservations')
                ->where('material_id', $material->id)
                ->where('status', 'reserved')
                ->sum('quantity_reserved');

            $availableStock = $currentStock - $reservedQuantity;
            $dailyUsage = $this->calculateDailyUsage($material);
            $daysUntilShortage = $dailyUsage > 0 ? $availableStock / $dailyUsage : 999;

            if ($daysUntilShortage < 30) {
                $shortages[] = [
                    'material_id' => $material->id,
                    'material_name' => $material->name,
                    'current_stock' => $currentStock,
                    'available_stock' => $availableStock,
                    'days_until_shortage' => round($daysUntilShortage, 1),
                    'recommended_order_quantity' => $dailyUsage * 30,
                    'urgency' => $daysUntilShortage < 7 ? 'high' : 'medium'
                ];
            }
        }

        return $shortages;
    }

    /**
     * Calculate daily material usage
     */
    private function calculateDailyUsage(Material $material): float
    {
        $thirtyDaysAgo = now()->subDays(30);
        $usage = DB::table('material_reservations')
            ->where('material_id', $material->id)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->sum('quantity_used');

        return $usage / 30;
    }

    /**
     * Identify production bottlenecks
     */
    private function identifyBottlenecks(): array
    {
        $stages = ProductionStage::all();
        $bottlenecks = [];

        foreach ($stages as $stage) {
            $avgCompletionTime = DB::table('order_production_tracking')
                ->where('production_stage_id', $stage->id)
                ->where('status', 'completed')
                ->avg('hours_worked');

            $expectedTime = $stage->estimated_hours;
            $overrun = $avgCompletionTime > $expectedTime ? 
                (($avgCompletionTime - $expectedTime) / $expectedTime) * 100 : 0;

            if ($overrun > 20) { // More than 20% overrun
                $bottlenecks[] = [
                    'stage_id' => $stage->id,
                    'stage_name' => $stage->name,
                    'expected_hours' => $expectedTime,
                    'actual_avg_hours' => round($avgCompletionTime, 2),
                    'overrun_percentage' => round($overrun, 2),
                    'affected_orders' => $this->getAffectedOrders($stage),
                    'suggested_solutions' => $this->suggestBottleneckSolutions($stage)
                ];
            }
        }

        return $bottlenecks;
    }

    /**
     * Forecast demand patterns
     */
    private function forecastDemand(): array
    {
        $pastMonths = DB::table('orders')
            ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'), DB::raw('COUNT(*) as order_count'))
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $forecast = [];
        $trend = $this->calculateTrend($pastMonths->pluck('order_count')->toArray());

        for ($i = 1; $i <= 3; $i++) {
            $forecastMonth = now()->addMonths($i);
            $predictedOrders = $this->predictMonthlyOrders($pastMonths, $trend, $i);
            
            $forecast[] = [
                'month' => $forecastMonth->format('Y-m'),
                'predicted_orders' => round($predictedOrders),
                'confidence' => $this->calculateConfidence($pastMonths),
                'seasonal_factor' => $this->getSeasonalFactor($forecastMonth->month)
            ];
        }

        return $forecast;
    }

    /**
     * Analyze efficiency trends
     */
    private function analyzeEfficiencyTrends(): array
    {
        $months = [];
        for ($i = 6; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $efficiency = $this->calculateMonthlyEfficiency($month);
            
            $months[] = [
                'month' => $month->format('Y-m'),
                'efficiency' => $efficiency,
                'orders_completed' => $this->getMonthlyCompletedOrders($month),
                'avg_completion_time' => $this->getMonthlyAvgTime($month)
            ];
        }

        $trend = $this->calculateEfficiencyTrend($months);

        return [
            'monthly_data' => $months,
            'trend' => $trend,
            'prediction_next_month' => $this->predictNextMonthEfficiency($months),
            'improvement_suggestions' => $this->suggestEfficiencyImprovements($trend)
        ];
    }

    // Helper methods for calculations would continue here...
    private function calculateOnTimeProbability($order, $completionDate): float
    {
        if (!$order->due_date) return 50;
        
        $daysDifference = $completionDate->diffInDays($order->due_date, false);
        
        if ($daysDifference >= 0) return 90; // Early completion
        if ($daysDifference >= -2) return 70; // Slightly late
        if ($daysDifference >= -5) return 40; // Moderately late
        return 10; // Very late
    }

    private function calculateTrend($data): float
    {
        if (count($data) < 2) return 0;
        
        $sum = array_sum($data);
        $count = count($data);
        $avg = $sum / $count;
        
        $recent = array_slice($data, -3);
        $recentAvg = array_sum($recent) / count($recent);
        
        return ($recentAvg - $avg) / $avg * 100;
    }

    private function calculateMonthlyEfficiency($month): float
    {
        $startOfMonth = $month->startOfMonth()->copy();
        $endOfMonth = $month->endOfMonth()->copy();
        
        $completedTasks = DB::table('order_production_tracking')
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$startOfMonth, $endOfMonth])
            ->avg('quality_score');

        return ($completedTasks / 10) * 100 ?? 75;
    }

    private function getAffectedOrders($stage): int
    {
        return DB::table('order_production_tracking')
            ->where('production_stage_id', $stage->id)
            ->where('status', 'in_progress')
            ->count();
    }

    private function suggestBottleneckSolutions($stage): array
    {
        return [
            'Add more workers to this stage',
            'Provide additional training',
            'Upgrade tools and equipment',
            'Optimize the process workflow'
        ];
    }

    // Additional helper methods would be implemented here...
    private function predictMonthlyOrders($pastMonths, $trend, $monthsAhead): float
    {
        $latest = $pastMonths->last();
        $baseOrders = $latest ? $latest->order_count : 10;
        $trendAdjustment = ($trend / 100) * $monthsAhead;
        
        return $baseOrders * (1 + $trendAdjustment);
    }

    private function calculateConfidence($pastMonths): float
    {
        $variance = $this->calculateVariance($pastMonths->pluck('order_count')->toArray());
        return max(50, 100 - ($variance * 2)); // Lower variance = higher confidence
    }

    private function calculateVariance($data): float
    {
        if (count($data) < 2) return 0;
        
        $mean = array_sum($data) / count($data);
        $sum = 0;
        
        foreach ($data as $value) {
            $sum += pow($value - $mean, 2);
        }
        
        return $sum / count($data);
    }

    private function getSeasonalFactor($month): float
    {
        // Simple seasonal factors (could be more sophisticated)
        $factors = [
            1 => 0.8, 2 => 0.9, 3 => 1.1, 4 => 1.2,
            5 => 1.3, 6 => 1.1, 7 => 0.9, 8 => 0.8,
            9 => 1.0, 10 => 1.2, 11 => 1.4, 12 => 1.3
        ];
        
        return $factors[$month] ?? 1.0;
    }

    private function getMonthlyCompletedOrders($month): int
    {
        return DB::table('orders')
            ->whereYear('created_at', $month->year)
            ->whereMonth('created_at', $month->month)
            ->where('status', 'completed')
            ->count();
    }

    private function getMonthlyAvgTime($month): float
    {
        return DB::table('order_production_tracking')
            ->whereYear('completed_at', $month->year)
            ->whereMonth('completed_at', $month->month)
            ->where('status', 'completed')
            ->avg('hours_worked') ?? 0;
    }

    private function calculateEfficiencyTrend($months): string
    {
        if (count($months) < 2) return 'stable';
        
        $first = $months[0]['efficiency'];
        $last = end($months)['efficiency'];
        
        $change = (($last - $first) / $first) * 100;
        
        if ($change > 5) return 'improving';
        if ($change < -5) return 'declining';
        return 'stable';
    }

    private function predictNextMonthEfficiency($months): float
    {
        $recent = array_slice($months, -3);
        $avgEfficiency = array_sum(array_column($recent, 'efficiency')) / count($recent);
        
        return round($avgEfficiency, 1);
    }

    private function suggestEfficiencyImprovements($trend): array
    {
        $suggestions = [
            'improving' => [
                'Continue current practices',
                'Document successful processes',
                'Consider expanding successful methods'
            ],
            'stable' => [
                'Analyze workflow for optimization opportunities',
                'Provide additional training',
                'Upgrade equipment where needed'
            ],
            'declining' => [
                'Immediate workflow review required',
                'Worker performance evaluation',
                'Equipment maintenance check',
                'Process re-training needed'
            ]
        ];
        
        return $suggestions[$trend] ?? $suggestions['stable'];
    }

    // Quality prediction helper methods
    private function analyzeWorkerQualityHistory($order): float
    {
        $assignedWorker = $order->worker;
        if (!$assignedWorker) return 75;

        $avgQuality = DB::table('order_production_tracking')
            ->where('worker_id', $assignedWorker->id)
            ->where('status', 'completed')
            ->avg('quality_score');

        return ($avgQuality / 10) * 100 ?? 75;
    }

    private function analyzeMaterialQuality($order): float
    {
        // Analyze the quality of materials used in similar orders
        return 85; // Placeholder - would analyze material suppliers, batch quality, etc.
    }

    private function analyzeStageComplexity($order): float
    {
        $remainingStages = ProductionStage::whereNotIn('id', function($query) use ($order) {
            $query->select('production_stage_id')
                  ->from('order_production_tracking')
                  ->where('order_id', $order->id)
                  ->where('status', 'completed');
        })->get();

        $complexityScore = $remainingStages->avg('estimated_hours') ?? 4;
        return min(100, $complexityScore * 10); // Convert to percentage
    }

    private function analyzeTimePressure($order): float
    {
        if (!$order->due_date) return 50;

        $daysUntilDue = now()->diffInDays($order->due_date, false);
        
        if ($daysUntilDue > 14) return 10; // Low pressure
        if ($daysUntilDue > 7) return 30;   // Medium pressure
        if ($daysUntilDue > 3) return 60;   // High pressure
        return 90; // Very high pressure
    }

    private function calculateQualityScore($factors): float
    {
        $weights = [
            'worker_performance' => 0.3,
            'material_quality' => 0.25,
            'stage_complexity' => 0.25,
            'time_pressure' => 0.2
        ];

        $score = 0;
        foreach ($factors as $factor => $value) {
            $weight = $weights[$factor] ?? 0;
            // Invert time pressure (higher pressure = lower quality prediction)
            $adjustedValue = $factor === 'time_pressure' ? 100 - $value : $value;
            $score += $adjustedValue * $weight;
        }

        return round($score, 1);
    }

    private function determineRiskLevel($qualityScore): string
    {
        if ($qualityScore >= 80) return 'low';
        if ($qualityScore >= 60) return 'medium';
        return 'high';
    }

    private function identifyQualityRisks($factors): array
    {
        $risks = [];
        
        if ($factors['worker_performance'] < 70) {
            $risks[] = 'Worker performance below average';
        }
        
        if ($factors['material_quality'] < 70) {
            $risks[] = 'Material quality concerns';
        }
        
        if ($factors['stage_complexity'] > 80) {
            $risks[] = 'High complexity stages remaining';
        }
        
        if ($factors['time_pressure'] > 70) {
            $risks[] = 'High time pressure';
        }

        return $risks;
    }

    private function generateQualityRecommendations($qualityScore, $riskFactors): array
    {
        $recommendations = [];
        
        if ($qualityScore < 70) {
            $recommendations[] = 'Consider assigning more experienced workers';
            $recommendations[] = 'Increase quality checkpoints';
            $recommendations[] = 'Extend timeline if possible';
        }
        
        if (in_array('High time pressure', $riskFactors)) {
            $recommendations[] = 'Prioritize time-critical stages';
            $recommendations[] = 'Add additional resources';
        }
        
        if (in_array('Worker performance below average', $riskFactors)) {
            $recommendations[] = 'Provide additional supervision';
            $recommendations[] = 'Consider worker reassignment';
        }

        return $recommendations ?: ['Maintain current quality standards'];
    }
}