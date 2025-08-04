# Adjust Common Translation Keys - Workshop Management System
# Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Description: Added missing translation keys to ensure consistency between English and Arabic

Write-Host "🔧 Adjusting Common Translation Keys..." -ForegroundColor Green

# 1. Added Missing Keys to English Translation
Write-Host "✅ Added Missing Keys to en.json:" -ForegroundColor Yellow
Write-Host "   - Added 'new': 'New'" -ForegroundColor White
Write-Host "   - Added 'hot': 'Hot'" -ForegroundColor White
Write-Host "   - Added 'secure': 'Secure'" -ForegroundColor White
Write-Host "   - Added 'viewDetails': 'View Details'" -ForegroundColor White

# 2. Translation Consistency
Write-Host "✅ Translation Consistency:" -ForegroundColor Yellow
Write-Host "   - English: 'new' = 'New'" -ForegroundColor White
Write-Host "   - Arabic: 'new' = 'جديد'" -ForegroundColor White
Write-Host "   - Both files now have matching keys" -ForegroundColor White

# 3. Files Modified
Write-Host "📝 Files Modified:" -ForegroundColor Yellow
Write-Host "   - src/locales/en.json" -ForegroundColor White

# 4. Keys Added
Write-Host "🔑 Keys Added to Common Section:" -ForegroundColor Yellow
Write-Host "   - new: 'New'" -ForegroundColor White
Write-Host "   - hot: 'Hot'" -ForegroundColor White
Write-Host "   - secure: 'Secure'" -ForegroundColor White
Write-Host "   - viewDetails: 'View Details'" -ForegroundColor White

Write-Host "`n🎉 Common translation keys have been adjusted!" -ForegroundColor Green
Write-Host "   The 'common.new' text and other missing keys are now properly configured." -ForegroundColor White 