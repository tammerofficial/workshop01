<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class SystemSettingsController extends Controller
{
    private $settingsKey = 'system_theme_settings';
    
    /**
     * Get global theme settings
     */
    public function getThemeSettings()
    {
        $defaultSettings = [
            'primaryColor' => '#000000',
            'secondaryColor' => '#8a8a8a',
            'backgroundColor' => '#ffffff',
            'theme' => 'auto',
            'fontFamily' => 'Tajawal',
            'fontSize' => 16,
            'borderRadius' => 8
        ];
        
        $settings = Cache::get($this->settingsKey, $defaultSettings);
        
        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }
    
    /**
     * Update global theme settings (Admin only)
     */
    public function updateThemeSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'primaryColor' => 'string|regex:/^#[a-fA-F0-9]{6}$/',
            'secondaryColor' => 'string|regex:/^#[a-fA-F0-9]{6}$/',
            'backgroundColor' => 'string|regex:/^#[a-fA-F0-9]{6}$/',
            'theme' => 'string|in:light,dark,auto',
            'fontFamily' => 'string',
            'fontSize' => 'integer|min:12|max:24',
            'borderRadius' => 'integer|min:0|max:24'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid data provided',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Get current settings
        $currentSettings = Cache::get($this->settingsKey, []);
        
        // Merge with new settings
        $newSettings = array_merge($currentSettings, $request->only([
            'primaryColor', 'secondaryColor', 'backgroundColor', 
            'theme', 'fontFamily', 'fontSize', 'borderRadius'
        ]));
        
        // Save to cache (expires in 1 year)
        Cache::put($this->settingsKey, $newSettings, 525600);
        
        // Log the activity
        if (function_exists('activity') && auth()->check()) {
            try {
                activity()
                    ->causedBy(auth()->user())
                    ->withProperties([
                        'old_settings' => $currentSettings,
                        'new_settings' => $newSettings
                    ])
                    ->log('System theme settings updated');
            } catch (\Exception $e) {
                \Log::warning('Failed to log theme settings update: ' . $e->getMessage());
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Theme settings updated successfully',
            'data' => $newSettings
        ]);
    }
    
    /**
     * Reset theme settings to default
     */
    public function resetThemeSettings()
    {
        $defaultSettings = [
            'primaryColor' => '#000000',
            'secondaryColor' => '#8a8a8a',
            'backgroundColor' => '#ffffff',
            'theme' => 'auto',
            'fontFamily' => 'Tajawal',
            'fontSize' => 16,
            'borderRadius' => 8
        ];
        
        Cache::put($this->settingsKey, $defaultSettings, 525600);
        
        // Log the activity
        if (function_exists('activity') && auth()->check()) {
            try {
                activity()
                    ->causedBy(auth()->user())
                    ->log('System theme settings reset to default');
            } catch (\Exception $e) {
                \Log::warning('Failed to log theme settings reset: ' . $e->getMessage());
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Theme settings reset to default',
            'data' => $defaultSettings
        ]);
    }
}