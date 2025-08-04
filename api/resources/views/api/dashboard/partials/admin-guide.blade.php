<div class="doc-card">
    <h2 class="text-3xl font-bold text-gray-900 mb-6">👑 دليل المديرين الشامل</h2>
    
    <div class="success-box mb-6">
        <h4 class="font-semibold text-green-800 mb-2">مرحباً بك كمدير نظام!</h4>
        <p class="text-green-700">كمدير، لديك صلاحيات كاملة في النظام. هذا الدليل سيساعدك في إدارة النظام بكفاءة.</p>
    </div>

    <!-- إدارة المستخدمين -->
    <div class="mb-8">
        <h3 class="text-2xl font-semibold text-gray-800 mb-4">👥 إدارة المستخدمين</h3>
        
        <div class="space-y-6">
            <div class="flex items-start">
                <span class="step-number">1</span>
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-2">إضافة مستخدم جديد</h4>
                    <p class="text-gray-600 mb-3">لإضافة مستخدم جديد للنظام:</p>
                    <ol class="list-decimal list-inside text-gray-600 space-y-1 mr-4">
                        <li>اذهب إلى <strong>إدارة المستخدمين</strong> من القائمة الجانبية</li>
                        <li>انقر على زر <strong>"إضافة مستخدم جديد"</strong></li>
                        <li>أدخل البيانات المطلوبة (الاسم، البريد الإلكتروني، كلمة المرور)</li>
                        <li>حدد الدور المناسب للمستخدم</li>
                        <li>اختر القسم التابع له</li>
                        <li>انقر على <strong>"حفظ"</strong></li>
                    </ol>
                    
                    <div class="code-block mt-3">
                        <code>
