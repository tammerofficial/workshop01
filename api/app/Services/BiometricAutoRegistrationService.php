<?php

namespace App\Services;

use App\Models\User;
use App\Models\Worker;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BiometricAutoRegistrationService
{
    protected $workerRole;

    public function __construct()
    {
        $this->workerRole = Role::where('name', 'worker')->first();
        
        if (!$this->workerRole) {
            throw new \Exception('Worker role not found. Please run WorkerRoleSeeder first.');
        }
    }

    /**
     * تسجيل جميع موظفي البيومترك تلقائياً في النظام
     */
    public function registerAllBiometricEmployees()
    {
        $biometricService = app(BiometricService::class);
        
        try {
            // جلب جميع الموظفين من البيومترك
            $employees = $biometricService->getEmployees(500); // جلب 500 موظف
            
            if (empty($employees) || empty($employees['data'])) {
                return [
                    'success' => false,
                    'message' => 'No employees found in biometric system',
                    'registered' => 0,
                    'updated' => 0,
                    'skipped' => 0
                ];
            }

            $registered = 0;
            $updated = 0;
            $skipped = 0;
            $errors = [];

            foreach ($employees['data'] as $employee) {
                try {
                    $result = $this->registerSingleEmployee($employee);
                    
                    if ($result['action'] === 'registered') {
                        $registered++;
                    } elseif ($result['action'] === 'updated') {
                        $updated++;
                    } else {
                        $skipped++;
                    }
                    
                } catch (\Exception $e) {
                    $errors[] = "Employee {$employee['id']}: " . $e->getMessage();
                    Log::error('Error auto-registering employee', [
                        'employee_id' => $employee['id'],
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return [
                'success' => true,
                'message' => 'Auto-registration completed',
                'registered' => $registered,
                'updated' => $updated,
                'skipped' => $skipped,
                'errors' => $errors,
                'total_processed' => count($employees['data'])
            ];

        } catch (\Exception $e) {
            Log::error('Error in auto-registration process', ['error' => $e->getMessage()]);
            
            return [
                'success' => false,
                'message' => 'Error in auto-registration: ' . $e->getMessage(),
                'registered' => 0,
                'updated' => 0,
                'skipped' => 0
            ];
        }
    }

    /**
     * تسجيل موظف واحد من البيومترك
     */
    public function registerSingleEmployee($biometricEmployee)
    {
        $biometricId = $biometricEmployee['id'];
        $empCode = $biometricEmployee['emp_code'] ?? $biometricId;
        
        // التحقق من وجود العامل في قاعدة البيانات
        $existingWorker = Worker::where('biometric_id', $biometricId)
            ->orWhere('employee_code', $empCode)
            ->first();

        // إعداد بيانات الموظف
        $workerData = $this->prepareWorkerData($biometricEmployee);
        
        if ($existingWorker) {
            return $this->updateExistingWorker($existingWorker, $workerData, $biometricEmployee);
        } else {
            return $this->createNewWorkerAndUser($workerData, $biometricEmployee);
        }
    }

    /**
     * إعداد بيانات العامل من البيومترك
     */
    protected function prepareWorkerData($biometricEmployee)
    {
        $firstName = $biometricEmployee['first_name'] ?? '';
        $lastName = $biometricEmployee['last_name'] ?? '';
        $name = trim($firstName . ' ' . $lastName) ?: 'Employee ' . $biometricEmployee['id'];
        
        return [
            // Basic Information
            'name' => $name,
            'email' => !empty($biometricEmployee['email']) ? $biometricEmployee['email'] : $biometricEmployee['emp_code'] . '@biometric.local',
            'phone' => $biometricEmployee['mobile'] ?? null,
            'role' => $this->mapBiometricRole($biometricEmployee),
            'department' => $this->mapBiometricDepartment($biometricEmployee),
            'hire_date' => $biometricEmployee['hire_date'] ?? now()->toDateString(),
            'is_active' => $biometricEmployee['is_active'] ?? true,
            
            // Personal Information from Biometric
            'first_name' => $firstName,
            'last_name' => $lastName,
            'middle_name' => $biometricEmployee['middle_name'] ?? null,
            'birth_date' => $biometricEmployee['birth_date'] ?? null,
            'gender' => $this->mapGender($biometricEmployee['gender'] ?? null),
            'nationality' => $biometricEmployee['nationality'] ?? null,
            'id_number' => $biometricEmployee['id_number'] ?? null,
            'passport_number' => $biometricEmployee['passport_number'] ?? null,
            'visa_number' => $biometricEmployee['visa_number'] ?? null,
            'visa_expiry' => $biometricEmployee['visa_expiry'] ?? null,
            
            // Contact Information
            'address' => $biometricEmployee['address'] ?? null,
            'city' => $biometricEmployee['city'] ?? null,
            'country' => $biometricEmployee['country'] ?? null,
            'emergency_contact_name' => $biometricEmployee['emergency_contact_name'] ?? null,
            'emergency_contact_phone' => $biometricEmployee['emergency_contact_phone'] ?? null,
            
            // Employment Details
            'position_code' => $this->getNestedValue($biometricEmployee, 'position.position_code'),
            'position_name' => $this->getNestedValue($biometricEmployee, 'position.position_name'),
            'department_code' => $this->getNestedValue($biometricEmployee, 'department.dept_code'),
            'area_code' => $this->getNestedValue($biometricEmployee, 'area.area_code'),
            'area_name' => $this->getNestedValue($biometricEmployee, 'area.area_name'),
            'shift_type' => $biometricEmployee['shift_type'] ?? null,
            'work_start_time' => $biometricEmployee['work_start_time'] ?? null,
            'work_end_time' => $biometricEmployee['work_end_time'] ?? null,
            'work_days_per_week' => $biometricEmployee['work_days_per_week'] ?? 6,
            'employment_type' => $biometricEmployee['employment_type'] ?? 'full_time',
            'contract_type' => $biometricEmployee['contract_type'] ?? 'permanent',
            'contract_start_date' => $biometricEmployee['contract_start_date'] ?? null,
            'contract_end_date' => $biometricEmployee['contract_end_date'] ?? null,
            
            // Salary Information
            'basic_salary' => $biometricEmployee['basic_salary'] ?? 0,
            'allowances' => $biometricEmployee['allowances'] ?? 0,
            'overtime_hourly_rate' => $biometricEmployee['overtime_hourly_rate'] ?? 0,
            'bonus_rate' => $biometricEmployee['bonus_rate'] ?? 0,
            'salary_currency' => $biometricEmployee['salary_currency'] ?? 'KWD',
            'bank_name' => $biometricEmployee['bank_name'] ?? null,
            'bank_account_number' => $biometricEmployee['bank_account_number'] ?? null,
            'iban' => $biometricEmployee['iban'] ?? null,
            'hourly_rate' => $biometricEmployee['hourly_rate'] ?? 5.00,
            'standard_hours_per_day' => $biometricEmployee['standard_hours_per_day'] ?? 8,
            'enable_overtime' => $biometricEmployee['enable_overtime'] ?? true,
            'enable_bonus' => $biometricEmployee['enable_bonus'] ?? true,
            'payroll_status' => 'active',
            
            // Biometric Data
            'biometric_id' => $biometricEmployee['id'],
            'employee_code' => $biometricEmployee['emp_code'] ?? $biometricEmployee['id'],
            'biometric_data' => $biometricEmployee,
            'fingerprint_enrolled' => !empty($biometricEmployee['fingerprint']),
            'face_enrolled' => !empty($biometricEmployee['face']),
            'palm_enrolled' => !empty($biometricEmployee['palm']),
            'fingerprint_templates' => $biometricEmployee['fingerprint'] ?? null,
            'face_templates' => $biometricEmployee['face'] ?? null,
            'palm_templates' => $biometricEmployee['palm'] ?? null,
            'last_biometric_sync' => now(),
            
            // Initialize counters
            'total_working_days' => 0,
            'total_absent_days' => 0,
            'total_late_days' => 0,
            'total_overtime_hours' => 0,
            'total_overtime_amount' => 0,
            'vacation_days_used' => 0,
            'vacation_days_remaining' => 21, // Default vacation days
            'sick_days_used' => 0,
            'total_orders_completed' => 0,
            'quality_rejections' => 0,
            'safety_incidents' => 0,
            
            // Default settings
            'preferred_language' => 'ar',
            'email_notifications' => true,
            'sms_notifications' => false,
            'is_probation' => false,
            'is_terminated' => false,
            'is_rehireable' => true,
            'requires_training' => false,
            
            // Metadata
            'last_api_sync' => now(),
            'sync_attempts' => 1,
            'failed_login_attempts' => 0,
            'audit_trail' => [
                [
                    'action' => 'auto_registered',
                    'timestamp' => now()->toISOString(),
                    'source' => 'biometric_api',
                    'details' => 'Automatically registered from biometric system'
                ]
            ]
        ];
    }

    /**
     * تحديث عامل موجود
     */
    protected function updateExistingWorker($worker, $workerData, $biometricEmployee)
    {
        // تحديث بيانات العامل
        $worker->update($workerData);
        
        // التحقق من وجود مستخدم مرتبط
        if (!$worker->user_id) {
            $user = $this->createUserForWorker($worker, $biometricEmployee);
            $worker->update(['user_id' => $user->id]);
            
            return [
                'action' => 'updated',
                'message' => 'Worker updated and user created',
                'worker' => $worker,
                'user' => $user
            ];
        }
        
        return [
            'action' => 'updated',
            'message' => 'Worker data updated',
            'worker' => $worker,
            'user' => $worker->user
        ];
    }

    /**
     * إنشاء عامل ومستخدم جديد
     */
    protected function createNewWorkerAndUser($workerData, $biometricEmployee)
    {
        // إنشاء العامل
        $worker = Worker::create($workerData);
        
        // إنشاء المستخدم
        $user = $this->createUserForWorker($worker, $biometricEmployee);
        
        // ربط العامل بالمستخدم
        $worker->update(['user_id' => $user->id]);
        
        return [
            'action' => 'registered',
            'message' => 'New worker and user created',
            'worker' => $worker,
            'user' => $user
        ];
    }

    /**
     * إنشاء مستخدم للعامل
     */
    protected function createUserForWorker($worker, $biometricEmployee)
    {
        $email = $this->generateUniqueEmail($worker, $biometricEmployee);
        
        return User::create([
            'name' => $worker->name,
            'email' => $email,
            'password' => Hash::make($this->generateDefaultPassword($worker)),
            'role_id' => $this->workerRole->id,
            'department' => $worker->department,
            'is_active' => true
        ]);
    }

    /**
     * إنشاء إيميل فريد للموظف
     */
    protected function generateUniqueEmail($worker, $biometricEmployee)
    {
        // إذا كان لديه إيميل في البيومترك واستخدمه
        if (!empty($biometricEmployee['email']) && filter_var($biometricEmployee['email'], FILTER_VALIDATE_EMAIL)) {
            $email = $biometricEmployee['email'];
            
            // التحقق من عدم وجود إيميل مكرر
            if (!User::where('email', $email)->exists()) {
                return $email;
            }
        }
        
        // إنشاء إيميل من اسم الموظف
        $baseEmail = Str::slug($worker->name) . '@workshop.local';
        $email = $baseEmail;
        $counter = 1;
        
        // التأكد من أن الإيميل فريد
        while (User::where('email', $email)->exists()) {
            $email = Str::slug($worker->name) . $counter . '@workshop.local';
            $counter++;
        }
        
        return $email;
    }

    /**
     * إنشاء كلمة مرور افتراضية
     */
    protected function generateDefaultPassword($worker)
    {
        return 'worker123'; // يمكن تخصيصها حسب سياسة الشركة
    }

    /**
     * تحويل دور البيومترك إلى نص
     */
    protected function mapBiometricRole($biometricEmployee)
    {
        if (isset($biometricEmployee['position']) && is_array($biometricEmployee['position'])) {
            return $biometricEmployee['position']['position_name'] ?? 'Worker';
        }
        
        return $biometricEmployee['position'] ?? 'Worker';
    }

    /**
     * تحويل قسم البيومترك إلى نص
     */
    protected function mapBiometricDepartment($biometricEmployee)
    {
        if (isset($biometricEmployee['department']) && is_array($biometricEmployee['department'])) {
            return $biometricEmployee['department']['dept_name'] ?? 'Production';
        }
        
        return $biometricEmployee['department'] ?? 'Production';
    }

    /**
     * التحقق من أن الموظف يجب تسجيله (فلاتر إضافية إذا لزم الأمر)
     */
    protected function shouldRegisterEmployee($biometricEmployee)
    {
        // يمكن إضافة فلاتر هنا حسب الحاجة
        // مثلاً: استبعاد موظفين غير نشطين، أو أقسام معينة
        
        return true;
    }
    
    /**
     * الحصول على قيمة متداخلة من مصفوفة
     */
    protected function getNestedValue($array, $path, $default = null)
    {
        $keys = explode('.', $path);
        $current = $array;
        
        foreach ($keys as $key) {
            if (!is_array($current) || !isset($current[$key])) {
                return $default;
            }
            $current = $current[$key];
        }
        
        return $current;
    }
    
    /**
     * تحويل الجنس إلى تنسيق موحد
     */
    protected function mapGender($gender)
    {
        if (empty($gender)) {
            return null;
        }
        
        $gender = strtolower(trim($gender));
        
        if (in_array($gender, ['m', 'male', 'ذكر', '1'])) {
            return 'male';
        }
        
        if (in_array($gender, ['f', 'female', 'أنثى', '0'])) {
            return 'female';
        }
        
        return null;
    }
    
    /**
     * تحديث أو إنشاء سجل حضور للعامل
     */
    public function syncWorkerAttendance($workerId, $attendanceData)
    {
        $worker = Worker::find($workerId);
        if (!$worker) {
            return false;
        }
        
        // تحديث إحصائيات الحضور
        $worker->update([
            'total_working_days' => $attendanceData['working_days'] ?? $worker->total_working_days,
            'total_absent_days' => $attendanceData['absent_days'] ?? $worker->total_absent_days,
            'total_late_days' => $attendanceData['late_days'] ?? $worker->total_late_days,
            'total_overtime_hours' => $attendanceData['overtime_hours'] ?? $worker->total_overtime_hours,
            'attendance_percentage' => $attendanceData['attendance_percentage'] ?? $worker->attendance_percentage,
            'last_api_sync' => now()
        ]);
        
        return true;
    }
    
    /**
     * تحديث أداء العامل في الإنتاج
     */
    public function syncWorkerPerformance($workerId, $performanceData)
    {
        $worker = Worker::find($workerId);
        if (!$worker) {
            return false;
        }
        
        // تحديث بيانات الأداء
        $worker->update([
            'performance_rating' => $performanceData['rating'] ?? $worker->performance_rating,
            'productivity_score' => $performanceData['productivity'] ?? $worker->productivity_score,
            'quality_score' => $performanceData['quality'] ?? $worker->quality_score,
            'total_orders_completed' => $performanceData['orders_completed'] ?? $worker->total_orders_completed,
            'average_completion_time' => $performanceData['avg_completion_time'] ?? $worker->average_completion_time,
            'efficiency_rating' => $performanceData['efficiency'] ?? $worker->efficiency_rating,
            'quality_rejections' => $performanceData['rejections'] ?? $worker->quality_rejections,
            'defect_rate' => $performanceData['defect_rate'] ?? $worker->defect_rate,
            'stage_performance' => $performanceData['stage_performance'] ?? $worker->stage_performance,
            'last_api_sync' => now()
        ]);
        
        return true;
    }
    
    /**
     * تحديث بيانات الراتب للعامل
     */
    public function syncWorkerPayroll($workerId, $payrollData)
    {
        $worker = Worker::find($workerId);
        if (!$worker) {
            return false;
        }
        
        // تحديث بيانات الراتب
        $worker->update([
            'ytd_gross_pay' => $payrollData['gross_pay'] ?? $worker->ytd_gross_pay,
            'ytd_net_pay' => $payrollData['net_pay'] ?? $worker->ytd_net_pay,
            'ytd_overtime' => $payrollData['overtime'] ?? $worker->ytd_overtime,
            'ytd_bonuses' => $payrollData['bonuses'] ?? $worker->ytd_bonuses,
            'ytd_deductions' => $payrollData['deductions'] ?? $worker->ytd_deductions,
            'last_payroll_date' => $payrollData['last_payroll_date'] ?? $worker->last_payroll_date,
            'payroll_history' => $payrollData['history'] ?? $worker->payroll_history,
            'last_api_sync' => now()
        ]);
        
        return true;
    }
}