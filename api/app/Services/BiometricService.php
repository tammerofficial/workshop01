<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class BiometricService
{
    protected $authUrl = 'https://staff.hudaaljarallah.net/jwt-api-token-auth/';
    protected $transactionsUrl = 'http://staff.hudaaljarallah.net/iclock/api/transactions/';
    protected $employeesUrl = 'http://staff.hudaaljarallah.net/personnel/api/employees/';
    protected $departmentsUrl = 'https://staff.hudaaljarallah.net/personnel/api/departments/';
    protected $areasUrl = 'http://staff.hudaaljarallah.net/personnel/api/areas/';
    protected $positionsUrl = 'http://staff.hudaaljarallah.net/personnel/api/positions/';
    protected $username = 'superadmin';
    protected $password = 'Alhuda@123';
    protected $token = null;
    protected $tokenFile;

    public function __construct()
    {
        $this->tokenFile = storage_path('app/biometric_token.json');
    }

    /**
     * Load token from file if it exists and is valid
     */
    protected function loadTokenFromFile()
    {
        if (file_exists($this->tokenFile)) {
            $tokenData = json_decode(file_get_contents($this->tokenFile), true);
            
            if ($tokenData && isset($tokenData['token']) && isset($tokenData['expires_at'])) {
                // Check if token is still valid (expires in 24 hours, check with 1 hour buffer)
                $expiresAt = Carbon::parse($tokenData['expires_at']);
                $hoursRemaining = now()->diffInHours($expiresAt, false);
                if ($expiresAt->isFuture() && $hoursRemaining > 1) {
                    $this->token = $tokenData['token'];
                    Log::info('Loaded valid token from file', ['expires_at' => $tokenData['expires_at']]);
                    return true;
                } else {
                    Log::info('Token expired or about to expire', [
                        'expires_at' => $tokenData['expires_at'],
                        'now' => now()->toISOString(),
                        'hours_remaining' => $hoursRemaining
                    ]);
                }
            }
        }
        return false;
    }

    /**
     * Save token to file
     */
    protected function saveTokenToFile($token)
    {
        $tokenData = [
            'token' => $token,
            'created_at' => now()->toISOString(),
            'expires_at' => now()->addHours(24)->toISOString() // JWT tokens usually expire in 24 hours
        ];
        
        // Ensure storage/app directory exists
        if (!file_exists(dirname($this->tokenFile))) {
            mkdir(dirname($this->tokenFile), 0755, true);
        }
        
        file_put_contents($this->tokenFile, json_encode($tokenData, JSON_PRETTY_PRINT));
        Log::info('Token saved to file', ['expires_at' => $tokenData['expires_at']]);
    }

    /**
     * Clear token from memory and file
     */
    protected function clearToken()
    {
        $this->token = null;
        if (file_exists($this->tokenFile)) {
            unlink($this->tokenFile);
            Log::info('Token file deleted');
        }
    }

    /**
     * Get token information (for debugging)
     */
    public function getTokenInfo()
    {
        if (file_exists($this->tokenFile)) {
            $tokenData = json_decode(file_get_contents($this->tokenFile), true);
            if ($tokenData) {
                return [
                    'exists' => true,
                    'created_at' => $tokenData['created_at'] ?? null,
                    'expires_at' => $tokenData['expires_at'] ?? null,
                    'is_valid' => $this->loadTokenFromFile(),
                    'current_token' => $this->token ? 'Set' : 'Not set'
                ];
            }
        }
        
        return [
            'exists' => false,
            'current_token' => $this->token ? 'Set' : 'Not set'
        ];
    }

    /**
     * Authenticate with the biometric API and get a token
     */
    public function authenticate()
    {
        // Try to load existing valid token first
        if ($this->loadTokenFromFile()) {
            return true;
        }

        // If no valid token found, get a new one
        try {
            Log::info('Requesting new token from biometric API');
            
            $response = Http::post($this->authUrl, [
                'username' => $this->username,
                'password' => $this->password
            ]);

            if ($response->successful()) {
                $this->token = $response->json('token');
                
                if ($this->token) {
                    $this->saveTokenToFile($this->token);
                    Log::info('Successfully authenticated with biometric API and saved token');
                    return true;
                }
            }
            
            Log::error('Biometric API authentication failed', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);
            
            return false;
        } catch (\Exception $e) {
            Log::error('Biometric API authentication exception', [
                'message' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get all employees from the biometric system
     */
    public function getEmployees($pageSize = 50)
    {
        if (!$this->token && !$this->authenticate()) {
            return [];
        }

        try {
            $response = Http::withToken($this->token)
                ->get($this->employeesUrl, ['page_size' => $pageSize]);

            if ($response->successful()) {
                return $response->json();
            }
            
            // If token is invalid (401/403), clear it and try to re-authenticate
            if (in_array($response->status(), [401, 403])) {
                Log::warning('Token appears invalid, attempting re-authentication');
                $this->clearToken();
                
                if ($this->authenticate()) {
                    $response = Http::withToken($this->token)
                        ->get($this->employeesUrl, ['page_size' => $pageSize]);
                        
                    if ($response->successful()) {
                        return $response->json();
                    }
                }
            }
            
            Log::error('Failed to fetch employees from biometric system', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);
            
            return [];
        } catch (\Exception $e) {
            Log::error('Exception fetching employees from biometric system', [
                'message' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get attendance transactions for a specific date range
     */
    public function getAttendanceTransactions($startDate = null, $endDate = null, $employeeIds = [])
    {
        if (!$this->token && !$this->authenticate()) {
            return [];
        }

        $startDate = $startDate ?? Carbon::now()->subDays(7)->format('Y-m-d');
        $endDate = $endDate ?? Carbon::now()->format('Y-m-d');

        try {
            $query = [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ];

            if (!empty($employeeIds)) {
                $query['emp_code'] = implode(',', $employeeIds);
            }

            $response = Http::withToken($this->token)
                ->get($this->transactionsUrl, $query);

            if ($response->successful()) {
                return $response->json('data');
            }
            
            // If token is invalid (401/403), clear it and try to re-authenticate
            if (in_array($response->status(), [401, 403])) {
                Log::warning('Token appears invalid, attempting re-authentication');
                $this->clearToken();
                
                if ($this->authenticate()) {
                    $response = Http::withToken($this->token)
                        ->get($this->transactionsUrl, $query);
                        
                    if ($response->successful()) {
                        return $response->json('data');
                    }
                }
            }
            
            Log::error('Failed to fetch attendance transactions', [
                'status' => $response->status(),
                'response' => $response->json(),
                'query' => $query
            ]);
            
            return [];
        } catch (\Exception $e) {
            Log::error('Exception fetching attendance transactions', [
                'message' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get attendance data for a specific employee
     */
    public function getEmployeeAttendance($employeeId, $startDate = null, $endDate = null)
    {
        return $this->getAttendanceTransactions($startDate, $endDate, [$employeeId]);
    }

    /**
     * Map biometric employee data to our worker model
     */
    public function mapEmployeeToWorker($employee)
    {
        // Clean and prepare name
        $firstName = $employee['first_name'] ?? '';
        $lastName = $employee['last_name'] ?? '';
        $fullName = trim($firstName . ' ' . $lastName);
        
        // Get department name
        $departmentName = 'General'; // Default department
        if (isset($employee['department']) && is_array($employee['department'])) {
            $departmentName = $employee['department']['dept_name'] ?? 'General';
        }
        
        // Set default role based on department or use a generic one
        $role = $employee['position'] ?? 'Worker';
        if (empty($role) || is_null($role)) {
            $role = 'Worker'; // Default role
        }
        
        return [
            'biometric_id' => $employee['id'] ?? null,
            'name' => $fullName ?: 'Employee ' . ($employee['emp_code'] ?? 'Unknown'),
            'email' => !empty($employee['email']) ? $employee['email'] : null,
            'phone' => !empty($employee['mobile']) ? $employee['mobile'] : null,
            'role' => $role,
            'department' => $departmentName,
            'employee_code' => $employee['emp_code'] ?? null,
            'is_active' => true, // Set all biometric employees as active by default
            'hire_date' => $employee['hire_date'] ?? now()->format('Y-m-d'),
            'biometric_data' => $employee // Store as array, will be cast to JSON
        ];
    }

    /**
     * Get areas from biometric system
     */
    public function getAreas()
    {
        if (!$this->token && !$this->authenticate()) {
            return [];
        }

        try {
            $response = Http::withToken($this->token)->get($this->areasUrl);
            
            if ($response->successful()) {
                return $response->json('data', []);
            }
            
            if (in_array($response->status(), [401, 403])) {
                Log::warning('Token appears invalid for areas, attempting re-authentication');
                $this->clearToken();
                if ($this->authenticate()) {
                    $response = Http::withToken($this->token)->get($this->areasUrl);
                    if ($response->successful()) {
                        return $response->json('data', []);
                    }
                }
            }
            
            Log::error('Failed to get areas from biometric system', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);
            return [];
            
        } catch (\Exception $e) {
            Log::error('Exception getting areas from biometric system: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get departments from biometric system
     */
    public function getDepartments()
    {
        if (!$this->token && !$this->authenticate()) {
            return [];
        }

        try {
            $response = Http::withToken($this->token)->get($this->departmentsUrl);
            
            if ($response->successful()) {
                return $response->json('data', []);
            }
            
            if (in_array($response->status(), [401, 403])) {
                Log::warning('Token appears invalid for departments, attempting re-authentication');
                $this->clearToken();
                if ($this->authenticate()) {
                    $response = Http::withToken($this->token)->get($this->departmentsUrl);
                    if ($response->successful()) {
                        return $response->json('data', []);
                    }
                }
            }
            
            Log::error('Failed to get departments from biometric system', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);
            return [];
            
        } catch (\Exception $e) {
            Log::error('Exception getting departments from biometric system: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get positions from biometric system
     */
    public function getPositions()
    {
        if (!$this->token && !$this->authenticate()) {
            return [];
        }

        try {
            $response = Http::withToken($this->token)->get($this->positionsUrl);
            
            if ($response->successful()) {
                return $response->json('data', []);
            }
            
            if (in_array($response->status(), [401, 403])) {
                Log::warning('Token appears invalid for positions, attempting re-authentication');
                $this->clearToken();
                if ($this->authenticate()) {
                    $response = Http::withToken($this->token)->get($this->positionsUrl);
                    if ($response->successful()) {
                        return $response->json('data', []);
                    }
                }
            }
            
            Log::error('Failed to get positions from biometric system', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);
            return [];
            
        } catch (\Exception $e) {
            Log::error('Exception getting positions from biometric system: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Create employee in biometric system
     */
    public function createEmployee($employeeData)
    {
        if (!$this->token && !$this->authenticate()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)
                ->post($this->employeesUrl, $employeeData);
            
            if ($response->successful()) {
                Log::info('Employee created successfully in biometric system', [
                    'employee_data' => $employeeData,
                    'response' => $response->json()
                ]);
                return $response->json();
            }
            
            if (in_array($response->status(), [401, 403])) {
                Log::warning('Token appears invalid for employee creation, attempting re-authentication');
                $this->clearToken();
                if ($this->authenticate()) {
                    $response = Http::withToken($this->token)
                        ->post($this->employeesUrl, $employeeData);
                    if ($response->successful()) {
                        return $response->json();
                    }
                }
            }
            
            $errorMessage = 'Failed to create employee in biometric system. Status: ' . $response->status();
            Log::error($errorMessage, [
                'employee_data' => $employeeData,
                'response' => $response->body()
            ]);
            throw new \Exception($errorMessage . '. Response: ' . $response->body());
            
        } catch (\Exception $e) {
            Log::error('Exception creating employee in biometric system: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update employee in biometric system
     */
    public function updateEmployee($employeeId, $employeeData)
    {
        if (!$this->token && !$this->authenticate()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)
                ->put($this->employeesUrl . $employeeId . '/', $employeeData);
            
            if ($response->successful()) {
                Log::info('Employee updated successfully in biometric system', [
                    'employee_id' => $employeeId,
                    'employee_data' => $employeeData,
                    'response' => $response->json()
                ]);
                return $response->json();
            }
            
            if (in_array($response->status(), [401, 403])) {
                Log::warning('Token appears invalid for employee update, attempting re-authentication');
                $this->clearToken();
                if ($this->authenticate()) {
                    $response = Http::withToken($this->token)
                        ->put($this->employeesUrl . $employeeId . '/', $employeeData);
                    if ($response->successful()) {
                        return $response->json();
                    }
                }
            }
            
            $errorMessage = 'Failed to update employee in biometric system. Status: ' . $response->status();
            Log::error($errorMessage, [
                'employee_id' => $employeeId,
                'employee_data' => $employeeData,
                'response' => $response->body()
            ]);
            throw new \Exception($errorMessage . '. Response: ' . $response->body());
            
        } catch (\Exception $e) {
            Log::error('Exception updating employee in biometric system: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete employee from biometric system
     */
    public function deleteEmployee($employeeId)
    {
        if (!$this->token && !$this->authenticate()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)
                ->delete($this->employeesUrl . $employeeId . '/');
            
            if ($response->successful()) {
                Log::info('Employee deleted successfully from biometric system', [
                    'employee_id' => $employeeId
                ]);
                return true;
            }
            
            if (in_array($response->status(), [401, 403])) {
                Log::warning('Token appears invalid for employee deletion, attempting re-authentication');
                $this->clearToken();
                if ($this->authenticate()) {
                    $response = Http::withToken($this->token)
                        ->delete($this->employeesUrl . $employeeId . '/');
                    if ($response->successful()) {
                        return true;
                    }
                }
            }
            
            $errorMessage = 'Failed to delete employee from biometric system. Status: ' . $response->status();
            Log::error($errorMessage, [
                'employee_id' => $employeeId,
                'response' => $response->body()
            ]);
            throw new \Exception($errorMessage . '. Response: ' . $response->body());
            
        } catch (\Exception $e) {
            Log::error('Exception deleting employee from biometric system: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get single employee from biometric system
     */
    public function getEmployee($employeeId)
    {
        if (!$this->token && !$this->authenticate()) {
            return null;
        }

        try {
            $response = Http::withToken($this->token)->get($this->employeesUrl . $employeeId . '/');
            
            if ($response->successful()) {
                return $response->json();
            }
            
            if (in_array($response->status(), [401, 403])) {
                Log::warning('Token appears invalid for employee fetch, attempting re-authentication');
                $this->clearToken();
                if ($this->authenticate()) {
                    $response = Http::withToken($this->token)->get($this->employeesUrl . $employeeId . '/');
                    if ($response->successful()) {
                        return $response->json();
                    }
                }
            }
            
            Log::error('Failed to get employee from biometric system', [
                'employee_id' => $employeeId,
                'status' => $response->status(),
                'response' => $response->body()
            ]);
            return null;
            
        } catch (\Exception $e) {
            Log::error('Exception getting employee from biometric system: ' . $e->getMessage());
            return null;
        }
    }
}