<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use App\Models\Plugin;
use App\Services\PluginService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class PluginController extends Controller
{
    protected $pluginService;

    public function __construct(PluginService $pluginService)
    {
        $this->pluginService = $pluginService;
    }

    /**
     * Get all plugins
     */
    public function index(Request $request): JsonResponse
    {
        $query = Plugin::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->boolean('status'));
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Search by name or description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $plugins = $query->orderBy('priority', 'asc')
                        ->orderBy('name', 'asc')
                        ->get();

        return response()->json([
            'plugins' => $plugins,
            'categories' => Plugin::CATEGORIES,
        ]);
    }

    /**
     * Install a new plugin
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:plugins',
            'description' => 'nullable|string',
            'version' => 'nullable|string|max:50',
            'author' => 'nullable|string|max:255',
            'author_email' => 'nullable|email',
            'category' => 'required|in:' . implode(',', Plugin::CATEGORIES),
            'config' => 'nullable|array',
            'dependencies' => 'nullable|array',
            'permissions' => 'nullable|array',
            'routes' => 'nullable|array',
            'hooks' => 'nullable|array',
            'assets' => 'nullable|array',
            'compatibility_version' => 'nullable|string',
            'priority' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        try {
            $plugin = $this->pluginService->install($request->all());
            
            return response()->json([
                'message' => 'Plugin installed successfully',
                'plugin' => $plugin
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Plugin installation failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific plugin
     */
    public function show(Plugin $plugin): JsonResponse
    {
        return response()->json([
            'plugin' => $plugin,
            'is_compatible' => $plugin->isCompatible(),
        ]);
    }

    /**
     * Update plugin configuration
     */
    public function update(Request $request, Plugin $plugin): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'config' => 'sometimes|array',
            'priority' => 'sometimes|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        try {
            $plugin->update($request->only([
                'name', 'description', 'config', 'priority'
            ]));
            
            return response()->json([
                'message' => 'Plugin updated successfully',
                'plugin' => $plugin->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Plugin update failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activate plugin
     */
    public function activate(Plugin $plugin): JsonResponse
    {
        try {
            $result = $this->pluginService->activate($plugin);
            
            if ($result['success']) {
                return response()->json([
                    'message' => 'Plugin activated successfully',
                    'plugin' => $plugin->fresh()
                ]);
            }
            
            return response()->json([
                'error' => 'Plugin activation failed',
                'message' => $result['message']
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Plugin activation failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deactivate plugin
     */
    public function deactivate(Plugin $plugin): JsonResponse
    {
        try {
            $result = $this->pluginService->deactivate($plugin);
            
            if ($result['success']) {
                return response()->json([
                    'message' => 'Plugin deactivated successfully',
                    'plugin' => $plugin->fresh()
                ]);
            }
            
            return response()->json([
                'error' => 'Plugin deactivation failed',
                'message' => $result['message']
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Plugin deactivation failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Uninstall plugin
     */
    public function destroy(Plugin $plugin): JsonResponse
    {
        try {
            $result = $this->pluginService->uninstall($plugin);
            
            if ($result['success']) {
                return response()->json([
                    'message' => 'Plugin uninstalled successfully'
                ]);
            }
            
            return response()->json([
                'error' => 'Plugin uninstall failed',
                'message' => $result['message']
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Plugin uninstall failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get plugin marketplace/available plugins
     */
    public function marketplace(): JsonResponse
    {
        // This would typically connect to an external marketplace
        $availablePlugins = [
            [
                'name' => 'WhatsApp Integration',
                'slug' => 'whatsapp-integration',
                'description' => 'Send notifications and updates via WhatsApp',
                'version' => '1.2.0',
                'author' => 'Workshop Team',
                'category' => 'communication',
                'price' => 'Free',
                'rating' => 4.8,
                'downloads' => 1250,
                'compatible' => true,
            ],
            [
                'name' => 'Advanced Analytics',
                'slug' => 'advanced-analytics',
                'description' => 'Detailed reporting and analytics dashboard',
                'version' => '2.1.0',
                'author' => 'Analytics Pro',
                'category' => 'reporting',
                'price' => '$29.99',
                'rating' => 4.9,
                'downloads' => 890,
                'compatible' => true,
            ],
            [
                'name' => 'Inventory Optimizer',
                'slug' => 'inventory-optimizer',
                'description' => 'AI-powered inventory management and optimization',
                'version' => '1.5.2',
                'author' => 'SmartStock',
                'category' => 'inventory',
                'price' => '$49.99',
                'rating' => 4.7,
                'downloads' => 567,
                'compatible' => true,
            ],
            [
                'name' => 'Task Automation',
                'slug' => 'task-automation',
                'description' => 'Automate repetitive tasks and workflows',
                'version' => '3.0.1',
                'author' => 'AutoFlow',
                'category' => 'automation',
                'price' => '$19.99',
                'rating' => 4.6,
                'downloads' => 2100,
                'compatible' => true,
            ],
        ];

        return response()->json([
            'marketplace_plugins' => $availablePlugins,
            'categories' => Plugin::CATEGORIES,
        ]);
    }
}
