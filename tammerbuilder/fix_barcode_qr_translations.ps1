# Fix Barcode & QR Management Translations - Workshop Management System
# Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Description: Fix barcode QR management texts to be dynamic based on language

Write-Host "🔧 Fixing Barcode & QR Management Translations..." -ForegroundColor Green

# 1. Added Missing Translation Keys
Write-Host "✅ Added Missing Translation Keys:" -ForegroundColor Yellow
Write-Host "   - barcodeQR.subtitle: 'Generate and manage barcodes and QR codes' / 'توليد وإدارة الباركود وأكواد QR'" -ForegroundColor White
Write-Host "   - barcodeQR.update: 'Update' / 'تحديث'" -ForegroundColor White
Write-Host "   - barcodeQR.generatedCodes: 'Generated Codes' / 'الأكواد المولدة'" -ForegroundColor White
Write-Host "   - barcodeQR.totalScans: 'Total Scans' / 'إجمالي المسح'" -ForegroundColor White
Write-Host "   - barcodeQR.successRate: 'Success Rate' / 'معدل النجاح'" -ForegroundColor White
Write-Host "   - barcodeQR.mostScanned: 'Most Scanned' / 'الأكثر مسحاً'" -ForegroundColor White
Write-Host "   - barcodeQR.generateCodes: 'Generate Codes' / 'توليد الأكواد'" -ForegroundColor White
Write-Host "   - barcodeQR.scanCodes: 'Scan Codes' / 'مسح الأكواد'" -ForegroundColor White
Write-Host "   - barcodeQR.statistics: 'Statistics' / 'الإحصائيات'" -ForegroundColor White
Write-Host "   - barcodeQR.productBarcode: 'Product Barcode' / 'باركود منتج'" -ForegroundColor White
Write-Host "   - barcodeQR.orderQR: 'Order QR' / 'QR طلبية'" -ForegroundColor White
Write-Host "   - barcodeQR.materialQR: 'Material QR' / 'QR مادة'" -ForegroundColor White
Write-Host "   - barcodeQR.batchGenerate: 'Batch Generate' / 'توليد مجمع'" -ForegroundColor White

# 2. Updated Component
Write-Host "✅ Updated Component:" -ForegroundColor Yellow
Write-Host "   - src/pages/BarcodeQRManagement.tsx" -ForegroundColor White
Write-Host "   - Replaced all hardcoded Arabic text with translation keys" -ForegroundColor White
Write-Host "   - Updated tabs, statistics cards, and generation buttons" -ForegroundColor White
Write-Host "   - Now supports both English and Arabic languages" -ForegroundColor White

# 3. Files Modified
Write-Host "📝 Files Modified:" -ForegroundColor Yellow
Write-Host "   - src/locales/en.json (added missing barcodeQR keys)" -ForegroundColor White
Write-Host "   - src/locales/ar.json (added missing barcodeQR keys)" -ForegroundColor White
Write-Host "   - src/pages/BarcodeQRManagement.tsx (updated to use translations)" -ForegroundColor White

# 4. Original Arabic Text
Write-Host "📋 Original Arabic Text:" -ForegroundColor Yellow
Write-Host "   - تحديث" -ForegroundColor White
Write-Host "   - الأكواد المولدة" -ForegroundColor White
Write-Host "   - إجمالي المسح" -ForegroundColor White
Write-Host "   - معدل النجاح" -ForegroundColor White
Write-Host "   - الأكثر مسحاً" -ForegroundColor White
Write-Host "   - توليد الأكواد" -ForegroundColor White
Write-Host "   - مسح الأكواد" -ForegroundColor White
Write-Host "   - السجل" -ForegroundColor White
Write-Host "   - الإحصائيات" -ForegroundColor White
Write-Host "   - باركود منتج" -ForegroundColor White
Write-Host "   - QR طلبية" -ForegroundColor White
Write-Host "   - QR مادة" -ForegroundColor White
Write-Host "   - توليد مجمع" -ForegroundColor White

# 5. English Translation
Write-Host "🔤 English Translation:" -ForegroundColor Yellow
Write-Host "   - Update" -ForegroundColor White
Write-Host "   - Generated Codes" -ForegroundColor White
Write-Host "   - Total Scans" -ForegroundColor White
Write-Host "   - Success Rate" -ForegroundColor White
Write-Host "   - Most Scanned" -ForegroundColor White
Write-Host "   - Generate Codes" -ForegroundColor White
Write-Host "   - Scan Codes" -ForegroundColor White
Write-Host "   - History" -ForegroundColor White
Write-Host "   - Statistics" -ForegroundColor White
Write-Host "   - Product Barcode" -ForegroundColor White
Write-Host "   - Order QR" -ForegroundColor White
Write-Host "   - Material QR" -ForegroundColor White
Write-Host "   - Batch Generate" -ForegroundColor White

# 6. Translation Keys Now Available
Write-Host "🔑 Translation Keys Now Available:" -ForegroundColor Yellow
Write-Host "   - t('barcodeQR.title') - Barcode & QR Management / إدارة الباركود و QR" -ForegroundColor White
Write-Host "   - t('barcodeQR.subtitle') - Generate and manage barcodes and QR codes / توليد وإدارة الباركود وأكواد QR" -ForegroundColor White
Write-Host "   - t('barcodeQR.update') - Update / تحديث" -ForegroundColor White
Write-Host "   - t('barcodeQR.generatedCodes') - Generated Codes / الأكواد المولدة" -ForegroundColor White
Write-Host "   - t('barcodeQR.totalScans') - Total Scans / إجمالي المسح" -ForegroundColor White
Write-Host "   - t('barcodeQR.successRate') - Success Rate / معدل النجاح" -ForegroundColor White
Write-Host "   - t('barcodeQR.mostScanned') - Most Scanned / الأكثر مسحاً" -ForegroundColor White
Write-Host "   - t('barcodeQR.generateCodes') - Generate Codes / توليد الأكواد" -ForegroundColor White
Write-Host "   - t('barcodeQR.scanCodes') - Scan Codes / مسح الأكواد" -ForegroundColor White
Write-Host "   - t('barcodeQR.statistics') - Statistics / الإحصائيات" -ForegroundColor White
Write-Host "   - t('barcodeQR.productBarcode') - Product Barcode / باركود منتج" -ForegroundColor White
Write-Host "   - t('barcodeQR.orderQR') - Order QR / QR طلبية" -ForegroundColor White
Write-Host "   - t('barcodeQR.materialQR') - Material QR / QR مادة" -ForegroundColor White
Write-Host "   - t('barcodeQR.batchGenerate') - Batch Generate / توليد مجمع" -ForegroundColor White

Write-Host "`n🎉 Barcode & QR Management translations have been fixed!" -ForegroundColor Green
Write-Host "   All texts now dynamically change based on the selected language." -ForegroundColor White 