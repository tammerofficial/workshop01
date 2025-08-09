<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index()
    {
        try {
            $analytics = [
                'overview' => $this->getOverviewData(),
                'production' => $this->getProductionAnalytics(),
                'financial' => $this->getFinancialAnalytics(),
                'workforce' => $this->getWorkforceAnalytics()
            ];
            
            return view('modules.reports.analytics.index', compact('analytics'));
            
        } catch (\Exception $e) {
            return view('modules.reports.analytics.index', [
                'analytics' => [
                    'overview' => [],
                    'production' => [],
                    'financial' => [],
                    'workforce' => []
                ]
            ]);
        }
    }

    public function production()
    {
        try {
            $data = [
                'daily_production' => $this->getDailyProduction(),
                'stage_efficiency' => $this->getStageEfficiency(),
                'quality_metrics' => $this->getQualityMetrics(),
                'worker_productivity' => $this->getWorkerProductivity()
            ];
            
            return view('modules.reports.analytics.production', compact('data'));
            
        } catch (\Exception $e) {
            return view('modules.reports.analytics.production', ['data' => []]);
        }
    }

    public function financial()
    {
        try {
            $data = [
                'revenue_trends' => $this->getRevenueTrends(),
                'cost_analysis' => $this->getCostAnalysis(),
                'profit_margins' => $this->getProfitMargins(),
                'material_costs' => $this->getMaterialCosts()
            ];
            
            return view('modules.reports.analytics.financial', compact('data'));
            
        } catch (\Exception $e) {
            return view('modules.reports.analytics.financial', ['data' => []]);
        }
    }

    public function workforce()
    {
        try {
            $data = [
                'attendance_trends' => $this->getAttendanceTrends(),
                'productivity_metrics' => $this->getProductivityMetrics(),
                'training_progress' => $this->getTrainingProgress(),
                'performance_ratings' => $this->getPerformanceRatings()
            ];
            
            return view('modules.reports.analytics.workforce', compact('data'));
            
        } catch (\Exception $e) {
            return view('modules.reports.analytics.workforce', ['data' => []]);
        }
    }

    private function getOverviewData()
    {
        $data = [
            'total_orders' => 0,
            'completed_orders' => 0,
            'active_workers' => 0,
            'revenue_this_month' => 0,
            'growth_rate' => 0
        ];

        try {
            if (Schema::hasTable('orders')) {
                $data['total_orders'] = DB::table('orders')->count();
                $data['completed_orders'] = DB::table('orders')->where('status', 'completed')->count();
            }

            if (Schema::hasTable('users')) {
                $data['active_workers'] = DB::table('users')
                    ->where('role', 'worker')
                    ->where('is_active', true)
                    ->count();
            }

            // Simulate revenue calculation
            $data['revenue_this_month'] = $data['completed_orders'] * rand(200, 800);
            $data['growth_rate'] = rand(5, 25);

        } catch (\Exception $e) {
            // Use dummy data
            $data = [
                'total_orders' => 156,
                'completed_orders' => 142,
                'active_workers' => 24,
                'revenue_this_month' => 89500,
                'growth_rate' => 18
            ];
        }

        return $data;
    }

    private function getProductionAnalytics()
    {
        return [
            'orders_in_production' => rand(15, 35),
            'average_completion_time' => rand(3, 7) . ' days',
            'quality_pass_rate' => rand(85, 98) . '%',
            'efficiency_score' => rand(75, 95) . '%',
            'bottleneck_stage' => ['Assembly', 'Quality Check', 'Pattern Creation'][rand(0, 2)]
        ];
    }

    private function getFinancialAnalytics()
    {
        return [
            'monthly_revenue' => rand(80000, 120000),
            'monthly_costs' => rand(45000, 65000),
            'profit_margin' => rand(25, 45) . '%',
            'material_cost_ratio' => rand(35, 55) . '%',
            'labor_cost_ratio' => rand(25, 35) . '%'
        ];
    }

    private function getWorkforceAnalytics()
    {
        return [
            'average_attendance' => rand(85, 98) . '%',
            'productivity_score' => rand(75, 92) . '%',
            'training_completion' => rand(65, 88) . '%',
            'employee_satisfaction' => rand(7, 9) . '/10',
            'turnover_rate' => rand(5, 15) . '%'
        ];
    }

    private function getDailyProduction()
    {
        $data = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $data[] = [
                'date' => $date->format('M d'),
                'orders_completed' => rand(8, 25),
                'orders_started' => rand(10, 30),
                'efficiency' => rand(75, 95)
            ];
        }
        return $data;
    }

    private function getStageEfficiency()
    {
        return [
            ['stage' => 'Pattern Creation', 'efficiency' => 92, 'avg_time' => '2.1h'],
            ['stage' => 'Fabric Cutting', 'efficiency' => 88, 'avg_time' => '1.5h'],
            ['stage' => 'Assembly', 'efficiency' => 85, 'avg_time' => '4.2h'],
            ['stage' => 'Quality Check', 'efficiency' => 95, 'avg_time' => '0.5h'],
            ['stage' => 'Final Assembly', 'efficiency' => 89, 'avg_time' => '3.1h'],
            ['stage' => 'Inspection', 'efficiency' => 97, 'avg_time' => '0.3h']
        ];
    }

    private function getQualityMetrics()
    {
        return [
            'pass_rate' => 94.5,
            'defect_rate' => 5.5,
            'rework_rate' => 8.2,
            'customer_satisfaction' => 4.7,
            'return_rate' => 2.1
        ];
    }

    private function getWorkerProductivity()
    {
        return [
            ['worker' => 'Michael Johnson', 'orders_completed' => 23, 'efficiency' => 94, 'quality_score' => 96],
            ['worker' => 'Emma Davis', 'orders_completed' => 21, 'efficiency' => 91, 'quality_score' => 98],
            ['worker' => 'David Wilson', 'orders_completed' => 19, 'efficiency' => 88, 'quality_score' => 92],
            ['worker' => 'Sarah Chen', 'orders_completed' => 25, 'efficiency' => 96, 'quality_score' => 95],
            ['worker' => 'Robert Miller', 'orders_completed' => 18, 'efficiency' => 85, 'quality_score' => 89]
        ];
    }

    private function getRevenueTrends()
    {
        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $data[] = [
                'month' => $date->format('M Y'),
                'revenue' => rand(70000, 130000),
                'orders' => rand(120, 200),
                'avg_order_value' => rand(400, 800)
            ];
        }
        return $data;
    }

    private function getCostAnalysis()
    {
        return [
            'materials' => ['amount' => 45000, 'percentage' => 42],
            'labor' => ['amount' => 35000, 'percentage' => 33],
            'overhead' => ['amount' => 15000, 'percentage' => 14],
            'utilities' => ['amount' => 8000, 'percentage' => 7],
            'other' => ['amount' => 4000, 'percentage' => 4]
        ];
    }

    private function getProfitMargins()
    {
        return [
            'gross_margin' => 58.5,
            'net_margin' => 34.2,
            'operating_margin' => 42.1,
            'target_margin' => 45.0,
            'industry_average' => 38.5
        ];
    }

    private function getMaterialCosts()
    {
        return [
            ['material' => 'Cotton Fabrics', 'cost' => 15000, 'usage' => '35%'],
            ['material' => 'Silk Materials', 'cost' => 12000, 'usage' => '28%'],
            ['material' => 'Threads & Yarns', 'cost' => 8000, 'usage' => '18%'],
            ['material' => 'Buttons & Accessories', 'cost' => 6000, 'usage' => '14%'],
            ['material' => 'Other Supplies', 'cost' => 4000, 'usage' => '5%']
        ];
    }

    private function getAttendanceTrends()
    {
        $data = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $data[] = [
                'date' => $date->format('M d'),
                'present' => rand(20, 28),
                'absent' => rand(0, 4),
                'late' => rand(1, 6),
                'attendance_rate' => rand(85, 98)
            ];
        }
        return $data;
    }

    private function getProductivityMetrics()
    {
        return [
            'orders_per_worker' => 8.5,
            'efficiency_score' => 87.3,
            'quality_score' => 94.1,
            'on_time_delivery' => 91.7,
            'customer_satisfaction' => 4.6
        ];
    }

    private function getTrainingProgress()
    {
        return [
            ['course' => 'Quality Control', 'completed' => 18, 'total' => 24, 'percentage' => 75],
            ['course' => 'Safety Procedures', 'completed' => 22, 'total' => 24, 'percentage' => 92],
            ['course' => 'New Techniques', 'completed' => 14, 'total' => 24, 'percentage' => 58],
            ['course' => 'Customer Service', 'completed' => 20, 'total' => 24, 'percentage' => 83]
        ];
    }

    private function getPerformanceRatings()
    {
        return [
            'excellent' => ['count' => 8, 'percentage' => 33],
            'good' => ['count' => 12, 'percentage' => 50],
            'satisfactory' => ['count' => 3, 'percentage' => 13],
            'needs_improvement' => ['count' => 1, 'percentage' => 4]
        ];
    }
}
