<?php

namespace App\Services;

use App\Models\Plugin;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;

class PluginService
{
    protected $pluginsPath;

    public function __construct()
    {
        $this->pluginsPath = base_path('plugins');
    }

    /**
     * Install a plugin
     */
    public function install(array $data): Plugin
    {
        // Validate dependencies
        $this->validateDependencies($data['dependencies'] ?? []);

        // Set install date
        $data['install_date'] = now();
        $data['last_update'] = now();

        $plugin = Plugin::create($data);

        // Run installation hooks if any
        $this->runInstallationHooks($plugin);

        Log::info("Plugin installed: {$plugin->name} v{$plugin->version}");

        return $plugin;
    }

    /**
     * Activate a plugin
     */
    public function activate(Plugin $plugin): array
    {
        if ($plugin->status) {
            return [
                'success' => false,
                'message' => 'Plugin is already active'
            ];
        }

        // Check compatibility
        if (!$plugin->isCompatible()) {
            return [
                'success' => false,
                'message' => 'Plugin is not compatible with current system version'
            ];
        }

        // Check dependencies
        $missingDeps = $this->checkDependencies($plugin->dependencies ?? []);
        if (!empty($missingDeps)) {
            return [
                'success' => false,
                'message' => 'Missing dependencies: ' . implode(', ', $missingDeps)
            ];
        }

        try {
            $plugin->update(['status' => true]);
            
            // Register plugin hooks
            $this->registerHooks($plugin);
            
            // Load plugin assets
            $this->loadAssets($plugin);
            
            Log::info("Plugin activated: {$plugin->name}");
            
            return [
                'success' => true,
                'message' => 'Plugin activated successfully'
            ];
        } catch (\Exception $e) {
            Log::error("Plugin activation failed: {$plugin->name} - " . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Activation failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Deactivate a plugin
     */
    public function deactivate(Plugin $plugin): array
    {
        if (!$plugin->status) {
            return [
                'success' => false,
                'message' => 'Plugin is already inactive'
            ];
        }

        try {
            $plugin->update(['status' => false]);
            
            // Unregister plugin hooks
            $this->unregisterHooks($plugin);
            
            Log::info("Plugin deactivated: {$plugin->name}");
            
            return [
                'success' => true,
                'message' => 'Plugin deactivated successfully'
            ];
        } catch (\Exception $e) {
            Log::error("Plugin deactivation failed: {$plugin->name} - " . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Deactivation failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Uninstall a plugin
     */
    public function uninstall(Plugin $plugin): array
    {
        try {
            // Deactivate first if active
            if ($plugin->status) {
                $this->deactivate($plugin);
            }

            // Run uninstallation hooks
            $this->runUninstallationHooks($plugin);

            // Remove plugin files if they exist
            $pluginPath = $this->pluginsPath . '/' . $plugin->slug;
            if (File::isDirectory($pluginPath)) {
                File::deleteDirectory($pluginPath);
            }

            // Delete from database
            $plugin->delete();

            Log::info("Plugin uninstalled: {$plugin->name}");

            return [
                'success' => true,
                'message' => 'Plugin uninstalled successfully'
            ];
        } catch (\Exception $e) {
            Log::error("Plugin uninstall failed: {$plugin->name} - " . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Uninstall failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get all active plugins
     */
    public function getActivePlugins(): \Illuminate\Database\Eloquent\Collection
    {
        return Plugin::active()
                    ->orderBy('priority', 'asc')
                    ->get();
    }

    /**
     * Execute plugin hooks for specific event
     */
    public function executeHooks(string $event, array $data = []): array
    {
        $results = [];
        $activePlugins = $this->getActivePlugins();

        foreach ($activePlugins as $plugin) {
            $hooks = $plugin->getHooks($event);
            
            foreach ($hooks as $hook) {
                try {
                    $result = $this->executeHook($plugin, $hook, $data);
                    $results[] = [
                        'plugin' => $plugin->slug,
                        'hook' => $hook['name'] ?? 'unknown',
                        'result' => $result,
                        'success' => true
                    ];
                } catch (\Exception $e) {
                    $results[] = [
                        'plugin' => $plugin->slug,
                        'hook' => $hook['name'] ?? 'unknown',
                        'error' => $e->getMessage(),
                        'success' => false
                    ];
                    
                    Log::error("Plugin hook execution failed: {$plugin->slug} - {$e->getMessage()}");
                }
            }
        }

        return $results;
    }

    /**
     * Validate plugin dependencies
     */
    protected function validateDependencies(array $dependencies): void
    {
        $missing = $this->checkDependencies($dependencies);
        
        if (!empty($missing)) {
            throw new \Exception('Missing dependencies: ' . implode(', ', $missing));
        }
    }

    /**
     * Check for missing dependencies
     */
    protected function checkDependencies(array $dependencies): array
    {
        $missing = [];

        foreach ($dependencies as $dependency) {
            if (isset($dependency['type']) && $dependency['type'] === 'plugin') {
                // Check for plugin dependency
                $dependentPlugin = Plugin::where('slug', $dependency['name'])
                                        ->where('status', true)
                                        ->first();
                
                if (!$dependentPlugin) {
                    $missing[] = $dependency['name'];
                }
            } elseif (isset($dependency['type']) && $dependency['type'] === 'package') {
                // Check for composer package (simplified check)
                $composerPath = base_path('vendor/' . $dependency['name']);
                if (!File::isDirectory($composerPath)) {
                    $missing[] = $dependency['name'];
                }
            }
        }

        return $missing;
    }

    /**
     * Register plugin hooks
     */
    protected function registerHooks(Plugin $plugin): void
    {
        // This would integrate with Laravel's event system
        // For now, we'll just store the hooks in the plugin model
        Log::info("Hooks registered for plugin: {$plugin->name}");
    }

    /**
     * Unregister plugin hooks
     */
    protected function unregisterHooks(Plugin $plugin): void
    {
        // This would remove hooks from Laravel's event system
        Log::info("Hooks unregistered for plugin: {$plugin->name}");
    }

    /**
     * Load plugin assets
     */
    protected function loadAssets(Plugin $plugin): void
    {
        // This would copy/symlink CSS/JS files to public directory
        $assets = $plugin->assets ?? [];
        
        foreach ($assets as $asset) {
            // Handle asset loading logic here
            Log::info("Asset loaded for plugin {$plugin->name}: {$asset}");
        }
    }

    /**
     * Execute specific hook
     */
    protected function executeHook(Plugin $plugin, array $hook, array $data)
    {
        // This would execute the actual hook logic
        // For now, we'll simulate successful execution
        return ['executed' => true, 'plugin' => $plugin->slug, 'hook' => $hook];
    }

    /**
     * Run installation hooks
     */
    protected function runInstallationHooks(Plugin $plugin): void
    {
        // Run any post-installation logic
        Log::info("Installation hooks executed for plugin: {$plugin->name}");
    }

    /**
     * Run uninstallation hooks
     */
    protected function runUninstallationHooks(Plugin $plugin): void
    {
        // Run any pre-uninstall cleanup logic
        Log::info("Uninstallation hooks executed for plugin: {$plugin->name}");
    }
}
