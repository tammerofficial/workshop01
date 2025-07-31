<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Worker;
use App\Models\Material;
use App\Models\Invoice;
use App\Models\Attendance;
use App\Models\Payroll;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ERPController extends Controller
{
    /**
     * Get comprehensive ERP dashboard
     */
    public function getDashboard(): JsonResponse
    {
        $dashboard = [
            'financial_summary' => $this->getFinancialSummary(),
            'production_overview' => $this->getProductionOverview(),
            'inventory_status' => $this->getInventoryStatus(),
            'hr_metrics' => $this->getHRMetrics(),
            'performance_indicators' => $this->getKPIs(),
            'alerts_and_notifications' => $this->getSystemAlerts(),
            'recent_activities' => $this->getRecentActivities()
        ];

        return response()->json($dashboard);
    }

    /**
     * Get financial summary
     */
    private function getFinancialSummary(): array
    {
        $currentMonth = now()->startOfMonth();
        $lastMonth = now()->subMonth()->startOfMonth();

        return [
            'total_revenue' => [
                'current_month' => $this->calculateRevenue($currentMonth, now()),
                'last_month' => $this->calculateRevenue($lastMonth, $currentMonth),
                'growth' => $this->calculateGrowth('revenue', $currentMonth)
            ],
            'total_costs' => [
                'current_month' => $this->calculateCosts($currentMonth, now()),
                'last_month' => $this->calculateCosts($lastMonth, $currentMonth),
                'growth' => $this->calculateGrowth('costs', $currentMonth)
            ],
            'profit_margin' => $this->calculateProfitMargin(),
            'accounts_receivable' => $this->getAccountsReceivable(),
            'cash_flow' => $this->getCashFlowProjection(),
            'payroll_expenses' => $this->getPayrollExpenses()
        ];
    }

    /**
     * Get production overview
     */
    private function getProductionOverview(): array
    {
        return [
            'orders_summary' => [
                'total_orders' => Order::count(),
                'active_orders' => Order::where('status', 'in_progress')->count(),
                'completed_today' => Order::where('status', 'completed')
                    ->whereDate('updated_at', today())->count(),
                'overdue_orders' => Order::where('due_date', '<', now())
                    ->where('status', '!=', 'completed')->count()
            ],
            'production_efficiency' => $this->calculateProductionEfficiency(),
            'capacity_utilization' => $this->calculateCapacityUtilization(),
            'quality_metrics' => $this->getQualityMetrics(),
            'stage_performance' => $this->getStagePerformance()
        ];
    }

    /**
     * Get inventory status
     */
    private function getInventoryStatus(): array
    {
        $materials = Material::where('is_active', true)->get();
        
        return [
            'total_materials' => $materials->count(),
            'low_stock_items' => $materials->where('quantity', '<=', 10)->count(),
            'out_of_stock' => $materials->where('quantity', 0)->count(),
            'inventory_value' => $materials->sum(function($material) {
                return $material->quantity * ($material->cost_per_unit ?? 0);
            }),
            'inventory_turnover' => $this->calculateInventoryTurnover(),
            'material_usage_trends' => $this->getMaterialUsageTrends(),
            'reorder_alerts' => $this->getReorderAlerts()
        ];
    }

    /**
     * Get HR metrics
     */
    private function getHRMetrics(): array
    {
        $workers = Worker::where('is_active', true);
        
        return [
            'total_employees' => $workers->count(),
            'present_today' => $this->getTodayAttendance(),
            'absent_today' => $workers->count() - $this->getTodayAttendance(),
            'overtime_hours' => $this->getOvertimeHours(),
            'average_efficiency' => $this->getAverageWorkerEfficiency(),
            'payroll_summary' => $this->getPayrollSummary(),
            'training_needs' => $this->getTrainingNeeds(),
            'performance_reviews' => $this->getPerformanceReviews()
        ];
    }

    /**
     * Get Key Performance Indicators
     */
    private function getKPIs(): array
    {
        return [
            'overall_efficiency' => $this->calculateOverallEfficiency(),
            'customer_satisfaction' => $this->calculateCustomerSatisfaction(),
            'on_time_delivery' => $this->calculateOnTimeDelivery(),
            'cost_per_order' => $this->calculateCostPerOrder(),
            'revenue_per_employee' => $this->calculateRevenuePerEmployee(),
            'material_waste_percentage' => $this->calculateMaterialWaste(),
            'machine_utilization' => $this->calculateMachineUtilization(),
            'quality_score' => $this->calculateQualityScore()
        ];
    }

    /**
     * Get system alerts
     */
    private function getSystemAlerts(): array
    {
        return [
            'critical_alerts' => $this->getCriticalAlerts(),
            'warnings' => $this->getWarnings(),
            'maintenance_due' => $this->getMaintenanceDue(),
            'compliance_issues' => $this->getComplianceIssues()
        ];
    }

    /**
     * Get recent activities
     */
    private function getRecentActivities(): array
    {
        return [
            'recent_orders' => Order::with('client')->latest()->take(5)->get(),
            'recent_completions' => Order::where('status', 'completed')
                ->with('client')->latest('updated_at')->take(5)->get(),
            'recent_materials' => Material::latest('updated_at')->take(5)->get(),
            'recent_attendance' => Attendance::with('worker')
                ->latest()->take(10)->get()
        ];
    }

    /**
     * Integrated Reports
     */
    public function getIntegratedReport(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date', now()->subMonth());
        $endDate = $request->input('end_date', now());
        
        $report = [
            'period' => [
                'start' => $startDate,
                'end' => $endDate
            ],
            'financial_performance' => $this->getFinancialPerformance($startDate, $endDate),
            'operational_metrics' => $this->getOperationalMetrics($startDate, $endDate),
            'human_resources' => $this->getHRPerformance($startDate, $endDate),
            'inventory_analysis' => $this->getInventoryAnalysis($startDate, $endDate),
            'quality_analysis' => $this->getQualityAnalysis($startDate, $endDate),
            'recommendations' => $this->generateRecommendations($startDate, $endDate)
        ];

        return response()->json($report);
    }

    // Helper methods for calculations

    private function calculateRevenue($startDate, $endDate): float
    {
        return Invoice::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'paid')
            ->sum('total_amount');
    }

    private function calculateCosts($startDate, $endDate): float
    {
        $materialCosts = DB::table('material_reservations')
            ->join('materials', 'material_reservations.material_id', '=', 'materials.id')
            ->whereBetween('material_reservations.created_at', [$startDate, $endDate])
            ->sum(DB::raw('quantity_used * materials.cost_per_unit'));

        $laborCosts = Payroll::whereBetween('pay_period_start', [$startDate, $endDate])
            ->sum('gross_pay');

        return $materialCosts + $laborCosts;
    }

    private function calculateGrowth($type, $currentMonth): float
    {
        $lastMonth = $currentMonth->copy()->subMonth();
        
        if ($type === 'revenue') {
            $current = $this->calculateRevenue($currentMonth, now());
            $previous = $this->calculateRevenue($lastMonth, $currentMonth);
        } else {
            $current = $this->calculateCosts($currentMonth, now());
            $previous = $this->calculateCosts($lastMonth, $currentMonth);
        }

        return $previous > 0 ? (($current - $previous) / $previous) * 100 : 0;
    }

    private function calculateProfitMargin(): float
    {
        $revenue = $this->calculateRevenue(now()->startOfMonth(), now());
        $costs = $this->calculateCosts(now()->startOfMonth(), now());
        
        return $revenue > 0 ? (($revenue - $costs) / $revenue) * 100 : 0;
    }

    private function getAccountsReceivable(): float
    {
        return Invoice::where('status', 'pending')
            ->sum('total_amount');
    }

    private function getCashFlowProjection(): array
    {
        // Simple 3-month projection
        $projection = [];
        
        for ($i = 0; $i < 3; $i++) {
            $month = now()->addMonths($i);
            $expectedRevenue = $this->projectRevenue($month);
            $expectedCosts = $this->projectCosts($month);
            
            $projection[] = [
                'month' => $month->format('Y-m'),
                'projected_revenue' => $expectedRevenue,
                'projected_costs' => $expectedCosts,
                'net_cash_flow' => $expectedRevenue - $expectedCosts
            ];
        }
        
        return $projection;
    }

    private function getPayrollExpenses(): float
    {
        return Payroll::whereBetween('pay_period_start', [
            now()->startOfMonth(),
            now()
        ])->sum('gross_pay');
    }

    private function calculateProductionEfficiency(): float
    {
        $completedOrders = Order::where('status', 'completed')
            ->whereMonth('updated_at', now()->month)
            ->count();
            
        $totalOrders = Order::whereMonth('created_at', now()->month)->count();
        
        return $totalOrders > 0 ? ($completedOrders / $totalOrders) * 100 : 0;
    }

    private function calculateCapacityUtilization(): float
    {
        $totalWorkers = Worker::where('is_active', true)->count();
        $activeWorkers = Worker::where('is_active', true)
            ->where('status', 'busy')
            ->count();
            
        return $totalWorkers > 0 ? ($activeWorkers / $totalWorkers) * 100 : 0;
    }

    private function getQualityMetrics(): array
    {
        $avgQuality = DB::table('order_production_tracking')
            ->where('status', 'completed')
            ->whereMonth('completed_at', now()->month)
            ->avg('quality_score');

        return [
            'average_quality_score' => round($avgQuality ?? 0, 1),
            'quality_target' => 8.0,
            'quality_achievement' => $avgQuality ? ($avgQuality / 10) * 100 : 0
        ];
    }

    private function getStagePerformance(): array
    {
        return DB::table('production_stages')
            ->select(
                'production_stages.name',
                DB::raw('AVG(order_production_tracking.hours_worked) as avg_hours'),
                DB::raw('AVG(order_production_tracking.quality_score) as avg_quality'),
                DB::raw('COUNT(order_production_tracking.id) as total_completions')
            )
            ->leftJoin('order_production_tracking', 'production_stages.id', '=', 'order_production_tracking.production_stage_id')
            ->where('order_production_tracking.status', 'completed')
            ->whereMonth('order_production_tracking.completed_at', now()->month)
            ->groupBy('production_stages.id', 'production_stages.name')
            ->get()
            ->toArray();
    }

    private function calculateInventoryTurnover(): float
    {
        $monthlyUsage = DB::table('material_reservations')
            ->whereMonth('created_at', now()->month)
            ->sum('quantity_used');
            
        $avgInventory = Material::where('is_active', true)->avg('quantity');
        
        return $avgInventory > 0 ? $monthlyUsage / $avgInventory : 0;
    }

    private function getMaterialUsageTrends(): array
    {
        return DB::table('materials')
            ->select(
                'materials.name',
                DB::raw('SUM(material_reservations.quantity_used) as total_used'),
                DB::raw('AVG(material_reservations.quantity_used) as avg_used')
            )
            ->join('material_reservations', 'materials.id', '=', 'material_reservations.material_id')
            ->whereMonth('material_reservations.created_at', now()->month)
            ->groupBy('materials.id', 'materials.name')
            ->orderBy('total_used', 'desc')
            ->take(10)
            ->get()
            ->toArray();
    }

    private function getReorderAlerts(): array
    {
        return Material::where('is_active', true)
            ->where('quantity', '<=', DB::raw('minimum_quantity'))
            ->select('name', 'quantity', 'minimum_quantity', 'unit')
            ->get()
            ->toArray();
    }

    private function getTodayAttendance(): int
    {
        return Attendance::whereDate('date', today())
            ->where('status', 'present')
            ->distinct('worker_id')
            ->count();
    }

    private function getOvertimeHours(): float
    {
        return Attendance::whereMonth('date', now()->month)
            ->sum('overtime_hours');
    }

    private function getAverageWorkerEfficiency(): float
    {
        return Worker::where('is_active', true)->avg('efficiency') ?? 75;
    }

    private function getPayrollSummary(): array
    {
        $currentMonth = Payroll::whereMonth('pay_period_start', now()->month);
        
        return [
            'total_gross_pay' => $currentMonth->sum('gross_pay'),
            'total_deductions' => $currentMonth->sum('total_deductions'),
            'total_net_pay' => $currentMonth->sum('net_pay'),
            'average_salary' => $currentMonth->avg('gross_pay')
        ];
    }

    private function getTrainingNeeds(): array
    {
        // Workers with efficiency below 70%
        return Worker::where('is_active', true)
            ->where('efficiency', '<', 70)
            ->select('name', 'efficiency', 'position')
            ->get()
            ->toArray();
    }

    private function getPerformanceReviews(): array
    {
        // Due performance reviews (placeholder)
        return Worker::where('is_active', true)
            ->whereDate('hire_date', '<', now()->subMonths(6))
            ->select('name', 'hire_date', 'position')
            ->take(5)
            ->get()
            ->toArray();
    }

    private function calculateOverallEfficiency(): float
    {
        $productionEfficiency = $this->calculateProductionEfficiency();
        $workerEfficiency = $this->getAverageWorkerEfficiency();
        $qualityScore = $this->getQualityMetrics()['quality_achievement'];
        
        return ($productionEfficiency + $workerEfficiency + $qualityScore) / 3;
    }

    private function calculateCustomerSatisfaction(): float
    {
        // Based on on-time delivery and quality
        $onTimeDelivery = $this->calculateOnTimeDelivery();
        $qualityScore = $this->getQualityMetrics()['quality_achievement'];
        
        return ($onTimeDelivery + $qualityScore) / 2;
    }

    private function calculateOnTimeDelivery(): float
    {
        $completedOrders = Order::where('status', 'completed')
            ->whereMonth('updated_at', now()->month);
            
        $onTimeOrders = $completedOrders->where('updated_at', '<=', DB::raw('due_date'))
            ->count();
            
        $totalCompleted = $completedOrders->count();
        
        return $totalCompleted > 0 ? ($onTimeOrders / $totalCompleted) * 100 : 0;
    }

    private function calculateCostPerOrder(): float
    {
        $totalCosts = $this->calculateCosts(now()->startOfMonth(), now());
        $totalOrders = Order::whereMonth('created_at', now()->month)->count();
        
        return $totalOrders > 0 ? $totalCosts / $totalOrders : 0;
    }

    private function calculateRevenuePerEmployee(): float
    {
        $revenue = $this->calculateRevenue(now()->startOfMonth(), now());
        $totalEmployees = Worker::where('is_active', true)->count();
        
        return $totalEmployees > 0 ? $revenue / $totalEmployees : 0;
    }

    private function calculateMaterialWaste(): float
    {
        $totalReserved = DB::table('material_reservations')
            ->whereMonth('created_at', now()->month)
            ->sum('quantity_reserved');
            
        $totalUsed = DB::table('material_reservations')
            ->whereMonth('created_at', now()->month)
            ->sum('quantity_used');
        
        return $totalReserved > 0 ? (($totalReserved - $totalUsed) / $totalReserved) * 100 : 0;
    }

    private function calculateMachineUtilization(): float
    {
        // Placeholder - would track actual machine usage
        return 75.0;
    }

    private function calculateQualityScore(): float
    {
        return $this->getQualityMetrics()['quality_achievement'];
    }

    private function getCriticalAlerts(): array
    {
        return [
            'overdue_orders' => Order::where('due_date', '<', now())
                ->where('status', '!=', 'completed')
                ->count(),
            'out_of_stock' => Material::where('quantity', 0)
                ->where('is_active', true)
                ->count(),
            'absent_workers' => Worker::where('is_active', true)->count() - $this->getTodayAttendance()
        ];
    }

    private function getWarnings(): array
    {
        return [
            'low_stock_materials' => Material::where('quantity', '<=', 10)
                ->where('is_active', true)
                ->count(),
            'delayed_stages' => DB::table('order_production_tracking')
                ->where('status', 'in_progress')
                ->where('started_at', '<', now()->subDays(7))
                ->count()
        ];
    }

    private function getMaintenanceDue(): array
    {
        // Placeholder for equipment maintenance
        return [];
    }

    private function getComplianceIssues(): array
    {
        // Placeholder for compliance tracking
        return [];
    }

    // Additional helper methods for projections and analysis
    private function projectRevenue($month): float
    {
        $historicalAvg = Invoice::whereMonth('created_at', $month->month)
            ->where('status', 'paid')
            ->avg('total_amount');
            
        return $historicalAvg * Order::whereMonth('created_at', now()->month)->count();
    }

    private function projectCosts($month): float
    {
        $historicalCosts = $this->calculateCosts(
            $month->copy()->subYear()->startOfMonth(),
            $month->copy()->subYear()->endOfMonth()
        );
        
        return $historicalCosts * 1.05; // 5% inflation adjustment
    }

    private function getFinancialPerformance($startDate, $endDate): array
    {
        return [
            'revenue' => $this->calculateRevenue($startDate, $endDate),
            'costs' => $this->calculateCosts($startDate, $endDate),
            'profit' => $this->calculateRevenue($startDate, $endDate) - $this->calculateCosts($startDate, $endDate),
            'profit_margin' => $this->calculateProfitMargin()
        ];
    }

    private function getOperationalMetrics($startDate, $endDate): array
    {
        return [
            'orders_completed' => Order::whereBetween('updated_at', [$startDate, $endDate])
                ->where('status', 'completed')
                ->count(),
            'production_efficiency' => $this->calculateProductionEfficiency(),
            'quality_average' => DB::table('order_production_tracking')
                ->whereBetween('completed_at', [$startDate, $endDate])
                ->avg('quality_score')
        ];
    }

    private function getHRPerformance($startDate, $endDate): array
    {
        return [
            'total_hours_worked' => Attendance::whereBetween('date', [$startDate, $endDate])
                ->sum('hours_worked'),
            'overtime_hours' => Attendance::whereBetween('date', [$startDate, $endDate])
                ->sum('overtime_hours'),
            'average_efficiency' => $this->getAverageWorkerEfficiency()
        ];
    }

    private function getInventoryAnalysis($startDate, $endDate): array
    {
        return [
            'materials_consumed' => DB::table('material_reservations')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('quantity_used'),
            'inventory_turnover' => $this->calculateInventoryTurnover(),
            'waste_percentage' => $this->calculateMaterialWaste()
        ];
    }

    private function getQualityAnalysis($startDate, $endDate): array
    {
        return [
            'average_quality' => DB::table('order_production_tracking')
                ->whereBetween('completed_at', [$startDate, $endDate])
                ->avg('quality_score'),
            'quality_trend' => $this->calculateQualityTrend($startDate, $endDate),
            'defect_rate' => $this->calculateDefectRate($startDate, $endDate)
        ];
    }

    private function generateRecommendations($startDate, $endDate): array
    {
        $recommendations = [];
        
        $efficiency = $this->calculateProductionEfficiency();
        if ($efficiency < 80) {
            $recommendations[] = 'Production efficiency is below target. Consider workflow optimization.';
        }
        
        $onTimeDelivery = $this->calculateOnTimeDelivery();
        if ($onTimeDelivery < 90) {
            $recommendations[] = 'On-time delivery rate needs improvement. Review scheduling processes.';
        }
        
        $wastePercentage = $this->calculateMaterialWaste();
        if ($wastePercentage > 10) {
            $recommendations[] = 'Material waste is high. Implement waste reduction measures.';
        }
        
        return $recommendations ?: ['System performance is within acceptable ranges.'];
    }

    private function calculateQualityTrend($startDate, $endDate): string
    {
        $midPoint = $startDate->copy()->addDays($startDate->diffInDays($endDate) / 2);
        
        $firstHalf = DB::table('order_production_tracking')
            ->whereBetween('completed_at', [$startDate, $midPoint])
            ->avg('quality_score');
            
        $secondHalf = DB::table('order_production_tracking')
            ->whereBetween('completed_at', [$midPoint, $endDate])
            ->avg('quality_score');
        
        if ($secondHalf > $firstHalf * 1.05) return 'improving';
        if ($secondHalf < $firstHalf * 0.95) return 'declining';
        return 'stable';
    }

    private function calculateDefectRate($startDate, $endDate): float
    {
        $lowQualityTasks = DB::table('order_production_tracking')
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->where('quality_score', '<', 6)
            ->count();
            
        $totalTasks = DB::table('order_production_tracking')
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->count();
        
        return $totalTasks > 0 ? ($lowQualityTasks / $totalTasks) * 100 : 0;
    }
}