API Endpoint: POST /api/users<br>
Required Fields: name, email, password, role_id, department
                        </code>
                    </div>
                </div>
            </div>

            <div class="flex items-start">
                <span class="step-number">2</span>
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-2">تعديل صلاحيات المستخدم</h4>
                    <p class="text-gray-600 mb-3">لتعديل صلاحيات مستخدم موجود:</p>
                    <ol class="list-decimal list-inside text-gray-600 space-y-1 mr-4">
                        <li>ابحث عن المستخدم في قائمة المستخدمين</li>
                        <li>انقر على زر <strong>"تعديل"</strong> بجانب اسم المستخدم</li>
                        <li>قم بتغيير الدور أو الصلاحيات حسب الحاجة</li>
                        <li>احفظ التغييرات</li>
                    </ol>
                </div>
            </div>

            <div class="flex items-start">
                <span class="step-number">3</span>
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-2">إلغاء تفعيل المستخدم</h4>
                    <p class="text-gray-600 mb-3">لإلغاء تفعيل مستخدم مؤقتاً:</p>
                    <ol class="list-decimal list-inside text-gray-600 space-y-1 mr-4">
                        <li>اذهب إلى صفحة تفاصيل المستخدم</li>
                        <li>انقر على زر <strong>"إلغاء التفعيل"</strong></li>
                        <li>أكد العملية</li>
                    </ol>
                    
                    <div class="warning-box mt-3">
                        <p class="text-yellow-700"><strong>تحذير:</strong> المستخدم المُلغى تفعيله لن يتمكن من تسجيل الدخول للنظام.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- إدارة الأدوار والصلاحيات -->
    <div class="mb-8">
        <h3 class="text-2xl font-semibold text-gray-800 mb-4">🔑 إدارة الأدوار والصلاحيات</h3>
        
        <div class="space-y-6">
            <div class="flex items-start">
                <span class="step-number">1</span>
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-2">إنشاء دور جديد</h4>
                    <p class="text-gray-600 mb-3">لإنشاء دور جديد بصلاحيات مخصصة:</p>
                    <ol class="list-decimal list-inside text-gray-600 space-y-1 mr-4">
                        <li>اذهب إلى <strong>الأدوار والصلاحيات</strong></li>
                        <li>انقر على <strong>"إضافة دور جديد"</strong></li>
                        <li>أدخل اسم الدور ووصفه</li>
                        <li>اختر الصلاحيات المناسبة من القائمة</li>
                        <li>احفظ الدور الجديد</li>
                    </ol>
                </div>
            </div>

            <div class="flex items-start">
                <span class="step-number">2</span>
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-2">تعديل صلاحيات الدور</h4>
                    <p class="text-gray-600 mb-3">لتعديل صلاحيات دور موجود:</p>
                    <ol class="list-decimal list-inside text-gray-600 space-y-1 mr-4">
                        <li>ابحث عن الدور في قائمة الأدوار</li>
                        <li>انقر على زر <strong>"تعديل"</strong></li>
                        <li>أضف أو احذف الصلاحيات حسب الحاجة</li>
                        <li>احفظ التغييرات</li>
                    </ol>
                    
                    <div class="info-box mt-3">
                        <p class="text-blue-700"><strong>نصيحة:</strong> تأكد من مراجعة تأثير التغييرات على جميع المستخدمين الذين يحملون هذا الدور.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- إدارة النظام -->
    <div class="mb-8">
        <h3 class="text-2xl font-semibold text-gray-800 mb-4">⚙️ إدارة النظام</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="border border-gray-200 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">🎨 إعدادات المظهر</h4>
                <p class="text-gray-600 mb-3">يمكنك تخصيص مظهر النظام للجميع:</p>
                <ul class="list-disc list-inside text-gray-600 space-y-1">
                    <li>تغيير الألوان الأساسية</li>
                    <li>اختيار الخط المناسب</li>
                    <li>تحديد الوضع الافتراضي (فاتح/داكن)</li>
                </ul>
                <div class="code-block mt-3">
                    <code>المسار: الإعدادات > المظهر</code>
                </div>
            </div>

            <div class="border border-gray-200 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">🔒 أمان النظام</h4>
                <p class="text-gray-600 mb-3">مراقبة أمان النظام:</p>
                <ul class="list-disc list-inside text-gray-600 space-y-1">
                    <li>مراجعة سجلات الأمان</li>
                    <li>مراقبة محاولات تسجيل الدخول</li>
                    <li>إدارة جلسات المستخدمين النشطة</li>
                </ul>
                <div class="code-block mt-3">
                    <code>المسار: الأمان > سجلات النشاط</code>
                </div>
            </div>

            <div class="border border-gray-200 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">💾 النسخ الاحتياطي</h4>
                <p class="text-gray-600 mb-3">إدارة النسخ الاحتياطية:</p>
                <ul class="list-disc list-inside text-gray-600 space-y-1">
                    <li>إنشاء نسخة احتياطية يدوياً</li>
                    <li>جدولة النسخ التلقائية</li>
                    <li>استعادة البيانات عند الحاجة</li>
                </ul>
                <div class="code-block mt-3">
                    <code>المسار: النظام > النسخ الاحتياطي</code>
                </div>
            </div>

            <div class="border border-gray-200 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">📊 مراقبة الأداء</h4>
                <p class="text-gray-600 mb-3">متابعة أداء النظام:</p>
                <ul class="list-disc list-inside text-gray-600 space-y-1">
                    <li>استخدام الذاكرة والمعالج</li>
                    <li>سرعة الاستجابة</li>
                    <li>حالة قاعدة البيانات</li>
                </ul>
                <div class="code-block mt-3">
                    <code>المسار: /dashboard/health</code>
                </div>
            </div>
        </div>
    </div>

    <!-- أفضل الممارسات -->
    <div class="mb-8">
        <h3 class="text-2xl font-semibold text-gray-800 mb-4">✨ أفضل الممارسات</h3>
        
        <div class="space-y-4">
            <div class="success-box">
                <h4 class="font-semibold text-green-800 mb-2">👍 افعل</h4>
                <ul class="list-disc list-inside text-green-700 space-y-1">
                    <li>راجع سجلات النشاط بانتظام</li>
                    <li>أنشئ نسخاً احتياطية دورية</li>
                    <li>احرص على تحديث كلمات المرور</li>
                    <li>راقب أداء النظام باستمرار</li>
                    <li>وثق جميع التغييرات المهمة</li>
                </ul>
            </div>

            <div class="warning-box">
                <h4 class="font-semibold text-yellow-800 mb-2">⚠️ احذر من</h4>
                <ul class="list-disc list-inside text-yellow-700 space-y-1">
                    <li>منح صلاحيات مدير لمستخدمين غير موثوقين</li>
                    <li>حذف البيانات بدون نسخة احتياطية</li>
                    <li>تجاهل تحذيرات الأمان</li>
                    <li>تعديل إعدادات النظام بدون فهم تأثيرها</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- اتصل بالدعم -->
    <div class="info-box">
        <h4 class="font-semibold text-blue-800 mb-2">📞 هل تحتاج مساعدة؟</h4>
        <p class="text-blue-700 mb-2">إذا واجهت أي مشكلة أو كنت بحاجة لمساعدة إضافية:</p>
        <ul class="list-disc list-inside text-blue-700 space-y-1">
            <li>راجع قسم <strong>الأسئلة الشائعة</strong></li>
            <li>اطلع على <strong>دليل استكشاف الأخطاء</strong></li>
            <li>تواصل مع فريق الدعم التقني</li>
        </ul>
    </div>
</div>