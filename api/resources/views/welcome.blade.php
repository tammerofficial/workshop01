<!DOCTYPE html>
<html lang="ar" dir="rtl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ورشة التفصيل - API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Tajawal', 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            text-align: center;
            color: white;
            padding: 2rem;
        }
        
        .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: bold;
        }
        
        .subtitle {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        
        .buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 0.8rem 1.5rem;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            color: white;
            text-decoration: none;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        
        .btn-primary {
            background: rgba(59, 130, 246, 0.3);
            border-color: rgba(59, 130, 246, 0.5);
        }
        
        .status {
            margin-top: 2rem;
            font-size: 0.9rem;
            opacity: 0.8;
        }
            </style>
    </head>
<body>
    <div class="container">
        <div class="logo">🔧 ورشة التفصيل</div>
        <div class="subtitle">نظام إدارة الورشة - API Dashboard</div>
        
        <div class="buttons">
            <a href="/dashboard" class="btn btn-primary">📊 API Dashboard</a>
            <a href="/api/dashboard/status" class="btn">📈 إحصائيات النظام</a>
            <a href="/api/dashboard/health" class="btn">🔍 فحص صحة النظام</a>
            <a href="http://localhost:5173" class="btn">🖥️ واجهة المستخدم</a>
                </div>
        
        <div class="status">
            <p>✅ Laravel API is running</p>
            <p>Port: {{ request()->getPort() }}</p>
            <p>Environment: {{ app()->environment() }}</p>
        </div>
        </div>

    <script>
        // Auto redirect to dashboard after 3 seconds
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 3000);
    </script>
    </body>
</html>