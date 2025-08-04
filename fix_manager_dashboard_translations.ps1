# Fix Manager Dashboard Translations - Workshop Management System
# Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Description: Fix manager dashboard texts to be dynamic based on language

Write-Host "🔧 Fixing Manager Dashboard Translations..." -ForegroundColor Green

# 1. Added Missing Translation Keys
Write-Host "✅ Added Missing Translation Keys:" -ForegroundColor Yellow

Write-Host "📊 Manager Dashboard Keys:" -ForegroundColor Cyan
Write-Host "   - page.managerDashboard.title: 'Manager Dashboard' / 'لوحة تحكم المدير'" -ForegroundColor White
Write-Host "   - page.managerDashboard.subtitle: 'Real-time production monitoring and management' / 'مراقبة وإدارة الإنتاج في الوقت الفعلي'" -ForegroundColor White
Write-Host "   - page.managerDashboard.lastUpdate: 'Last Update' / 'آخر تحديث'" -ForegroundColor White
Write-Host "   - page.managerDashboard.update: 'Update' / 'تحديث'" -ForegroundColor White
Write-Host "   - page.managerDashboard.completedOrdersToday: 'Completed Orders Today' / 'الطلبيات المكتملة اليوم'" -ForegroundColor White
Write-Host "   - page.managerDashboard.activeWorkers: 'Active Workers' / 'العمال النشطين'" -ForegroundColor White
Write-Host "   - page.managerDashboard.averageEfficiency: 'Average Efficiency' / 'متوسط الكفاءة'" -ForegroundColor White
Write-Host "   - page.managerDashboard.averageQuality: 'Average Quality' / 'متوسط الجودة'" -ForegroundColor White
Write-Host "   - page.managerDashboard.productionFlow: 'Production Flow' / 'تدفق الإنتاج'" -ForegroundColor White
Write-Host "   - page.managerDashboard.sewing: 'Sewing' / 'الخياطة'" -ForegroundColor White
Write-Host "   - page.managerDashboard.qualityControl: 'Quality Control' / 'مراقبة الجودة'" -ForegroundColor White
Write-Host "   - page.managerDashboard.delivery: 'Delivery' / 'التسليم'" -ForegroundColor White
Write-Host "   - page.managerDashboard.topWorkersToday: 'Top Workers Today' / 'أفضل العمال اليوم'" -ForegroundColor White
Write-Host "   - page.managerDashboard.realTimeMetrics: 'Real-time Metrics' / 'المقاييس الفورية'" -ForegroundColor White
Write-Host "   - page.managerDashboard.activeTasks: 'Active Tasks' / 'مهام نشطة'" -ForegroundColor White
Write-Host "   - page.managerDashboard.connectedWorkers: 'Connected Workers' / 'عمال متصلين'" -ForegroundColor White
Write-Host "   - page.managerDashboard.pendingOrders: 'Pending Orders' / 'طلبيات في الانتظار'" -ForegroundColor White
Write-Host "   - page.managerDashboard.urgentOrders: 'Urgent Orders' / 'طلبيات عاجلة'" -ForegroundColor White

# 2. Updated Component
Write-Host "✅ Updated Component:" -ForegroundColor Yellow
Write-Host "   - src/pages/ManagerDashboard.tsx" -ForegroundColor White
Write-Host "   - Replaced all hardcoded Arabic text with translation keys" -ForegroundColor White
Write-Host "   - Updated header, overview cards, production flow, and metrics sections" -ForegroundColor White
Write-Host "   - Now supports both English and Arabic languages" -ForegroundColor White

# 3. Files Modified
Write-Host "📝 Files Modified:" -ForegroundColor Yellow
Write-Host "   - src/locales/en.json (added missing page.managerDashboard keys)" -ForegroundColor White
Write-Host "   - src/locales/ar.json (added missing page.managerDashboard keys)" -ForegroundColor White
Write-Host "   - src/pages/ManagerDashboard.tsx (updated to use translations)" -ForegroundColor White

