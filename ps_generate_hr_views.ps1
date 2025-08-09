# PowerShell Script to Generate Blade Views for Human Resources Module
# ----------------------------------------------------------------
# This script creates Blade views, routes, and sidebar links
# for the Human Resources module, following the React design style.
# ----------------------------------------------------------------

$ErrorActionPreference = 'Stop'
$basePath = "C:\laragon\www\workshop01\api"
$viewsPath = "$basePath\resources\views"
$routesFile = "$basePath\routes\web.php"
$sidebarFile = "$basePath\resources\views\partials\sidebar.blade.php"
$logFile = "$basePath\storage\logs\cursor_log_$(Get-Date -Format 'yyyyMMdd').txt"

# --- Helper Functions ---
Function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Add-Content -Path $logFile -Value $logMessage
    Write-Host $logMessage -ForegroundColor Cyan
}

Function Create-Directory {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
        Write-Log "Directory created: $Path"
    }
}

Function Create-BladeFile {
    param(
        [string]$Module,
        [string]$File,
        [string]$Content
    )
    $dirPath = "$viewsPath\modules\$Module"
    Create-Directory $dirPath
    $filePath = "$dirPath\$File"
    Set-Content -Path $filePath -Value $Content -Encoding UTF8
    Write-Log "Blade file created: $filePath"
}

# --- Main Logic ---
Write-Log "--- Starting Human Resources Blade UI Generation ---"

# 1. Create Directories and Blade Files
# --------------------------------------

# --- Workers (Workers Management) ---
Create-Directory "$viewsPath\modules\workers"

# workers/index.blade.php
$workersIndexContent = @"
@extends('layouts.app')

@section('title', 'إدارة العمال')

@section('content')
<div x-data="{
    search: '',
    workers: [
        { id: 1, name: 'أحمد محمود', role: 'خياط', status: 'active', department: 'الخياطة', hire_date: '2023-01-15' },
        { id: 2, name: 'فاطمة علي', role: 'مصمم', status: 'active', department: 'التصميم', hire_date: '2022-11-20' },
        { id: 3, name: 'خالد عبدالله', role: 'عامل انتاج', status: 'inactive', department: 'الإنتاج', hire_date: '2023-03-10' },
        { id: 4, name: 'سارة حسين', role: 'مدير جودة', status: 'active', department: 'الجودة', hire_date: '2021-09-01' }
    ],
    get filteredWorkers() {
        if (this.search === '') {
            return this.workers;
        }
        return this.workers.filter(worker => 
            worker.name.toLowerCase().includes(this.search.toLowerCase()) ||
            worker.role.toLowerCase().includes(this.search.toLowerCase())
        );
    }
}">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">إدارة العمال</h1>
        <a href="{{ route('ui.workers.create') }}" class="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>
            <span>إضافة عامل جديد</span>
        </a>
    </div>

    <!-- Search and Filters -->
    <div class="mb-4">
        <input x-model="search" type="text" placeholder="ابحث عن عامل..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
    </div>

    <!-- Workers Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوظيفة</th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ التعيين</th>
                    <th scope="col" class="relative px-6 py-3"><span class="sr-only">Edit</span></th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <template x-for="worker in filteredWorkers" :key="worker.id">
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="text-sm font-medium text-gray-900" x-text="worker.name"></div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" x-text="worker.role"></td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                                :class="worker.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                                x-text="worker.status === 'active' ? 'نشط' : 'غير نشط'">
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" x-text="worker.hire_date"></td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href="#" class="text-blue-600 hover:text-blue-900">تعديل</a>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
</div>
@endsection
"@
Create-BladeFile -Module "workers" -File "index.blade.php" -Content $workersIndexContent

# workers/create.blade.php
$workersCreateContent = @"
@extends('layouts.app')

@section('title', 'إضافة عامل جديد')

@section('content')
<div class="max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">إضافة عامل جديد</h1>
        <a href="{{ route('ui.workers.index') }}" class="text-sm text-gray-600 hover:text-gray-900">
            &larr; العودة إلى قائمة العمال
        </a>
    </div>
    
    <div class="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <form action="#" method="POST" class="space-y-6">
            @csrf
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700">الاسم الكامل</label>
                <input type="text" name="name" id="name" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg" required>
            </div>
            <div>
                <label for="role" class="block text-sm font-medium text-gray-700">الوظيفة</label>
                <input type="text" name="role" id="role" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg" required>
            </div>
            <div>
                <label for="department" class="block text-sm font-medium text-gray-700">القسم</label>
                <select id="department" name="department" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option>الخياطة</option>
                    <option>التصميم</option>
                    <option>الإنتاج</option>
                    <option>الجودة</option>
                </select>
            </div>
            <div>
                <label for="hire_date" class="block text-sm font-medium text-gray-700">تاريخ التعيين</label>
                <input type="date" name="hire_date" id="hire_date" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg" required>
            </div>
            <div class="flex justify-end pt-4">
                <button type="submit" class="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    حفظ العامل
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
"@
Create-BladeFile -Module "workers" -File "create.blade.php" -Content $workersCreateContent

