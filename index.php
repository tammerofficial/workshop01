<?php
// Root index file for Cloudways
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ورشة التفصيل - نظام إدارة متكامل</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
            max-width: 600px;
            width: 90%;
        }
        
        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .subtitle {
            font-size: 1.2em;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        
        .api-links {
            display: grid;
            gap: 15px;
            margin-top: 30px;
        }
        
        .api-link {
            background: rgba(255, 255, 255, 0.2);
            padding: 15px 20px;
            border-radius: 10px;
            text-decoration: none;
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .api-link:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .status {
            padding: 20px;
            margin: 20px 0;
            border-radius: 10px;
            background: rgba(0, 255, 0, 0.2);
            border: 1px solid rgba(0, 255, 0, 0.3);
        }
        
        .emoji {
            font-size: 1.5em;
            margin-left: 10px;
        }
        
        @media (max-width: 768px) {
            h1 { font-size: 2em; }
            .container { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏭 ورشة التفصيل</h1>
        <p class="subtitle">نظام إدارة شامل للورش والإنتاج</p>
        
        <div class="status">
            <h3>✅ الخادم يعمل بنجاح!</h3>
            <p>جميع الخدمات متاحة وجاهزة للاستخدام</p>
        </div>
        
        <div class="api-links">
            <a href="/api/test.php" class="api-link">
                <span>🔧 اختبار الخادم</span>
                <span class="emoji">→</span>
            </a>
            
            <a href="/api/health.php" class="api-link">
                <span>💚 فحص صحة النظام</span>
                <span class="emoji">→</span>
            </a>
            
            <a href="/api/simple-api.php/roles" class="api-link">
                <span>👥 إدارة الأدوار</span>
                <span class="emoji">→</span>
            </a>
            
            <a href="/api/simple-api.php/users" class="api-link">
                <span>🧑‍💼 إدارة المستخدمين</span>
                <span class="emoji">→</span>
            </a>
            
            <a href="/api/simple-api.php/dashboard" class="api-link">
                <span>📊 لوحة التحكم</span>
                <span class="emoji">→</span>
            </a>
            
            <a href="/api" class="api-link">
                <span>🔌 API الرئيسي</span>
                <span class="emoji">→</span>
            </a>
        </div>
        
        <div style="margin-top: 30px; font-size: 0.9em; opacity: 0.8;">
            <p>📅 تم التحديث: <?php echo date('Y-m-d H:i:s'); ?></p>
            <p>🌐 الخادم: <?php echo $_SERVER['SERVER_NAME'] ?? 'Cloudways'; ?></p>
        </div>
    </div>
</body>
</html>