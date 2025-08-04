const fs = require('fs');

// قراءة الملف الإنجليزي كمرجع للبنية
const enData = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));

// إنشاء ملف عربي نظيف بنفس البنية
const arData = {
  "common": {
    "loading": "جاري التحميل...",
    "error": "حدث خطأ",
    "success": "نجح",
    "save": "حفظ",
    "cancel": "إلغاء",
    "edit": "تعديل",
    "delete": "حذف",
    "view": "عرض",
    "add": "إضافة",
    "search": "بحث",
    "filter": "تصفية",
    "refresh": "تحديث",
    "export": "تصدير",
    "import": "استيراد",
    "confirm": "تأكيد",
    "yes": "نعم",
    "no": "لا",
    "ok": "موافق",
    "close": "إغلاق",
    "next": "التالي",
    "previous": "السابق",
    "finish": "إنهاء",
    "submit": "إرسال",
    "reset": "إعادة تعيين",
    "clear": "مسح",
    "select": "اختيار",
    "selectAll": "اختيار الكل",
    "deselectAll": "إلغاء اختيار الكل",
    "name": "الاسم",
    "description": "الوصف",
    "type": "النوع",
    "category": "الفئة",
    "price": "السعر",
    "quantity": "الكمية",
    "total": "الإجمالي",
    "available": "متاح",
    "notAvailable": "غير متاح",
    "active": "نشط",
    "inactive": "غير نشط",
    "pending": "قيد الانتظار",
    "approved": "مُوافق عليه",
    "rejected": "مرفوض",
    "completed": "مكتمل",
    "cancelled": "ملغي",
    "high": "عالي",
    "medium": "متوسط",
    "low": "منخفض",
    "actual": "فعلي",
    "syncFromWooCommerce": "مزامنة من ووكومرس",
    "addNew": "إضافة جديد",
    "newOrder": "طلب جديد",
    "load": "تحميل",
    "showMore": "عرض المزيد",
    "client": "العميل",
    "dueDate": "تاريخ الاستحقاق",
    "progress": "التقدم",
    "enabled": "مفعل",
    "disabled": "معطل",
    "new": "جديد",
    "hot": "ساخن",
    "secure": "آمن",
    "viewDetails": "عرض التفاصيل"
  },
  "sidebar": {
    "dashboard": "لوحة التحكم",
    "orders": "إدارة الطلبات",
    "ordersManagement": "إدارة الطلبات",
    "clients": "العملاء",
    "inventory": "المخزون",
    "workers": "العمال",
    "calendar": "التقويم",
    "productionFlow": "تدفق الإنتاج",
    "productionTracking": "تتبع الإنتاج",
    "stationDisplay": "عرض المحطة",
    "stations": "المحطات",
    "sales": "المبيعات",
    "invoices": "الفواتير",
    "analytics": "التحليلات",
    "attendance": "الحضور",
    "payroll": "الرواتب",
    "erpManagement": "إدارة تخطيط الموارد",
    "advancedFeatures": "المزايا المتقدمة",
    "pluginManagement": "إدارة الإضافات",
    "rbacSecurity": "أمان التحكم بالأدوار",
    "userSettings": "إعدادات المستخدم",
    "notifications": "الإشعارات",
    "settings": "الإعدادات",
    "barcodeQR": "الباركود و QR",
    "posSystem": "نظام نقاط البيع",
    "ecommerce": "التجارة الإلكترونية",
    "production": "عمليات الإنتاج",
    "workflow": "سير العمل",
    "workerIpad": "واجهة العامل",
    "pos": "نقاط البيع",
    "managerDashboard": "لوحة تحكم المدير",
    "workshop": "إدارة الورشة",
    "products": "المنتجات",
    "erpSystem": "نظام ERP",
    "systemManagement": "إدارة النظام"
  },
  "dashboard": {
    "title": "لوحة التحكم",
    "welcome": "مرحباً بك في نظام إدارة الورشة",
    "overview": "نظرة عامة",
    "tabs": {
      "workshop": "الورشة",
      "workshopDesc": "مقاييس الإنتاج والسعة",
      "hr": "الموارد البشرية",
      "hrDesc": "العمال والرواتب",
      "sales": "المبيعات",
      "salesDesc": "الإيرادات والعملاء",
      "inventory": "المخزون",
      "inventoryDesc": "المخزون والمواد"
    },
    "activeOrders": "الطلبات النشطة",
    "completedToday": "مكتمل اليوم",
    "productionStages": "مراحل الإنتاج",
    "qualityRate": "معدل الجودة",
    "productionFlow": "تدفق الإنتاج",
    "workshopOverview": "نظرة عامة على الورشة",
    "productionMetrics": "مقاييس الإنتاج",
    "inventoryStatus": "حالة المخزون",
    "performanceAnalytics": "تحليلات الأداء",
    "productionMetricsDescription": "مقاييس الإنتاج واستخدام السعة",
    "realTimeProductionTracking": "تتبع الإنتاج في الوقت الفعلي والكفاءة",
    "stockLevelsDescription": "مستويات المخزون ومتطلبات المواد",
    "kpisDescription": "مؤشرات الأداء الرئيسية",
    "subtitle": "نظام إدارة الورشة الذكي",
    "overallProgress": "التقدم الإجمالي للإنتاج",
    "stages": {
      "pending": "في الانتظار",
      "design": "التصميم",
      "cutting": "القص",
      "sewing": "الخياطة",
      "fitting": "التجربة",
      "finishing": "اللمسة الأخيرة",
      "completed": "مكتمل"
    }
  },
  "status": {
    "pending": "قيد الانتظار",
    "inProgress": "قيد التنفيذ",
    "completed": "مكتمل",
    "cancelled": "ملغي",
    "onBreak": "في استراحة",
    "available": "متاح",
    "busy": "مشغول"
  }
};

// كتابة الملف الجديد
fs.writeFileSync('src/locales/ar.json', JSON.stringify(arData, null, 2), 'utf8');

console.log('✅ تم إنشاء ملف ar.json جديد ونظيف!');
console.log('📊 عدد المفاتيح في common:', Object.keys(arData.common).length);
console.log('📊 عدد المفاتيح في sidebar:', Object.keys(arData.sidebar).length);
console.log('📊 عدد المفاتيح في dashboard:', Object.keys(arData.dashboard).length);

// التحقق من صحة JSON
try {
    JSON.parse(fs.readFileSync('src/locales/ar.json', 'utf8'));
    console.log('✅ الملف صحيح ويعمل بشكل جيد!');
} catch (e) {
    console.log('❌ خطأ:', e.message);
}