# 4. Original Arabic Text
Write-Host "📋 Original Arabic Text:" -ForegroundColor Yellow
Write-Host "   - آخر تحديث" -ForegroundColor White
Write-Host "   - تحديث" -ForegroundColor White
Write-Host "   - الطلبيات المكتملة اليوم" -ForegroundColor White
Write-Host "   - العمال النشطين" -ForegroundColor White
Write-Host "   - متوسط الكفاءة" -ForegroundColor White
Write-Host "   - متوسط الجودة" -ForegroundColor White
Write-Host "   - تدفق الإنتاج" -ForegroundColor White
Write-Host "   - أفضل العمال اليوم" -ForegroundColor White
Write-Host "   - المقاييس الفورية" -ForegroundColor White
Write-Host "   - مهام نشطة" -ForegroundColor White
Write-Host "   - عمال متصلين" -ForegroundColor White
Write-Host "   - طلبيات في الانتظار" -ForegroundColor White
Write-Host "   - طلبيات عاجلة" -ForegroundColor White

# 5. English Translation
Write-Host "🔤 English Translation:" -ForegroundColor Yellow
Write-Host "   - Last Update" -ForegroundColor White
Write-Host "   - Update" -ForegroundColor White
Write-Host "   - Completed Orders Today" -ForegroundColor White
Write-Host "   - Active Workers" -ForegroundColor White
Write-Host "   - Average Efficiency" -ForegroundColor White
Write-Host "   - Average Quality" -ForegroundColor White
Write-Host "   - Production Flow" -ForegroundColor White
Write-Host "   - Top Workers Today" -ForegroundColor White
Write-Host "   - Real-time Metrics" -ForegroundColor White
Write-Host "   - Active Tasks" -ForegroundColor White
Write-Host "   - Connected Workers" -ForegroundColor White
Write-Host "   - Pending Orders" -ForegroundColor White
Write-Host "   - Urgent Orders" -ForegroundColor White

# 6. Translation Keys Now Available
Write-Host "🔑 Translation Keys Now Available:" -ForegroundColor Yellow
Write-Host "   - t('page.managerDashboard.title') - Manager Dashboard / لوحة تحكم المدير" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.subtitle') - Real-time production monitoring and management / مراقبة وإدارة الإنتاج في الوقت الفعلي" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.lastUpdate') - Last Update / آخر تحديث" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.update') - Update / تحديث" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.completedOrdersToday') - Completed Orders Today / الطلبيات المكتملة اليوم" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.activeWorkers') - Active Workers / العمال النشطين" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.averageEfficiency') - Average Efficiency / متوسط الكفاءة" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.averageQuality') - Average Quality / متوسط الجودة" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.productionFlow') - Production Flow / تدفق الإنتاج" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.sewing') - Sewing / الخياطة" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.qualityControl') - Quality Control / مراقبة الجودة" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.delivery') - Delivery / التسليم" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.topWorkersToday') - Top Workers Today / أفضل العمال اليوم" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.realTimeMetrics') - Real-time Metrics / المقاييس الفورية" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.activeTasks') - Active Tasks / مهام نشطة" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.connectedWorkers') - Connected Workers / عمال متصلين" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.pendingOrders') - Pending Orders / طلبيات في الانتظار" -ForegroundColor White
Write-Host "   - t('page.managerDashboard.urgentOrders') - Urgent Orders / طلبيات عاجلة" -ForegroundColor White

# 7. Dashboard Features
Write-Host "📈 Dashboard Features:" -ForegroundColor Yellow
Write-Host "   - Real-time production monitoring" -ForegroundColor White
Write-Host "   - Worker performance tracking" -ForegroundColor White
Write-Host "   - Production flow visualization" -ForegroundColor White
Write-Host "   - Quality metrics display" -ForegroundColor White
Write-Host "   - Active task monitoring" -ForegroundColor White
Write-Host "   - Order status tracking" -ForegroundColor White
Write-Host "   - Worker efficiency analytics" -ForegroundColor White

Write-Host "`n🎉 Manager Dashboard translations have been fixed!" -ForegroundColor Green
Write-Host "   All texts now dynamically change based on the selected language." -ForegroundColor White
Write-Host "   The manager dashboard now fully supports both English and Arabic." -ForegroundColor White 