# إصلاح إعدادات قاعدة البيانات في ملف .env
Write-Host "🔧 إصلاح إعدادات قاعدة البيانات..." -ForegroundColor Green

$envPath = "api\.env"

if (Test-Path $envPath) {
    # قراءة محتوى الملف
    $content = Get-Content $envPath -Raw
    
    # استبدال إعدادات SQLite بـ MySQL
    $content = $content -replace "DB_CONNECTION=sqlite", "DB_CONNECTION=mysql"
    $content = $content -replace "# DB_HOST=127.0.0.1", "DB_HOST=127.0.0.1"
    $content = $content -replace "# DB_PORT=3306", "DB_PORT=3306"
    $content = $content -replace "# DB_DATABASE=laravel", "DB_DATABASE=workshop01"
    $content = $content -replace "# DB_USERNAME=root", "DB_USERNAME=root"
    $content = $content -replace "# DB_PASSWORD=", "DB_PASSWORD="
    
    # إضافة إعدادات قاعدة البيانات إذا لم تكن موجودة
    if ($content -notmatch "DB_HOST=") {
        $content = $content -replace "DB_CONNECTION=mysql", @"
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=workshop01
DB_USERNAME=root
DB_PASSWORD=
"@
    }
    
    # كتابة المحتوى الجديد
    $content | Set-Content $envPath -NoNewline
    
    Write-Host "✅ تم تحديث إعدادات قاعدة البيانات بنجاح" -ForegroundColor Green
    Write-Host "🗄️ النوع: MySQL" -ForegroundColor Yellow
    Write-Host "🏠 الخادم: 127.0.0.1" -ForegroundColor Yellow
    Write-Host "📊 قاعدة البيانات: workshop01" -ForegroundColor Yellow
} else {
    Write-Host "❌ ملف .env غير موجود!" -ForegroundColor Red
    Write-Host "🔧 إنشاء ملف .env جديد..." -ForegroundColor Yellow
    
    $envContent = @"
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:pvRxISu+LsDIVgA4OTsaXX+fD+J1c1Y94Rg4QTEeWiI=
APP_DEBUG=true
APP_URL=http://localhost

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=workshop01
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_APP_NAME="${APP_NAME}"
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
"@
    
    $envContent | Set-Content $envPath
    Write-Host "✅ تم إنشاء ملف .env جديد مع إعدادات MySQL" -ForegroundColor Green
}

Write-Host "`n📝 تأكد من:" -ForegroundColor Cyan
Write-Host "  • تشغيل Laragon مع MySQL" -ForegroundColor White
Write-Host "  • إنشاء قاعدة بيانات workshop01" -ForegroundColor White
Write-Host "  • صحة إعدادات الاتصال" -ForegroundColor White
