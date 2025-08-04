<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مركز الوثائق - نظام الورشة</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css" rel="stylesheet">
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <style>
        body { font-family: 'Tajawal', sans-serif; }
        .rtl { direction: rtl; }
        .doc-card { @apply bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow; }
        .doc-section { @apply mb-8; }
        .code-block { @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto; }
        .badge { @apply px-3 py-1 text-xs font-medium rounded-full; }
        .badge-admin { @apply bg-red-100 text-red-800; }
        .badge-manager { @apply bg-blue-100 text-blue-800; }
        .badge-worker { @apply bg-green-100 text-green-800; }
        .badge-user { @apply bg-purple-100 text-purple-800; }
        .sidebar-doc { 
            position: sticky;
            top: 2rem;
            height: calc(100vh - 4rem);
            overflow-y: auto;
        }
        .content-doc {
            max-height: calc(100vh - 2rem);
            overflow-y: auto;
        }
        .nav-link {
            @apply block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors;
        }
        .nav-link.active {
            @apply bg-blue-100 text-blue-700 font-medium;
        }
        .step-number {
            @apply inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mr-3;
        }
        .warning-box {
            @apply bg-yellow-50 border-r-4 border-yellow-400 p-4 rounded;
        }
        .success-box {
            @apply bg-green-50 border-r-4 border-green-400 p-4 rounded;
        }
        .info-box {
            @apply bg-blue-50 border-r-4 border-blue-400 p-4 rounded;
        }
    </style>
