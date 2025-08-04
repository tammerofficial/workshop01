<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class BiometricService
{
    protected $authUrl = 'https://staff.hudaaljarallah.net/jwt-api-token-auth/';
    protected $transactionsUrl = 'http://staff.hudaaljarallah.net/iclock/api/transactions/';
    protected $employeesUrl = 'https://staff.hudaaljarallah.net/personnel/api/employees/';
    protected $departmentsUrl = 'https://staff.hudaaljarallah.net/personnel/api/departments/';
    protected $areasUrl = 'http://staff.hudaaljarallah.net/personnel/api/areas/';
    protected $positionsUrl = 'http://staff.hudaaljarallah.net/personnel/api/positions/';
    protected $resignationsUrl = 'http://staff.hudaaljarallah.net/personnel/api/resignations/';
    protected $devicesUrl = 'http://staff.hudaaljarallah.net/iclock/api/terminals/';
    protected $transactionReportUrl = 'http://staff.hudaaljarallah.net/att/api/transactionReport/';
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
     * Ensure valid token exists, authenticate if necessary
     */
    protected function ensureValidToken()
    {
        // If token exists and not expired, return true
        if ($this->token && $this->loadTokenFromFile()) {
            return true;
        }
        
        // If no token or expired, authenticate
        return $this->authenticate();
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
    public function getEmployees($pageSize = null)
    {
        if (!$this->token && !$this->authenticate()) {
            return [];
        }

        try {
            // إذا لم يتم تحديد pageSize، نجلب جميع العمال بدون حد
            $params = $pageSize ? ['page_size' => $pageSize] : [];
            
            $response = Http::withToken($this->token)
                ->get($this->employeesUrl, $params);

            if ($response->successful()) {
                return $response->json();
            }
            
            // If token is invalid (401/403), clear it and try to re-authenticate
            if (in_array($response->status(), [401, 403])) {
                Log::warning('Token appears invalid, attempting re-authentication');
                $this->clearToken();
                
                if ($this->authenticate()) {
                    $response = Http::withToken($this->token)
                        ->get($this->employeesUrl, $params);
                        
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
    public function getAttendanceTransactions($startDate = null, $endDate = null, $page = 1, $pageSize = 50, $empCode = null, $department = null, $search = null, $status = null, $sortBy = 'punch_time', $sortDir = 'desc')
    {
        if (!$this->token && !$this->authenticate()) {
            return null; // Return null to indicate failure
        }

        try {
            $query = [
                'page' => $page,
                'page_size' => $pageSize,
            ];
            
            if ($startDate) {
                $query['start_date'] = $startDate;
            }
            if ($endDate) {
                $query['end_date'] = $endDate;
            }

            if ($empCode) {
                $query['emp_code'] = $empCode;
            }
            if ($department) {
                $query['department'] = $department;
            }
            if ($search) {
                $query['search'] = $search;
            }
            if ($status) {
                $query['status'] = $status;
            }
            if ($sortBy) {
                $query['ordering'] = ($sortDir === 'desc' ? '-' : '') . $sortBy;
            }

            $response = Http::withToken($this->token)
                ->get($this->transactionsUrl, $query);

            if ($response->successful()) {
                // Return the entire response object which includes 'data' and pagination info
                return $response->json();
            }
            
            if (in_array($response->status(), [401, 403])) {
                Log::warning('Token appears invalid, attempting re-authentication');
                $this->clearToken();
                
                if ($this->authenticate()) {
                    $response = Http::withToken($this->token)
                        ->get($this->transactionsUrl, $query);
                        
                    if ($response->successful()) {
                        return $response->json();
                    }
                }
            }
            
            Log::error('Failed to fetch attendance transactions', [
                'status' => $response->status(),
                'response' => $response->json(),
                'query' => $query
            ]);
            
            return null; // Return null on failure
        } catch (\Exception $e) {
            Log::error('Exception fetching attendance transactions', [
                'message' => $e->getMessage()
            ]);
            return null; // Return null on exception
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

    /**
     * Create department in biometric system
     */
    public function createDepartment($departmentData)
    {
        if (!$this->token && !$this->authenticate()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)
                ->post($this->departmentsUrl, $departmentData);
            
            if ($response->successful()) {
                Log::info('Department created successfully in biometric system', [
                    'department_data' => $departmentData,
                    'response' => $response->json()
                ]);
                return $response->json();
            }
            
            throw new \Exception('Failed to create department. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception creating department: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update department in biometric system
     */
    public function updateDepartment($departmentId, $departmentData)
    {
        if (!$this->token && !$this->authenticate()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)
                ->put($this->departmentsUrl . $departmentId . '/', $departmentData);
            
            if ($response->successful()) {
                Log::info('Department updated successfully in biometric system', [
                    'department_id' => $departmentId,
                    'department_data' => $departmentData,
                    'response' => $response->json()
                ]);
                return $response->json();
            }
            
            throw new \Exception('Failed to update department. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception updating department: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete department from biometric system
     */
    public function deleteDepartment($departmentId)
    {
        if (!$this->token && !$this->authenticate()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)
                ->delete($this->departmentsUrl . $departmentId . '/');
            
            if ($response->successful()) {
                Log::info('Department deleted successfully from biometric system', [
                    'department_id' => $departmentId
                ]);
                return true;
            }
            
            throw new \Exception('Failed to delete department. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception deleting department: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create position in biometric system
     */
    public function createPosition($positionData)
    {
        if (!$this->token && !$this->authenticate()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)
                ->post($this->positionsUrl, $positionData);
            
            if ($response->successful()) {
                Log::info('Position created successfully in biometric system', [
                    'position_data' => $positionData,
                    'response' => $response->json()
                ]);
                return $response->json();
            }
            
            throw new \Exception('Failed to create position. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception creating position: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update position in biometric system
     */
    public function updatePosition($positionId, $positionData)
    {
        if (!$this->token && !$this->authenticate()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)
                ->put($this->positionsUrl . $positionId . '/', $positionData);
            
            if ($response->successful()) {
                Log::info('Position updated successfully in biometric system', [
                    'position_id' => $positionId,
                    'position_data' => $positionData,
                    'response' => $response->json()
                ]);
                return $response->json();
            }
            
            throw new \Exception('Failed to update position. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception updating position: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete position from biometric system
     */
    public function deletePosition($positionId)
    {
        if (!$this->token && !$this->authenticate()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)
                ->delete($this->positionsUrl . $positionId . '/');
            
            if ($response->successful()) {
                Log::info('Position deleted successfully from biometric system', [
                    'position_id' => $positionId
                ]);
                return true;
            }
            
            throw new \Exception('Failed to delete position. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception deleting position: ' . $e->getMessage());
            throw $e;
        }
    }

    // ===========================================
    // RESIGNATION MANAGEMENT METHODS
    // ===========================================

    /**
     * Get all resignations
     */
    public function getResignations()
    {
        if (!$this->ensureValidToken()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)->get($this->resignationsUrl);
            
            if ($response->successful()) {
                return $response->json();
            }
            
            throw new \Exception('Failed to get resignations. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception getting resignations: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create new resignation
     */
    public function createResignation($resignationData)
    {
        if (!$this->ensureValidToken()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)->post($this->resignationsUrl, $resignationData);
            
            if ($response->successful()) {
                Log::info('Resignation created successfully in biometric system', [
                    'resignation_data' => $resignationData,
                    'response' => $response->json()
                ]);
                return $response->json();
            }
            
            throw new \Exception('Failed to create resignation. Status: ' . $response->status() . '. Response: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Exception creating resignation: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update resignation
     */
    public function updateResignation($resignationId, $resignationData)
    {
        if (!$this->ensureValidToken()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)
                ->put($this->resignationsUrl . $resignationId . '/', $resignationData);
            
            if ($response->successful()) {
                Log::info('Resignation updated successfully in biometric system', [
                    'resignation_id' => $resignationId,
                    'resignation_data' => $resignationData,
                    'response' => $response->json()
                ]);
                return $response->json();
            }
            
            throw new \Exception('Failed to update resignation. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception updating resignation: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete resignation
     */
    public function deleteResignation($resignationId)
    {
        if (!$this->ensureValidToken()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)
                ->delete($this->resignationsUrl . $resignationId . '/');
            
            if ($response->successful()) {
                Log::info('Resignation deleted successfully from biometric system', [
                    'resignation_id' => $resignationId
                ]);
                return true;
            }
            
            throw new \Exception('Failed to delete resignation. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception deleting resignation: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Reinstate employee from resignation
     */
    public function reinstateEmployee($resignationIds)
    {
        if (!$this->ensureValidToken()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)
                ->post($this->resignationsUrl . 'reinstate/', ['resignation_ids' => $resignationIds]);
            
            if ($response->successful()) {
                Log::info('Employee reinstated successfully in biometric system', [
                    'resignation_ids' => $resignationIds,
                    'response' => $response->json()
                ]);
                return $response->json();
            }
            
            throw new \Exception('Failed to reinstate employee. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception reinstating employee: ' . $e->getMessage());
            throw $e;
        }
    }

    // ===========================================
    // DEVICE MANAGEMENT METHODS
    // ===========================================

    /**
     * Get all devices
     */
    public function getDevices()
    {
        if (!$this->ensureValidToken()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)->get($this->devicesUrl);
            
            if ($response->successful()) {
                return $response->json();
            }
            
            throw new \Exception('Failed to get devices. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception getting devices: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create new device
     */
    public function createDevice($deviceData)
    {
        if (!$this->ensureValidToken()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)->post($this->devicesUrl, $deviceData);
            
            if ($response->successful()) {
                Log::info('Device created successfully in biometric system', [
                    'device_data' => $deviceData,
                    'response' => $response->json()
                ]);
                return $response->json();
            }
            
            throw new \Exception('Failed to create device. Status: ' . $response->status() . '. Response: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Exception creating device: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update device
     */
    public function updateDevice($deviceId, $deviceData)
    {
        if (!$this->ensureValidToken()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::with($this->token)
                ->put($this->devicesUrl . $deviceId . '/', $deviceData);
            
            if ($response->successful()) {
                Log::info('Device updated successfully in biometric system', [
                    'device_id' => $deviceId,
                    'device_data' => $deviceData,
                    'response' => $response->json()
                ]);
                return $response->json();
            }
            
            throw new \Exception('Failed to update device. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception updating device: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete device
     */
    public function deleteDevice($deviceId)
    {
        if (!$this->ensureValidToken()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)
                ->delete($this->devicesUrl . $deviceId . '/');
            
            if ($response->successful()) {
                Log::info('Device deleted successfully from biometric system', [
                    'device_id' => $deviceId
                ]);
                return true;
            }
            
            throw new \Exception('Failed to delete device. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception deleting device: ' . $e->getMessage());
            throw $e;
        }
    }

    // ===========================================
    // TRANSACTION MANAGEMENT METHODS
    // ===========================================

    /**
     * Get transactions with advanced filtering
     */
    public function getTransactions($filters = [])
    {
        if (!$this->ensureValidToken()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $params = [];
            
            // Apply filters
            if (isset($filters['emp_code'])) {
                $params['emp_code'] = $filters['emp_code'];
            }
            if (isset($filters['terminal_sn'])) {
                $params['terminal_sn'] = $filters['terminal_sn'];
            }
            if (isset($filters['start_time'])) {
                $params['start_time'] = $filters['start_time'];
            }
            if (isset($filters['end_time'])) {
                $params['end_time'] = $filters['end_time'];
            }
            if (isset($filters['page'])) {
                $params['page'] = $filters['page'];
            }
            if (isset($filters['page_size'])) {
                $params['page_size'] = $filters['page_size'];
            }

            $response = Http::withToken($this->token)->get($this->transactionsUrl, $params);
            
            if ($response->successful()) {
                return $response->json();
            }
            
            throw new \Exception('Failed to get transactions. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception getting transactions: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get single transaction by ID
     */
    public function getTransaction($transactionId)
    {
        if (!$this->ensureValidToken()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)->get($this->transactionsUrl . $transactionId . '/');
            
            if ($response->successful()) {
                return $response->json();
            }
            
            throw new \Exception('Failed to get transaction. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception getting transaction: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete transaction
     */
    public function deleteTransaction($transactionId)
    {
        if (!$this->ensureValidToken()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $response = Http::withToken($this->token)
                ->delete($this->transactionsUrl . $transactionId . '/');
            
            if ($response->successful()) {
                Log::info('Transaction deleted successfully from biometric system', [
                    'transaction_id' => $transactionId
                ]);
                return true;
            }
            
            throw new \Exception('Failed to delete transaction. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception deleting transaction: ' . $e->getMessage());
            throw $e;
        }
    }

    // ===========================================
    // TRANSACTION REPORT METHODS
    // ===========================================

    /**
     * Generate transaction report
     */
    public function getTransactionReport($filters = [])
    {
        if (!$this->ensureValidToken()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $params = [];
            
            // Apply report filters
            if (isset($filters['page'])) {
                $params['page'] = $filters['page'];
            }
            if (isset($filters['page_size'])) {
                $params['page_size'] = $filters['page_size'];
            }
            if (isset($filters['start_date'])) {
                $params['start_date'] = $filters['start_date'];
            }
            if (isset($filters['end_date'])) {
                $params['end_date'] = $filters['end_date'];
            }
            if (isset($filters['departments'])) {
                $params['departments'] = $filters['departments'];
            }
            if (isset($filters['areas'])) {
                $params['areas'] = $filters['areas'];
            }
            if (isset($filters['emp_codes'])) {
                $params['emp_codes'] = $filters['emp_codes'];
            }

            $response = Http::withToken($this->token)->get($this->transactionReportUrl, $params);
            
            if ($response->successful()) {
                return $response->json();
            }
            
            throw new \Exception('Failed to generate transaction report. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception generating transaction report: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Export transaction report in different formats
     */
    public function exportTransactionReport($filters = [], $format = 'csv')
    {
        if (!$this->ensureValidToken()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            $params = $filters;
            $params['format'] = $format; // csv, txt, xls
            
            $response = Http::withToken($this->token)->get($this->transactionReportUrl . 'export/', $params);
            
            if ($response->successful()) {
                return [
                    'data' => $response->body(),
                    'content_type' => $response->header('Content-Type'),
                    'filename' => $response->header('Content-Disposition')
                ];
            }
            
            throw new \Exception('Failed to export transaction report. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception exporting transaction report: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get transaction statistics
     */
    public function getTransactionStats($filters = [])
    {
        if (!$this->ensureValidToken()) {
            throw new \Exception('Failed to authenticate with biometric system');
        }

        try {
            // Use the same transactions endpoint but get a larger sample for stats
            $params = [
                'page' => 1,
                'page_size' => 1000, // Get more records for better stats
            ];
            
            // Add date filters if provided
            if (isset($filters['start_date']) && !empty($filters['start_date'])) {
                $params['start_date'] = $filters['start_date'];
            }
            if (isset($filters['end_date']) && !empty($filters['end_date'])) {
                $params['end_date'] = $filters['end_date'];
            }
            
            $response = Http::withToken($this->token)->get($this->transactionsUrl, $params);
            
            if ($response->successful()) {
                $data = $response->json();
                $transactions = $data['data'] ?? [];
                $totalCount = $data['count'] ?? 0;
                
                // Calculate statistics from the actual transaction data
                $checkIns = 0;
                $checkOuts = 0;
                $uniqueEmployees = [];
                
                foreach ($transactions as $transaction) {
                    // Count unique employees
                    $empCode = $transaction['emp_code'] ?? $transaction['emp'] ?? null;
                    if ($empCode && !in_array($empCode, $uniqueEmployees)) {
                        $uniqueEmployees[] = $empCode;
                    }
                    
                    // Count check-ins and check-outs based on time and display
                    $punchDisplay = strtolower($transaction['punch_state_display'] ?? '');
                    $punchTime = $transaction['punch_time'] ?? '';
                    
                    // Extract time portion
                    $timeOnly = date('H:i:s', strtotime($punchTime));
                    
                    // Count as check-in if contains "in" or if it's a morning punch (before 12:00)
                    if (strpos($punchDisplay, 'in') !== false || 
                        (strpos($punchDisplay, 'check') !== false && $timeOnly < '12:00:00')) {
                        $checkIns++;
                    }
                    // Count as check-out if contains "out" or if it's an evening punch (after 12:00)
                    elseif (strpos($punchDisplay, 'out') !== false || 
                            (strpos($punchDisplay, 'check') !== false && $timeOnly >= '12:00:00')) {
                        $checkOuts++;
                    }
                    // For unknown punches, determine based on time
                    elseif ($punchDisplay === 'unknown' || empty($punchDisplay)) {
                        if ($timeOnly < '12:00:00') {
                            $checkIns++;
                        } else {
                            $checkOuts++;
                        }
                    }
                }
                
                return [
                    'total_transactions' => $totalCount,
                    'check_ins' => $checkIns,
                    'check_outs' => $checkOuts,
                    'unique_employees' => count($uniqueEmployees),
                    'date_range' => [
                        'start' => $filters['start_date'] ?? null,
                        'end' => $filters['end_date'] ?? null
                    ]
                ];
            }
            
            throw new \Exception('Failed to get transaction stats. Status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Exception getting transaction stats: ' . $e->getMessage());
            throw $e;
        }
    }
}