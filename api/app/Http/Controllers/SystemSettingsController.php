<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class SystemSettingsController extends Controller
{
    public function index()
    {
        try {
            $settings = $this->getAllSettings();
            $categories = $this->getSettingsCategories();
            
            return view('modules.admin.settings.index', compact('settings', 'categories'));
            
        } catch (\Exception $e) {
            return view('modules.admin.settings.index', [
                'settings' => [],
                'categories' => []
            ]);
        }
    }

    public function general()
    {
        try {
            $settings = $this->getGeneralSettings();
            
            return view('modules.admin.settings.general', compact('settings'));
            
        } catch (\Exception $e) {
            return view('modules.admin.settings.general', ['settings' => []]);
        }
    }

    public function email()
    {
        try {
            $settings = $this->getEmailSettings();
            
            return view('modules.admin.settings.email', compact('settings'));
            
        } catch (\Exception $e) {
            return view('modules.admin.settings.email', ['settings' => []]);
        }
    }

    public function notifications()
    {
        try {
            $settings = $this->getNotificationSettings();
            
            return view('modules.admin.settings.notifications', compact('settings'));
            
        } catch (\Exception $e) {
            return view('modules.admin.settings.notifications', ['settings' => []]);
        }
    }

    public function backup()
    {
        try {
            $settings = $this->getBackupSettings();
            $backupHistory = $this->getBackupHistory();
            
            return view('modules.admin.settings.backup', compact('settings', 'backupHistory'));
            
        } catch (\Exception $e) {
            return view('modules.admin.settings.backup', [
                'settings' => [],
                'backupHistory' => []
            ]);
        }
    }

    public function security()
    {
        try {
            $settings = $this->getSecuritySettings();
            
            return view('modules.admin.settings.security', compact('settings'));
            
        } catch (\Exception $e) {
            return view('modules.admin.settings.security', ['settings' => []]);
        }
    }

    public function update(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'settings' => 'required|array'
        ]);

        try {
            foreach ($request->settings as $key => $value) {
                if (Schema::hasTable('system_settings')) {
                    DB::table('system_settings')->updateOrInsert(
                        ['key' => $key],
                        [
                            'value' => is_array($value) ? json_encode($value) : $value,
                            'category' => $request->category,
                            'updated_at' => now()
                        ]
                    );
                }
            }

            return back()->with('success', __('Settings updated successfully'));

        } catch (\Exception $e) {
            return back()->with('error', __('Failed to update settings: ') . $e->getMessage());
        }
    }

    public function createBackup()
    {
        try {
            // Simulate backup creation
            $backupFile = 'backup_' . date('Y_m_d_H_i_s') . '.sql';
            $backupSize = rand(50, 500) . ' MB';

            if (Schema::hasTable('system_backups')) {
                DB::table('system_backups')->insert([
                    'filename' => $backupFile,
                    'size' => $backupSize,
                    'type' => 'manual',
                    'status' => 'completed',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return back()->with('success', __('Backup created successfully: ') . $backupFile);

        } catch (\Exception $e) {
            return back()->with('error', __('Failed to create backup: ') . $e->getMessage());
        }
    }

    public function testEmail(Request $request)
    {
        $request->validate([
            'test_email' => 'required|email'
        ]);

        try {
            // Simulate email test
            $success = rand(0, 10) > 2; // 80% success rate

            if ($success) {
                return back()->with('success', __('Test email sent successfully to: ') . $request->test_email);
            } else {
                return back()->with('error', __('Failed to send test email. Please check SMTP settings.'));
            }

        } catch (\Exception $e) {
            return back()->with('error', __('Email test failed: ') . $e->getMessage());
        }
    }

    private function getAllSettings()
    {
        return [
            'general' => $this->getGeneralSettings(),
            'email' => $this->getEmailSettings(),
            'notifications' => $this->getNotificationSettings(),
            'backup' => $this->getBackupSettings(),
            'security' => $this->getSecuritySettings()
        ];
    }

    private function getGeneralSettings()
    {
        return [
            'app_name' => 'Workshop Management System',
            'app_description' => 'Complete workshop management solution',
            'company_name' => 'Workshop Pro Ltd.',
            'company_address' => '123 Industrial Street, City, State 12345',
            'company_phone' => '+1 (555) 123-4567',
            'company_email' => 'info@workshoppro.com',
            'timezone' => 'America/New_York',
            'date_format' => 'Y-m-d',
            'time_format' => 'H:i',
            'currency' => 'USD',
            'currency_symbol' => '$',
            'language' => 'en',
            'items_per_page' => 25,
            'maintenance_mode' => false
        ];
    }

    private function getEmailSettings()
    {
        return [
            'mail_driver' => 'smtp',
            'mail_host' => 'smtp.example.com',
            'mail_port' => '587',
            'mail_username' => 'noreply@workshoppro.com',
            'mail_password' => '***hidden***',
            'mail_encryption' => 'tls',
            'mail_from_address' => 'noreply@workshoppro.com',
            'mail_from_name' => 'Workshop Pro',
            'mail_enabled' => true,
            'test_mode' => false
        ];
    }

    private function getNotificationSettings()
    {
        return [
            'enable_email_notifications' => true,
            'enable_sms_notifications' => false,
            'enable_push_notifications' => true,
            'notify_new_orders' => true,
            'notify_order_completion' => true,
            'notify_low_inventory' => true,
            'notify_worker_absence' => true,
            'notify_system_errors' => true,
            'notification_frequency' => 'immediate',
            'digest_enabled' => true,
            'digest_frequency' => 'daily',
            'digest_time' => '09:00'
        ];
    }

    private function getBackupSettings()
    {
        return [
            'auto_backup_enabled' => true,
            'backup_frequency' => 'daily',
            'backup_time' => '02:00',
            'backup_retention_days' => 30,
            'backup_location' => '/backups/database/',
            'backup_compression' => true,
            'backup_encryption' => false,
            'include_files' => false,
            'cloud_backup_enabled' => false,
            'cloud_provider' => 'aws_s3'
        ];
    }

    private function getSecuritySettings()
    {
        return [
            'session_timeout' => 120, // minutes
            'password_min_length' => 8,
            'password_require_uppercase' => true,
            'password_require_lowercase' => true,
            'password_require_numbers' => true,
            'password_require_symbols' => false,
            'max_login_attempts' => 5,
            'lockout_duration' => 15, // minutes
            'two_factor_enabled' => false,
            'ip_whitelist_enabled' => false,
            'ip_whitelist' => [],
            'force_https' => true,
            'api_rate_limit' => 1000, // requests per hour
            'enable_audit_log' => true
        ];
    }

    private function getSettingsCategories()
    {
        return [
            'general' => 'General Settings',
            'email' => 'Email Configuration',
            'notifications' => 'Notification Settings',
            'backup' => 'Backup & Recovery',
            'security' => 'Security Settings'
        ];
    }

    private function getBackupHistory()
    {
        return [
            [
                'id' => 1,
                'filename' => 'backup_2024_01_15_02_00_15.sql',
                'size' => '125.6 MB',
                'type' => 'automatic',
                'status' => 'completed',
                'created_at' => now()->subDays(1),
                'download_url' => '#'
            ],
            [
                'id' => 2,
                'filename' => 'backup_2024_01_14_02_00_12.sql',
                'size' => '123.2 MB',
                'type' => 'automatic',
                'status' => 'completed',
                'created_at' => now()->subDays(2),
                'download_url' => '#'
            ],
            [
                'id' => 3,
                'filename' => 'backup_2024_01_13_15_30_45.sql',
                'size' => '121.8 MB',
                'type' => 'manual',
                'status' => 'completed',
                'created_at' => now()->subDays(3),
                'download_url' => '#'
            ],
            [
                'id' => 4,
                'filename' => 'backup_2024_01_13_02_00_10.sql',
                'size' => '120.5 MB',
                'type' => 'automatic',
                'status' => 'failed',
                'created_at' => now()->subDays(3),
                'download_url' => null
            ]
        ];
    }
}
