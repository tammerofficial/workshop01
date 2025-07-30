# Test Employee Update Script
# This script tests the biometric employee update functionality

Write-Host "🔧 Testing Employee Update Functionality" -ForegroundColor Green

Write-Host "`n📋 Test Details:" -ForegroundColor Yellow
Write-Host "Employee ID: 222" -ForegroundColor Cyan
Write-Host "Employee Code: 222" -ForegroundColor Cyan
Write-Host "First Name: asmaa nasser" -ForegroundColor Cyan
Write-Host "Last Name: Alshammari" -ForegroundColor Cyan
Write-Host "Email: ali@tammerofficial.com" -ForegroundColor Cyan
Write-Host "Mobile: 99007142" -ForegroundColor Cyan
Write-Host "Department: AlHuda WorkShop" -ForegroundColor Cyan
Write-Host "Position: Position" -ForegroundColor Cyan
Write-Host "Hire Date: 02/01/2003" -ForegroundColor Cyan

Write-Host "`n🌐 Testing Laravel API Endpoint:" -ForegroundColor Yellow

# Test data
$updateData = @{
    emp_code = "222"
    first_name = "asmaa nasser"
    last_name = "Alshammari"
    email = "ali@tammerofficial.com"
    mobile = "99007142"
    department = 1
    area = @(1)
    position = 1
    hire_date = "2003-01-02"
}

# Convert to JSON
$jsonData = $updateData | ConvertTo-Json -Depth 3

Write-Host "JSON Data to send:" -ForegroundColor Magenta
Write-Host $jsonData -ForegroundColor White

# Test Laravel endpoint
try {
    Write-Host "`n🚀 Sending PUT request to Laravel API..." -ForegroundColor Green
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/biometric/employees/222" `
                                  -Method PUT `
                                  -ContentType "application/json" `
                                  -Body $jsonData `
                                  -ErrorAction Stop
    
    Write-Host "✅ Laravel API Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
    
} catch {
    Write-Host "❌ Laravel API Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host "`n🔍 Check Laravel Logs:" -ForegroundColor Yellow
Write-Host "Run: tail -f api/storage/logs/laravel.log" -ForegroundColor Cyan

Write-Host "`n🌍 Testing Direct Biometric API:" -ForegroundColor Yellow

# Direct test to biometric system (if token available)
try {
    Write-Host "🔐 Getting authentication token..." -ForegroundColor Green
    
    $authData = @{
        username = "your_username"
        password = "your_password"
    }
    
    # Note: Replace with actual biometric system credentials
    Write-Host "⚠️  Replace credentials in script for direct biometric test" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Direct biometric test skipped - add credentials" -ForegroundColor Red
}

Write-Host "`n🎯 Debugging Steps:" -ForegroundColor Yellow
Write-Host "1. Check Laravel logs: api/storage/logs/laravel.log" -ForegroundColor Cyan
Write-Host "2. Check browser console for frontend errors" -ForegroundColor Cyan
Write-Host "3. Verify biometric API token is valid" -ForegroundColor Cyan
Write-Host "4. Check if employee ID 222 exists in biometric system" -ForegroundColor Cyan
Write-Host "5. Verify department and position IDs are correct" -ForegroundColor Cyan

Write-Host "`n✅ Test script completed!" -ForegroundColor Green