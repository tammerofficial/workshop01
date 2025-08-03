#!/bin/bash

echo "🔑 إعداد SSH للخادم الجديد..."

# معلومات الخادم الصحيحة
SERVER_HOST="95.179.244.27"
SERVER_USER="workshophudaalja"  # اسم المستخدم الصحيح
SERVER_PASS="Ali@kuwait@90"
REMOTE_PATH="/www/wwwroot/test"
SSH_KEY_PATH="$HOME/.ssh/id_rsa"

echo "📋 معلومات الاتصال:"
echo "   🌐 الخادم: $SERVER_HOST"
echo "   👤 المستخدم: $SERVER_USER"
echo "   📁 المسار: $REMOTE_PATH"
echo "   🔑 SSH Key: $SSH_KEY_PATH"

# التحقق من وجود SSH key
if [ -f "$SSH_KEY_PATH" ]; then
    echo "✅ تم العثور على SSH key"
    echo "🔑 SSH Key Fingerprint:"
    ssh-keygen -lf "$SSH_KEY_PATH.pub" 2>/dev/null || echo "   لا يمكن قراءة الـ fingerprint"
else
    echo "❌ SSH key غير موجود في: $SSH_KEY_PATH"
    echo "💡 قم بإنشاء SSH key جديد:"
    echo "   ssh-keygen -t rsa -b 2048 -f $SSH_KEY_PATH"
fi

echo ""
echo "🧪 اختبار الاتصال بالخادم..."

# اختبار الاتصال الأساسي
echo "1️⃣ اختبار ping للخادم:"
ping -c 3 $SERVER_HOST 2>/dev/null && echo "   ✅ الخادم متاح" || echo "   ❌ الخادم غير متاح"

echo ""
echo "2️⃣ اختبار SSH connection:"

# محاولة اتصال SSH مع key
if [ -f "$SSH_KEY_PATH" ]; then
    echo "   🔐 محاولة الاتصال بـ SSH key..."
    timeout 10 ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i "$SSH_KEY_PATH" "$SERVER_USER@$SERVER_HOST" "echo 'SSH Key connection successful'" 2>/dev/null
    SSH_KEY_RESULT=$?
    
    if [ $SSH_KEY_RESULT -eq 0 ]; then
        echo "   ✅ SSH key authentication نجح"
        CONNECTION_METHOD="ssh_key"
    else
        echo "   ❌ SSH key authentication فشل"
        CONNECTION_METHOD="password"
    fi
else
    CONNECTION_METHOD="password"
fi

# محاولة اتصال SSH بكلمة مرور
if [ "$CONNECTION_METHOD" = "password" ]; then
    echo "   🔑 محاولة الاتصال بكلمة المرور..."
    
    # التحقق من وجود sshpass
    if command -v sshpass >/dev/null 2>&1; then
        timeout 10 sshpass -p "$SERVER_PASS" ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "echo 'Password connection successful'" 2>/dev/null
        PASSWORD_RESULT=$?
        
        if [ $PASSWORD_RESULT -eq 0 ]; then
            echo "   ✅ Password authentication نجح"
        else
            echo "   ❌ Password authentication فشل"
        fi
    else
        echo "   ⚠️  sshpass غير مثبت - يجب تثبيته لاستخدام كلمة المرور"
        echo "   💡 قم بتثبيته: brew install sshpass"
    fi
fi

echo ""
echo "📁 اختبار المسار على الخادم:"

# اختبار المسار
if [ "$CONNECTION_METHOD" = "ssh_key" ] && [ $SSH_KEY_RESULT -eq 0 ]; then
    echo "   🔍 فحص المسار باستخدام SSH key..."
    timeout 10 ssh -o ConnectTimeout=5 -i "$SSH_KEY_PATH" "$SERVER_USER@$SERVER_HOST" "ls -la $REMOTE_PATH" 2>/dev/null
elif command -v sshpass >/dev/null 2>&1; then
    echo "   🔍 فحص المسار باستخدام كلمة المرور..."
    timeout 10 sshpass -p "$SERVER_PASS" ssh -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "ls -la $REMOTE_PATH" 2>/dev/null
else
    echo "   ⚠️  لا يمكن فحص المسار - مطلوب SSH key أو sshpass"
fi

echo ""
echo "📝 إنشاء ملف sync_config.jsonc محدث..."

# إنشاء ملف التكوين المحدث
cat > sync_config_fixed.jsonc << EOF
{
    "cpanel_workshop": {
        "type": "ssh",
        "host": "$SERVER_HOST",
        "port": 22,
        "username": "$SERVER_USER",
        "password": "$SERVER_PASS",
        "proxy": false,
        "upload_on_save": true,
        "watch": false,
        "submit_git_before_upload": false,
        "submit_git_msg": "",
        "build": "",
        "compress": true,
        "remote_unpacked": true,
        "delete_remote_compress": true,
        "delete_local_compress": true,
        "deleteRemote": false,
        "upload_to_root": false,
        "distPath": [],
        "remotePath": "$REMOTE_PATH",
        "excludePath": [
            ".git",
            "node_modules",
            ".DS_Store",
            "*.log",
            ".env"
        ],
        "downloadPath": "",
        "downloadExcludePath": [],
        "default": true,
        "secretKeyPath": "$SSH_KEY_PATH"
    }
}
EOF

echo "✅ تم إنشاء ملف sync_config_fixed.jsonc"

echo ""
echo "🚀 أوامر التحديث اليدوي:"
echo ""

if [ "$CONNECTION_METHOD" = "ssh_key" ] && [ $SSH_KEY_RESULT -eq 0 ]; then
    echo "📤 رفع الملفات باستخدام SSH key:"
    echo "scp -r -i $SSH_KEY_PATH ./* $SERVER_USER@$SERVER_HOST:$REMOTE_PATH/"
    echo ""
    echo "🖥️  تشغيل أوامر على الخادم:"
    echo "ssh -i $SSH_KEY_PATH $SERVER_USER@$SERVER_HOST 'cd $REMOTE_PATH && php -v'"
elif command -v sshpass >/dev/null 2>&1; then
    echo "📤 رفع الملفات باستخدام كلمة المرور:"
    echo "sshpass -p '$SERVER_PASS' scp -r ./* $SERVER_USER@$SERVER_HOST:$REMOTE_PATH/"
    echo ""
    echo "🖥️  تشغيل أوامر على الخادم:"
    echo "sshpass -p '$SERVER_PASS' ssh $SERVER_USER@$SERVER_HOST 'cd $REMOTE_PATH && php -v'"
else
    echo "⚠️  مطلوب تثبيت sshpass أو إعداد SSH key"
    echo "💡 تثبيت sshpass: brew install sshpass"
fi

echo ""
echo "🌐 الروابط المتوقعة بعد الرفع:"
echo "   - http://$SERVER_HOST/"
echo "   - http://$SERVER_HOST/api/test.php"
echo "   - http://$SERVER_HOST/api/health.php"

echo ""
echo "✨ انتهى إعداد SSH!"