# --- Payroll (Salaries) ---
Create-Directory "$viewsPath\modules\payroll"

# payroll/index.blade.php
$payrollIndexContent = @"
@extends('layouts.app')
@section('title', 'كشوف المرتبات')
@section('content')
<h1 class="text-2xl font-bold text-gray-800">كشوف المرتبات</h1>
<p class="text-gray-600 mt-2">هذه الصفحة قيد الإنشاء لعرض كشوف المرتبات.</p>
@endsection
"@
Create-BladeFile -Module "payroll" -File "index.blade.php" -Content $payrollIndexContent

# --- Biometrics (Attendance) ---
Create-Directory "$viewsPath\modules\biometrics"

# biometrics/index.blade.php
$biometricsIndexContent = @"
@extends('layouts.app')
@section('title', 'سجلات البصمة')
@section('content')
<h1 class="text-2xl font-bold text-gray-800">سجلات البصمة</h1>
<p class="text-gray-600 mt-2">هذه الصفحة قيد الإنشاء لعرض سجلات الحضور والانصراف.</p>
@endsection
"@
Create-BladeFile -Module "biometrics" -File "index.blade.php" -Content $biometricsIndexContent


# 2. Add Routes to web.php
# -------------------------
Write-Log "Adding routes to web.php"
$newRoutes = @"

// UI Routes for Human Resources
Route::prefix('ui/hr')->group(function () {
    // Workers
    Route::get('/workers', function () { return view('modules.workers.index'); })->name('ui.workers.index');
    Route::get('/workers/create', function () { return view('modules.workers.create'); })->name('ui.workers.create');
    
    // Payroll
    Route::get('/payroll', function () { return view('modules.payroll.index'); })->name('ui.payroll.index');
    
    // Biometrics
    Route::get('/biometrics', function () { return view('modules.biometrics.index'); })->name('ui.biometrics.index');
});
"@

Add-Content -Path $routesFile -Value $newRoutes
Write-Log "Human Resources routes added successfully."


# 3. Update Sidebar
# -----------------
Write-Log "Updating sidebar with Human Resources links."
$sidebarContent = Get-Content -Path $sidebarFile -Raw
$hrLink = @"
    <div class="border-t border-gray-200 my-2"></div>
    <p class="text-xs font-semibold text-gray-500 px-3 mb-2 mt-3 uppercase">الموارد البشرية</p>
    
    <a href="{{ route('ui.workers.index') }}" 
       class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out"
       :class="{
         'bg-blue-50 text-blue-700': path.startsWith('/ui/hr/workers'),
         'text-gray-600 hover:text-gray-900 hover:bg-gray-50': !path.startsWith('/ui/hr/workers')
       }">
      <div class="p-1 rounded-lg" :class="path.startsWith('/ui/hr/workers') ? 'bg-blue-100' : 'group-hover:bg-gray-100'">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
      </div>
      <span>العمال</span>
    </a>

    <a href="{{ route('ui.payroll.index') }}" 
       class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out"
       :class="{
         'bg-blue-50 text-blue-700': path.startsWith('/ui/hr/payroll'),
         'text-gray-600 hover:text-gray-900 hover:bg-gray-50': !path.startsWith('/ui/hr/payroll')
       }">
      <div class="p-1 rounded-lg" :class="path.startsWith('/ui/hr/payroll') ? 'bg-blue-100' : 'group-hover:bg-gray-100'">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6V5.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v.75m0 0h1.5m-1.5 0v.75a.75.75 0 0 1-1.5 0V5.25m1.5 0v.75a.75.75 0 0 1-1.5 0V5.25m1.5 0h.75a.75.75 0 0 1 .75.75v.75m-1.5 0v.75a.75.75 0 0 1-1.5 0V5.25m9 3.75h1.5a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-1.5 0v-.75a.75.75 0 0 1 .75-.75ZM9 15h.01M15 15h.01M10.5 15a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm2.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm0 1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 1.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm0 1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" /></svg>
      </div>
      <span>المرتبات</span>
    </a>
</template>
"@
# Insert before the last closing </template> tag
$updatedSidebar = $sidebarContent -replace '</template>\s+<!-- Divider -->', "$hrLink`n</template>`n<!-- Divider -->"
Set-Content -Path $sidebarFile -Value $updatedSidebar -Encoding UTF8
Write-Log "Sidebar updated successfully."

# --- Finalization ---
Write-Log "--- Human Resources Blade UI Generation Completed Successfully ---"
Write-Log "Run 'php artisan view:clear' and 'php artisan route:clear' to see changes."

# Save the script itself
$MyInvocation.MyCommand.Path | Set-Content -Value ($MyInvocation.MyCommand.Definition) -Encoding UTF8

Write-Host "PowerShell script 'ps_generate_hr_views.ps1' has been updated and executed." -ForegroundColor Green
Write-Host "You can now check the generated files and the updated sidebar." -ForegroundColor Yellow

