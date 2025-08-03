<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Plugin;

class PluginSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plugins = [
            [
                'name' => 'Advanced Analytics',
                'slug' => 'advanced-analytics',
                'version' => '1.2.0',
                'description' => 'Enhanced analytics dashboard with real-time reporting and custom metrics.',
                'author' => 'Workshop Team',
                'author_email' => 'team@workshop.com',
                'status' => true, // active
                'category' => 'analytics',
                'dependencies' => json_encode(['charts-library']),
                'hooks' => json_encode(['dashboard.render', 'reports.generate']),
                'assets' => json_encode([
                    'css' => ['advanced-analytics/style.css'],
                    'js' => ['advanced-analytics/main.js', 'advanced-analytics/charts.js']
                ]),
                'config' => json_encode([
                    'refreshInterval' => 30000,
                    'defaultChart' => 'line',
                    'enableExport' => true
                ]),
                'permissions' => json_encode(['analytics.view', 'analytics.export']),
                'routes' => json_encode([
                    'analytics/dashboard' => 'AnalyticsController@dashboard',
                    'analytics/export' => 'AnalyticsController@export'
                ]),
                'compatibility_version' => '1.0.0',
                'priority' => 5,
                'install_date' => now(),
                'last_update' => now(),
            ],
            [
                'name' => 'Smart Notifications',
                'slug' => 'smart-notifications',
                'version' => '2.1.0',
                'description' => 'Intelligent notification system with AI-powered filtering and priority management.',
                'author' => 'NotifyPro',
                'author_email' => 'support@notifypro.com',
                'status' => false, // inactive
                'category' => 'communication',
                'dependencies' => json_encode(['notification-engine']),
                'hooks' => json_encode(['notification.send', 'priority.calculate']),
                'assets' => json_encode([
                    'css' => ['smart-notifications/style.css'],
                    'js' => ['smart-notifications/main.js']
                ]),
                'config' => json_encode([
                    'enableAI' => true,
                    'priority' => 'medium',
                    'maxNotifications' => 50
                ]),
                'permissions' => json_encode(['notifications.manage', 'notifications.send']),
                'routes' => json_encode([
                    'notifications/manage' => 'NotificationController@manage',
                    'notifications/send' => 'NotificationController@send'
                ]),
                'compatibility_version' => '1.0.0',
                'priority' => 10,
                'install_date' => now(),
                'last_update' => null,
            ],
            [
                'name' => 'Workflow Automation',
                'slug' => 'workflow-automation',
                'version' => '1.0.5',
                'description' => 'Automate repetitive tasks and create custom workflows for your workshop processes.',
                'author' => 'AutoFlow Inc',
                'author_email' => 'info@autoflow.com',
                'status' => false, // installed but not active
                'category' => 'automation',
                'dependencies' => json_encode([]),
                'hooks' => json_encode(['workflow.execute', 'task.automate']),
                'assets' => json_encode([
                    'css' => ['workflow-automation/style.css'],
                    'js' => ['workflow-automation/main.js', 'workflow-automation/builder.js']
                ]),
                'config' => json_encode([
                    'maxConcurrentWorkflows' => 10,
                    'enableScheduling' => true
                ]),
                'permissions' => json_encode(['workflows.create', 'workflows.execute']),
                'routes' => json_encode([
                    'workflows/create' => 'WorkflowController@create',
                    'workflows/execute' => 'WorkflowController@execute'
                ]),
                'compatibility_version' => '1.0.0',
                'priority' => 15,
                'install_date' => now(),
                'last_update' => null,
            ],
            [
                'name' => 'Production Dashboard',
                'slug' => 'production-dashboard',
                'version' => '2.0.1',
                'description' => 'Real-time production monitoring with customizable KPIs and alerts.',
                'author' => 'Workshop Team',
                'author_email' => 'team@workshop.com',
                'status' => true, // active
                'category' => 'dashboard',
                'dependencies' => json_encode(['chart-library', 'websockets']),
                'hooks' => json_encode(['production.update', 'dashboard.render']),
                'assets' => json_encode([
                    'css' => ['production-dashboard/style.css'],
                    'js' => ['production-dashboard/main.js']
                ]),
                'config' => json_encode([
                    'updateInterval' => 5000,
                    'showAlerts' => true,
                    'kpiTypes' => ['efficiency', 'quality', 'throughput']
                ]),
                'permissions' => json_encode(['production.view', 'dashboard.customize']),
                'routes' => json_encode([
                    'production/dashboard' => 'ProductionController@dashboard',
                    'production/kpis' => 'ProductionController@kpis'
                ]),
                'compatibility_version' => '1.0.0',
                'priority' => 5,
                'install_date' => now(),
                'last_update' => now(),
            ],
            [
                'name' => 'Inventory Optimizer',
                'slug' => 'inventory-optimizer',
                'version' => '1.3.2',
                'description' => 'AI-powered inventory optimization with demand forecasting and automatic reordering.',
                'author' => 'InventoryAI',
                'author_email' => 'support@inventoryai.com',
                'status' => false, // inactive
                'category' => 'automation',
                'dependencies' => json_encode(['ai-engine', 'forecasting-lib']),
                'hooks' => json_encode(['inventory.update', 'forecast.generate']),
                'assets' => json_encode([
                    'css' => ['inventory-optimizer/style.css'],
                    'js' => ['inventory-optimizer/main.js', 'inventory-optimizer/ai.js']
                ]),
                'config' => json_encode([
                    'forecastPeriod' => 30,
                    'autoReorder' => false,
                    'safetyStock' => 0.2
                ]),
                'permissions' => json_encode(['inventory.manage', 'orders.create']),
                'routes' => json_encode([
                    'inventory/optimize' => 'InventoryController@optimize',
                    'inventory/forecast' => 'InventoryController@forecast'
                ]),
                'compatibility_version' => '1.0.0',
                'priority' => 20,
                'install_date' => now(),
                'last_update' => null,
            ]
        ];

        foreach ($plugins as $pluginData) {
            Plugin::create($pluginData);
        }
    }
}
