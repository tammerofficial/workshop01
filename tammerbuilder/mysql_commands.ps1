# 🗄️ أوامر MySQL/MariaDB - Workshop Management System
# MySQL/MariaDB Commands for Workshop Database Setup

Write-Host "🗄️ أوامر MySQL/MariaDB للمشروع" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray

Write-Host "`n📋 الأوامر الأساسية:" -ForegroundColor Cyan

Write-Host "`n1️⃣ الاتصال بـ MySQL:" -ForegroundColor Yellow
Write-Host "mysql -u root -p" -ForegroundColor White

Write-Host "`n2️⃣ إنشاء قاعدة البيانات:" -ForegroundColor Yellow
Write-Host "CREATE DATABASE workshop_asdgdgh45 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" -ForegroundColor White

Write-Host "`n3️⃣ استخدام قاعدة البيانات:" -ForegroundColor Yellow
Write-Host "USE workshop_asdgdgh45;" -ForegroundColor White

Write-Host "`n4️⃣ إنشاء مستخدم (اختياري):" -ForegroundColor Yellow
Write-Host "CREATE USER 'workshop_user'@'localhost' IDENTIFIED BY 'secure_password';" -ForegroundColor White
Write-Host "GRANT ALL PRIVILEGES ON workshop_asdgdgh45.* TO 'workshop_user'@'localhost';" -ForegroundColor White
Write-Host "FLUSH PRIVILEGES;" -ForegroundColor White

Write-Host "`n5️⃣ عرض قواعد البيانات:" -ForegroundColor Yellow
Write-Host "SHOW DATABASES;" -ForegroundColor White

Write-Host "`n6️⃣ عرض الجداول:" -ForegroundColor Yellow
Write-Host "SHOW TABLES;" -ForegroundColor White

Write-Host "`n7️⃣ حذف قاعدة البيانات (حذر!):" -ForegroundColor Yellow
Write-Host "DROP DATABASE workshop_asdgdgh45;" -ForegroundColor Red

Write-Host "`n🔧 أوامر Laragon/XAMPP:" -ForegroundColor Cyan

Write-Host "`n📍 من Command Line:" -ForegroundColor Yellow
Write-Host "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe -u root -p" -ForegroundColor White

Write-Host "`n📍 من phpMyAdmin:" -ForegroundColor Yellow
Write-Host "http://localhost/phpmyadmin" -ForegroundColor White

Write-Host "`n⚡ تشغيل SQL Script:" -ForegroundColor Cyan
Write-Host "mysql -u root -p workshop_asdgdgh45 < tammerbuilder/setup_database.sql" -ForegroundColor White

Write-Host "`n📊 فحص حالة قاعدة البيانات:" -ForegroundColor Cyan
Write-Host "SELECT COUNT(*) as 'Tables Count' FROM information_schema.tables WHERE table_schema = 'workshop_asdgdgh45';" -ForegroundColor White

Write-Host "`n🔍 معلومات مفيدة:" -ForegroundColor Cyan
Write-Host "  • اسم قاعدة البيانات: workshop_asdgdgh45" -ForegroundColor White
Write-Host "  • المستخدم الافتراضي: root" -ForegroundColor White
Write-Host "  • كلمة المرور: (فارغة عادة في Laragon)" -ForegroundColor White
Write-Host "  • المضيف: 127.0.0.1 أو localhost" -ForegroundColor White
Write-Host "  • البورت: 3306" -ForegroundColor White

Write-Host "`n🚨 ملاحظات مهمة:" -ForegroundColor Yellow
Write-Host "  • تأكد من تشغيل MySQL في Laragon/XAMPP" -ForegroundColor White
Write-Host "  • تحقق من إعدادات .env في Laravel" -ForegroundColor White
Write-Host "  • استخدم utf8mb4 للدعم الكامل للعربية" -ForegroundColor White