</head>
<body class="bg-gray-50 rtl" x-data="documentationApp()">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center">
                    <a href="/dashboard" class="text-blue-600 hover:text-blue-800 ml-4">
                        ← العودة للداشبورد
                    </a>
                    <h1 class="text-2xl font-bold text-gray-900">📖 مركز الوثائق</h1>
                </div>
                <div class="flex items-center space-x-4 space-x-reverse">
                    <input type="text" 
                           x-model="searchTerm"
                           placeholder="ابحث في الوثائق..."
                           class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <button @click="toggleSidebar()" class="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- Sidebar Navigation -->
            <div class="lg:col-span-1" :class="{'hidden lg:block': !sidebarOpen, 'block': sidebarOpen}">
                <div class="sidebar-doc">
                    <nav class="space-y-2">
                        <!-- Quick Start -->
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-3">🚀 البداية السريعة</h3>
                            <a href="#overview" @click="setActiveSection('overview')" 
                               class="nav-link" :class="{'active': activeSection === 'overview'}">
                                نظرة عامة على النظام
                            </a>
                            <a href="#getting-started" @click="setActiveSection('getting-started')" 
                               class="nav-link" :class="{'active': activeSection === 'getting-started'}">
                                البدء مع النظام
                            </a>
                            <a href="#user-roles" @click="setActiveSection('user-roles')" 
                               class="nav-link" :class="{'active': activeSection === 'user-roles'}">
                                الأدوار والصلاحيات
                            </a>
                        </div>

                        <!-- User Guides -->
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-3">👥 دليل المستخدمين</h3>
                            <a href="#admin-guide" @click="setActiveSection('admin-guide')" 
                               class="nav-link" :class="{'active': activeSection === 'admin-guide'}">
                                <span class="badge badge-admin ml-2">مدير</span>
                                دليل المديرين
                            </a>
                            <a href="#manager-guide" @click="setActiveSection('manager-guide')" 
                               class="nav-link" :class="{'active': activeSection === 'manager-guide'}">
                                <span class="badge badge-manager ml-2">مشرف</span>
                                دليل المشرفين
                            </a>
                            <a href="#worker-guide" @click="setActiveSection('worker-guide')" 
                               class="nav-link" :class="{'active': activeSection === 'worker-guide'}">
                                <span class="badge badge-worker ml-2">عامل</span>
                                دليل العمال
                            </a>
                            <a href="#user-guide" @click="setActiveSection('user-guide')" 
                               class="nav-link" :class="{'active': activeSection === 'user-guide'}">
                                <span class="badge badge-user ml-2">مستخدم</span>
                                دليل المستخدم العادي
                            </a>
                        </div>

                        <!-- Features -->
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-3">⚙️ الميزات</h3>
                            <a href="#orders-management" @click="setActiveSection('orders-management')" 
                               class="nav-link" :class="{'active': activeSection === 'orders-management'}">
                                إدارة الطلبات
                            </a>
                            <a href="#production-tracking" @click="setActiveSection('production-tracking')" 
                               class="nav-link" :class="{'active': activeSection === 'production-tracking'}">
                                تتبع الإنتاج
                            </a>
                            <a href="#user-management" @click="setActiveSection('user-management')" 
                               class="nav-link" :class="{'active': activeSection === 'user-management'}">
                                إدارة المستخدمين
                            </a>
                            <a href="#reports-analytics" @click="setActiveSection('reports-analytics')" 
                               class="nav-link" :class="{'active': activeSection === 'reports-analytics'}">
                                التقارير والتحليلات
                            </a>
                        </div>

                        <!-- API Documentation -->
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-3">🔗 API</h3>
                            <a href="#api-overview" @click="setActiveSection('api-overview')" 
                               class="nav-link" :class="{'active': activeSection === 'api-overview'}">
                                نظرة عامة على API
                            </a>
                            <a href="#authentication-api" @click="setActiveSection('authentication-api')" 
                               class="nav-link" :class="{'active': activeSection === 'authentication-api'}">
                                المصادقة والتفويض
                            </a>
                            <a href="#endpoints-reference" @click="setActiveSection('endpoints-reference')" 
                               class="nav-link" :class="{'active': activeSection === 'endpoints-reference'}">
                                مرجع Endpoints
                            </a>
                        </div>

                        <!-- Troubleshooting -->
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-3">🔧 استكشاف الأخطاء</h3>
                            <a href="#common-issues" @click="setActiveSection('common-issues')" 
                               class="nav-link" :class="{'active': activeSection === 'common-issues'}">
                                المشاكل الشائعة
                            </a>
                            <a href="#troubleshooting" @click="setActiveSection('troubleshooting')" 
                               class="nav-link" :class="{'active': activeSection === 'troubleshooting'}">
                                دليل استكشاف الأخطاء
                            </a>
                            <a href="#faq" @click="setActiveSection('faq')" 
                               class="nav-link" :class="{'active': activeSection === 'faq'}">
                                الأسئلة الشائعة
                            </a>
                        </div>
                    </nav>
                </div>
            </div>

            <!-- Main Content -->
            <div class="lg:col-span-3">
                <div class="content-doc">
                    <!-- Overview Section -->
                    <div x-show="activeSection === 'overview'" class="doc-section">
                        <div class="doc-card">
                            <h2 class="text-3xl font-bold text-gray-900 mb-6">🏭 نظرة عامة على نظام الورشة</h2>
                            
                            <div class="mb-8">
                                <h3 class="text-xl font-semibold text-gray-800 mb-4">ما هو نظام الورشة؟</h3>
                                <p class="text-gray-600 mb-4">
                                    نظام إدارة الورشة هو منصة شاملة لإدارة جميع عمليات الورشة من طلبات العملاء وتتبع الإنتاج إلى إدارة المستخدمين والتقارير التفصيلية.
                                </p>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div class="info-box">
                                    <h4 class="font-semibold text-blue-800 mb-2">📋 إدارة الطلبات</h4>
                                    <p class="text-sm text-blue-700">تتبع طلبات العملاء من البداية حتى التسليم</p>
                                </div>
                                <div class="info-box">
                                    <h4 class="font-semibold text-blue-800 mb-2">🏭 تتبع الإنتاج</h4>
                                    <p class="text-sm text-blue-700">مراقبة مراحل الإنتاج والجودة</p>
                                </div>
                                <div class="info-box">
                                    <h4 class="font-semibold text-blue-800 mb-2">👥 إدارة المستخدمين</h4>
                                    <p class="text-sm text-blue-700">نظام أدوار وصلاحيات متقدم</p>
                                </div>
                                <div class="info-box">
                                    <h4 class="font-semibold text-blue-800 mb-2">📊 التقارير والتحليلات</h4>
                                    <p class="text-sm text-blue-700">تقارير شاملة ورؤى تحليلية</p>
                                </div>
                            </div>

                            <div class="warning-box">
                                <h4 class="font-semibold text-yellow-800 mb-2">⚠️ ملاحظة مهمة</h4>
                                <p class="text-sm text-yellow-700">
                                    يرجى قراءة دليل الأدوار والصلاحيات قبل البدء لفهم مستوى الوصول المتاح لك في النظام.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Getting Started Section -->
                    <div x-show="activeSection === 'getting-started'" class="doc-section">
                        <div class="doc-card">
                            <h2 class="text-3xl font-bold text-gray-900 mb-6">🚀 البدء مع النظام</h2>
                            
                            <div class="space-y-6">
                                <div class="flex items-start">
                                    <span class="step-number">1</span>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-800 mb-2">تسجيل الدخول</h3>
                                        <p class="text-gray-600 mb-3">ادخل إلى النظام باستخدام البيانات المخصصة لك:</p>
                                        <div class="code-block">
                                            <code>
                                                رابط تسجيل الدخول: http://localhost:5173/login<br>
                                                أدخل البريد الإلكتروني وكلمة المرور
                                            </code>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex items-start">
                                    <span class="step-number">2</span>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-800 mb-2">استكشاف الواجهة</h3>
                                        <p class="text-gray-600 mb-3">تعرف على العناصر الأساسية في الواجهة:</p>
                                        <ul class="list-disc list-inside text-gray-600 space-y-1 mr-4">
                                            <li>القائمة الجانبية: للوصول السريع للميزات</li>
                                            <li>الشريط العلوي: معلومات المستخدم والإشعارات</li>
                                            <li>المحتوى الرئيسي: منطقة العمل</li>
                                            <li>أزرار العمليات: لتنفيذ المهام</li>
                                        </ul>
                                    </div>
                                </div>

                                <div class="flex items-start">
                                    <span class="step-number">3</span>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-800 mb-2">تحديد صلاحياتك</h3>
                                        <p class="text-gray-600 mb-3">تحقق من الصلاحيات المتاحة لك:</p>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div class="border border-gray-200 rounded p-3">
                                                <h4 class="font-medium text-gray-800">✅ متاح</h4>
                                                <p class="text-sm text-gray-600">الميزات التي يمكنك الوصول إليها</p>
                                            </div>
                                            <div class="border border-gray-200 rounded p-3">
                                                <h4 class="font-medium text-gray-800">❌ غير متاح</h4>
                                                <p class="text-sm text-gray-600">الميزات المحجوبة عنك</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- User Roles Section -->
                    <div x-show="activeSection === 'user-roles'" class="doc-section">
                        <div class="doc-card">
                            <h2 class="text-3xl font-bold text-gray-900 mb-6">👑 الأدوار والصلاحيات</h2>
                            
                            <div class="space-y-6">
                                <!-- Super Admin -->
                                <div class="border border-red-200 rounded-lg p-6">
                                    <div class="flex items-center mb-4">
                                        <span class="badge badge-admin ml-3">مدير عام</span>
                                        <h3 class="text-xl font-semibold text-red-800">Super Admin</h3>
                                    </div>
                                    <p class="text-gray-600 mb-4">الصلاحيات الكاملة في النظام</p>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 class="font-medium text-gray-800 mb-2">الصلاحيات:</h4>
                                            <ul class="text-sm text-gray-600 space-y-1">
                                                <li>✅ إدارة جميع المستخدمين</li>
                                                <li>✅ إدارة الأدوار والصلاحيات</li>
                                                <li>✅ الوصول لجميع التقارير</li>
                                                <li>✅ إعدادات النظام</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 class="font-medium text-gray-800 mb-2">المسؤوليات:</h4>
                                            <ul class="text-sm text-gray-600 space-y-1">
                                                <li>📋 إدارة النظام بالكامل</li>
                                                <li>🔒 أمان النظام</li>
                                                <li>👥 إدارة فريق العمل</li>
                                                <li>📊 مراقبة الأداء</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <!-- Manager -->
                                <div class="border border-blue-200 rounded-lg p-6">
                                    <div class="flex items-center mb-4">
                                        <span class="badge badge-manager ml-3">مشرف</span>
                                        <h3 class="text-xl font-semibold text-blue-800">Manager</h3>
                                    </div>
                                    <p class="text-gray-600 mb-4">إدارة العمليات اليومية والطلبات</p>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 class="font-medium text-gray-800 mb-2">الصلاحيات:</h4>
                                            <ul class="text-sm text-gray-600 space-y-1">
                                                <li>✅ إدارة الطلبات</li>
                                                <li>✅ تتبع الإنتاج</li>
                                                <li>✅ إدارة العمال</li>
                                                <li>✅ التقارير التشغيلية</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 class="font-medium text-gray-800 mb-2">المسؤوليات:</h4>
                                            <ul class="text-sm text-gray-600 space-y-1">
                                                <li>📋 متابعة الطلبات</li>
                                                <li>👷 توزيع المهام</li>
                                                <li>⚡ ضمان الجودة</li>
                                                <li>📞 التواصل مع العملاء</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <!-- Worker -->
                                <div class="border border-green-200 rounded-lg p-6">
                                    <div class="flex items-center mb-4">
                                        <span class="badge badge-worker ml-3">عامل</span>
                                        <h3 class="text-xl font-semibold text-green-800">Worker</h3>
                                    </div>
                                    <p class="text-gray-600 mb-4">تنفيذ المهام وتحديث حالة العمل</p>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 class="font-medium text-gray-800 mb-2">الصلاحيات:</h4>
                                            <ul class="text-sm text-gray-600 space-y-1">
                                                <li>✅ عرض المهام المخصصة</li>
                                                <li>✅ تحديث حالة المهام</li>
                                                <li>✅ تسجيل الحضور</li>
                                                <li>✅ عرض التعليمات</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 class="font-medium text-gray-800 mb-2">المسؤوليات:</h4>
                                            <ul class="text-sm text-gray-600 space-y-1">
                                                <li>🔧 تنفيذ المهام</li>
                                                <li>⏰ الالتزام بالمواعيد</li>
                                                <li>📝 تحديث التقدم</li>
                                                <li>✅ ضمان الجودة</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <!-- Regular User -->
                                <div class="border border-purple-200 rounded-lg p-6">
                                    <div class="flex items-center mb-4">
                                        <span class="badge badge-user ml-3">مستخدم</span>
                                        <h3 class="text-xl font-semibold text-purple-800">User</h3>
                                    </div>
                                    <p class="text-gray-600 mb-4">الوصول المحدود للعرض والاستعلام</p>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 class="font-medium text-gray-800 mb-2">الصلاحيات:</h4>
                                            <ul class="text-sm text-gray-600 space-y-1">
                                                <li>✅ عرض المعلومات الأساسية</li>
                                                <li>✅ البحث والاستعلام</li>
                                                <li>✅ طلب التقارير</li>
                                                <li>❌ التعديل أو الحذف</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 class="font-medium text-gray-800 mb-2">المسؤوليات:</h4>
                                            <ul class="text-sm text-gray-600 space-y-1">
                                                <li>👀 مراقبة البيانات</li>
                                                <li>📊 إعداد التقارير</li>
                                                <li>📞 التواصل للدعم</li>
                                                <li>🔒 حماية البيانات</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Admin Guide Section -->
                    <div x-show="activeSection === 'admin-guide'" class="doc-section">
                        @include('api.dashboard.partials.admin-guide')
                    </div>

                    <!-- API Overview Section -->
                    <div x-show="activeSection === 'api-overview'" class="doc-section">
                        <div class="doc-card">
                            <h2 class="text-3xl font-bold text-gray-900 mb-6">🔗 نظرة عامة على API</h2>
                            
                            <div class="info-box mb-6">
                                <p class="text-blue-700">API نظام الورشة يوفر واجهة برمجية شاملة للتفاعل مع جميع ميزات النظام.</p>
                            </div>

                            <div class="mb-8">
                                <h3 class="text-2xl font-semibold text-gray-800 mb-4">📍 Base URL</h3>
                                <div class="code-block">
                                    <code>http://localhost:8000/api</code>
                                </div>
                            </div>

                            <div class="mb-8">
                                <h3 class="text-2xl font-semibold text-gray-800 mb-4">🔑 المصادقة</h3>
                                <p class="text-gray-600 mb-4">يستخدم النظام Token-based Authentication:</p>
                                <div class="code-block">
                                    <code>
