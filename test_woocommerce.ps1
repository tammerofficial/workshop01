$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    "url" = "https://hudaaljarallah.net/"
    "consumer_key" = "ck_3a5c739c20336c33cbee2453cccf56a6441ef6fe"
    "consumer_secret" = "cs_b091ba4fb33a6e4b10612c536db882fe0fa8c6aa"
} | ConvertTo-Json

try {
    Write-Host "Testing WooCommerce connection..."
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/woocommerce/test-connection" -Method POST -Headers $headers -Body $body
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseText = $reader.ReadToEnd()
        Write-Host "Response: $responseText" -ForegroundColor Yellow
    }
} 