Authorization: Bearer YOUR_TOKEN_HERE<br>
Content-Type: application/json<br>
Accept: application/json
                                    </code>
                                </div>
                            </div>

                            <div class="mb-8">
                                <h3 class="text-2xl font-semibold text-gray-800 mb-4">📊 استجابة API</h3>
                                <p class="text-gray-600 mb-4">جميع الاستجابات تأتي بتنسيق JSON:</p>
                                <div class="code-block">
                                    <code>
{<br>
  "success": true,<br>
  "data": {...},<br>
  "message": "Operation completed successfully"<br>
}
                                    </code>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="border border-green-200 rounded-lg p-4">
                                    <h4 class="text-lg font-semibold text-green-800 mb-3">✅ نجح الطلب</h4>
                                    <p class="text-gray-600 mb-2">رموز الحالة للنجاح:</p>
                                    <ul class="text-sm text-gray-600 space-y-1">
                                        <li><code>200</code> - تم بنجاح</li>
                                        <li><code>201</code> - تم الإنشاء</li>
                                        <li><code>204</code> - تم الحذف</li>
                                    </ul>
                                </div>

                                <div class="border border-red-200 rounded-lg p-4">
                                    <h4 class="text-lg font-semibold text-red-800 mb-3">❌ فشل الطلب</h4>
                                    <p class="text-gray-600 mb-2">رموز الحالة للأخطاء:</p>
                                    <ul class="text-sm text-gray-600 space-y-1">
                                        <li><code>400</code> - خطأ في الطلب</li>
                                        <li><code>401</code> - غير مصرح</li>
                                        <li><code>404</code> - غير موجود</li>
                                        <li><code>500</code> - خطأ في الخادم</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- FAQ Section -->
                    <div x-show="activeSection === 'faq'" class="doc-section">
                        <div class="doc-card">
                            <h2 class="text-3xl font-bold text-gray-900 mb-6">❓ الأسئلة الشائعة</h2>
                            
                            <div class="space-y-6">
                                <!-- General Questions -->
                                <div class="border border-gray-200 rounded-lg p-6">
                                    <h3 class="text-xl font-semibold text-gray-800 mb-4">🔍 أسئلة عامة</h3>
                                    
                                    <div class="space-y-4">
                                        <div class="border-b border-gray-100 pb-4">
                                            <h4 class="font-semibold text-gray-700 mb-2">س: كيف يمكنني تغيير كلمة المرور؟</h4>
                                            <p class="text-gray-600">ج: اذهب إلى الملف الشخصي من القائمة العلوية، ثم انقر على "تغيير كلمة المرور".</p>
                                        </div>
                                        
                                        <div class="border-b border-gray-100 pb-4">
                                            <h4 class="font-semibold text-gray-700 mb-2">س: لماذا لا أستطيع رؤية بعض الصفحات؟</h4>
                                            <p class="text-gray-600">ج: قد تكون الصفحة تتطلب صلاحيات خاصة. تواصل مع المدير لمنحك الصلاحيات اللازمة.</p>
                                        </div>
                                        
                                        <div class="border-b border-gray-100 pb-4">
                                            <h4 class="font-semibold text-gray-700 mb-2">س: كيف يمكنني تصدير التقارير؟</h4>
                                            <p class="text-gray-600">ج: في معظم الصفحات، ستجد زر "تصدير" أو "Export" في أعلى الصفحة.</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Technical Questions -->
                                <div class="border border-gray-200 rounded-lg p-6">
                                    <h3 class="text-xl font-semibold text-gray-800 mb-4">🔧 أسئلة تقنية</h3>
                                    
                                    <div class="space-y-4">
                                        <div class="border-b border-gray-100 pb-4">
                                            <h4 class="font-semibold text-gray-700 mb-2">س: ما هي متطلبات النظام؟</h4>
                                            <p class="text-gray-600">ج: متصفح حديث (Chrome, Firefox, Safari) واتصال إنترنت مستقر.</p>
                                        </div>
                                        
                                        <div class="border-b border-gray-100 pb-4">
                                            <h4 class="font-semibold text-gray-700 mb-2">س: هل يمكن استخدام النظام على الهاتف؟</h4>
                                            <p class="text-gray-600">ج: نعم، النظام متوافق مع جميع الأجهزة والشاشات.</p>
                                        </div>
                                        
                                        <div class="border-b border-gray-100 pb-4">
                                            <h4 class="font-semibold text-gray-700 mb-2">س: كيف يمكنني الإبلاغ عن خطأ؟</h4>
                                            <p class="text-gray-600">ج: تواصل مع فريق الدعم التقني مع توضيح الخطأ والخطوات التي أدت إليه.</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Contact Support -->
                                <div class="success-box">
                                    <h4 class="font-semibold text-green-800 mb-2">📞 تحتاج مساعدة إضافية؟</h4>
                                    <p class="text-green-700">
                                        إذا لم تجد إجابة لسؤالك، لا تتردد في التواصل مع فريق الدعم التقني.
                                        سيكونون سعداء لمساعدتك في حل أي مشكلة تواجهها.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Placeholder for other sections -->
                    <div x-show="!['overview', 'getting-started', 'user-roles', 'admin-guide', 'api-overview', 'faq'].includes(activeSection)" class="doc-section">
                        <div class="doc-card">
                            <h2 class="text-2xl font-bold text-gray-900 mb-4">🚧 قيد التطوير</h2>
                            <p class="text-gray-600">هذا القسم قيد التطوير وسيتم إضافة المحتوى قريباً.</p>
                            <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                                <p class="text-blue-700">💡 <strong>اقتراح:</strong> يمكنك العودة للصفحة الرئيسية أو استكشاف الأقسام المتاحة.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
    
    <script>
        function documentationApp() {
            return {
                activeSection: 'overview',
                sidebarOpen: false,
                searchTerm: '',

                setActiveSection(section) {
                    this.activeSection = section;
                    this.sidebarOpen = false; // Close sidebar on mobile after selection
                    
                    // Scroll to top when changing sections
                    document.querySelector('.content-doc').scrollTop = 0;
                },

                toggleSidebar() {
                    this.sidebarOpen = !this.sidebarOpen;
                },

                init() {
                    // Set initial section from URL hash if present
                    const hash = window.location.hash.substring(1);
                    if (hash) {
                        this.activeSection = hash;
                    }

                    // Update URL hash when section changes
                    this.$watch('activeSection', (newSection) => {
                        window.location.hash = newSection;
                    });
                }
            }
        }
    </script>
</body>
</html>