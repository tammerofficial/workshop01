const fs = require('fs');

// قراءة الملف الإنجليزي كمرجع
const enData = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));

// إنشاء ملف عربي كامل
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
    "subtitle": "نظام إدارة الورشة الذكي",
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
  },
  "priority": {
    "high": "عالي",
    "medium": "متوسط",
    "low": "منخفض",
    "urgent": "عاجل"
  },
  "actions": {
    "start": "بدء",
    "pause": "إيقاف مؤقت",
    "complete": "إكمال",
    "stop": "توقف",
    "resume": "استئناف"
  },
  "orders": {
    "title": "إدارة الطلبات",
    "subtitle": "إدارة وتتبع جميع طلبات الورشة",
    "refresh": "تحديث",
    "export": "تصدير",
    "newOrder": "طلب جديد",
    "searchPlaceholder": "البحث في الطلبات...",
    "filters": {
      "allStatuses": "جميع الحالات",
      "allPriorities": "جميع الأولويات"
    },
    "stats": {
      "total": "إجمالي الطلبات",
      "totalRevenue": "إجمالي الإيرادات"
    },
    "status": {
      "pending": "قيد الانتظار",
      "inProgress": "قيد التنفيذ",
      "completed": "مكتمل",
      "cancelled": "ملغي"
    },
    "table": {
      "orderNumber": "رقم الطلب",
      "customer": "العميل",
      "phone": "الهاتف",
      "description": "الوصف",
      "status": "الحالة",
      "priority": "الأولوية",
      "progress": "التقدم",
      "amount": "المبلغ",
      "dueDate": "تاريخ الاستحقاق",
      "actions": "الإجراءات"
    },
    "priority": {
      "high": "عالي",
      "medium": "متوسط",
      "low": "منخفض"
    },
    "editStarted": "تم بدء وضع التعديل",
    "confirmDelete": "هل أنت متأكد من حذف هذا الطلب؟",
    "deleteSuccess": "تم حذف الطلب بنجاح",
    "deleteError": "فشل في حذف الطلب",
    "refreshSuccess": "تم تحديث الطلبات بنجاح"
  },
  "clients": {
    "title": "العملاء",
    "subtitle": "إدارة معلومات وملفات العملاء",
    "syncFromWooCommerce": "مزامنة من ووكومرس",
    "addNew": "إضافة جديد",
    "total": "إجمالي العملاء",
    "woocommerce": "ووكومرس",
    "local": "محلي",
    "searchPlaceholder": "البحث في العملاء...",
    "source": {
      "all": "جميع المصادر",
      "local": "محلي",
      "woocommerce": "ووكومرس"
    },
    "table": {
      "name": "الاسم",
      "contact": "التواصل",
      "orders": "الطلبات",
      "value": "إجمالي القيمة",
      "lastOrder": "آخر طلب",
      "source": "المصدر",
      "actions": "الإجراءات"
    },
    "updateSuccess": "تم تحديث العميل بنجاح",
    "updateError": "فشل في تحديث العميل. يرجى المحاولة مرة أخرى."
  },
  "inventory": {
    "title": "إدارة المخزون",
    "subtitle": "تتبع وإدارة المواد واللوازم",
    "addMaterial": "إضافة مادة",
    "searchPlaceholder": "البحث في المواد...",
    "filters": {
      "allCategories": "جميع الفئات",
      "allStock": "جميع مستويات المخزون",
      "inStock": "متوفر",
      "lowStock": "مخزون منخفض",
      "outOfStock": "نفد المخزون"
    },
    "table": {
      "material": "المادة",
      "category": "الفئة",
      "stock": "المخزون",
      "unit": "الوحدة",
      "cost": "التكلفة",
      "supplier": "المورد",
      "location": "الموقع",
      "status": "الحالة",
      "actions": "الإجراءات"
    }
  },
  "workers": {
    "title": "إدارة العمال",
    "subtitle": "إدارة القوى العاملة وبيانات البصمة",
    "addWorker": "إضافة عامل",
    "searchPlaceholder": "البحث في العمال...",
    "filters": {
      "allDepartments": "جميع الأقسام",
      "allStatuses": "جميع الحالات"
    },
    "biometric": {
      "sync": "مزامنة من البصمة",
      "data": "بيانات البصمة",
      "lastSync": "آخر مزامنة"
    },
    "createSuccess": "تم إنشاء العامل بنجاح"
  },
  "calendar": {
    "title": "التقويم والجدولة",
    "subtitle": "جدولة المهام وتتبع المواعيد النهائية",
    "views": {
      "month": "شهر",
      "week": "أسبوع",
      "day": "يوم"
    },
    "filters": {
      "all": "جميع العناصر",
      "tasks": "المهام فقط",
      "orders": "الطلبات فقط"
    },
    "stats": {
      "upcomingTasks": "المهام القادمة",
      "overdueItems": "العناصر المتأخرة",
      "completedToday": "مكتمل اليوم"
    }
  },
  "productionFlow": {
    "title": "تدفق الإنتاج",
    "description": "تتبع الطلبات عبر مراحل الإنتاج"
  },
  "productionTracking": {
    "title": "تتبع الإنتاج",
    "subtitle": "مراقبة الإنتاج في الوقت الفعلي",
    "efficiency": "الكفاءة",
    "quality": "الجودة",
    "timeline": "الجدول الزمني",
    "reports": "تقارير الإنتاج",
    "analytics": "تحليلات الإنتاج",
    "metrics": "المقاييس الرئيسية",
    "performance": "الأداء",
    "trends": "الاتجاهات",
    "alerts": "تنبيهات الإنتاج"
  },
  "stationDisplay": {
    "title": "عرض المحطة"
  },
  "stations": {
    "title": "محطات الإنتاج",
    "subtitle": "إدارة محطات الورشة والمهام",
    "addStation": "إضافة محطة",
    "efficiency": "الكفاءة",
    "workers": "العمال",
    "currentTasks": "المهام الحالية",
    "completedToday": "مكتمل اليوم",
    "status": {
      "active": "نشط",
      "maintenance": "صيانة",
      "idle": "خامل"
    },
    "metrics": {
      "throughput": "الإنتاجية",
      "utilization": "الاستخدام",
      "quality": "معدل الجودة"
    },
    "management": {
      "assignWorker": "تعيين عامل",
      "reassign": "إعادة تعيين",
      "viewTasks": "عرض المهام"
    }
  },
  "sales": {
    "title": "إدارة المبيعات",
    "revenue": "الإيرادات",
    "transactions": "المعاملات",
    "performance": "أداء المبيعات",
    "reports": "تقارير المبيعات",
    "analytics": "تحليلات المبيعات",
    "trends": "اتجاهات المبيعات",
    "targets": "أهداف المبيعات"
  },
  "invoices": {
    "title": "إدارة الفواتير",
    "create": "إنشاء فاتورة",
    "pending": "الفواتير المعلقة",
    "paid": "الفواتير المدفوعة",
    "overdue": "الفواتير المتأخرة",
    "draft": "مسودات الفواتير",
    "search": "البحث في الفواتير",
    "filters": "مرشحات الفواتير",
    "export": "تصدير الفواتير",
    "payment": "حالة الدفع",
    "dueDate": "تاريخ الاستحقاق"
  },
  "analytics": {
    "title": "التحليلات والتقارير",
    "revenue": "تحليلات الإيرادات",
    "production": "تحليلات الإنتاج",
    "workforce": "تحليلات القوى العاملة",
    "inventory": "تحليلات المخزون",
    "dashboard": "لوحة التحليلات",
    "charts": "المخططات البيانية",
    "trends": "تحليل الاتجاهات",
    "forecasting": "التنبؤ",
    "kpis": "مؤشرات الأداء الرئيسية",
    "reports": "التقارير المُنشأة",
    "export": "تصدير التحليلات",
    "timeframe": "الإطار الزمني",
    "comparison": "مقارنة الفترات",
    "insights": "رؤى الأعمال",
    "metrics": "مقاييس الأداء",
    "growth": "تحليل النمو",
    "efficiency": "مقاييس الكفاءة",
    "quality": "مقاييس الجودة",
    "customer": "تحليلات العملاء",
    "sales": "تحليلات المبيعات"
  },
  "attendance": {
    "title": "إدارة الحضور",
    "clockIn": "تسجيل الحضور",
    "clockOut": "تسجيل الانصراف",
    "records": "سجلات الحضور",
    "sync": "مزامنة الحضور",
    "reports": "تقارير الحضور",
    "analytics": "تحليلات الحضور",
    "summary": "ملخص يومي"
  },
  "payroll": {
    "title": "إدارة الرواتب",
    "salaries": "الرواتب",
    "overtime": "الوقت الإضافي",
    "bonuses": "المكافآت",
    "deductions": "الخصومات",
    "reports": "تقارير الرواتب",
    "calculations": "حسابات الراتب",
    "payments": "سجلات الدفع",
    "tax": "معلومات الضرائب",
    "benefits": "مزايا الموظفين",
    "timesheets": "أوراق الوقت",
    "rates": "معدلات الدفع",
    "periods": "فترات الدفع"
  },
  "erp": {
    "title": "إدارة تخطيط الموارد",
    "departments": "الأقسام",
    "positions": "المناصب",
    "integration": "تكامل النظام"
  },
  "advanced": {
    "title": "المزايا المتقدمة",
    "ai": "تكامل الذكاء الاصطناعي",
    "automation": "أتمتة سير العمل",
    "integrations": "تكاملات الطرف الثالث",
    "customization": "تخصيص النظام",
    "workflows": "سير العمل المخصص",
    "rules": "قواعد الأعمال",
    "triggers": "المشغلات التلقائية",
    "notifications": "الإشعارات الذكية",
    "reporting": "التقارير المتقدمة",
    "analytics": "التحليلات التنبؤية",
    "optimization": "تحسين العمليات",
    "machine": "التعلم الآلي"
  },
  "rbac": {
    "title": "الأمان والتحكم في الوصول",
    "users": "إدارة المستخدمين",
    "roles": "إدارة الأدوار",
    "permissions": "الصلاحيات",
    "access": "التحكم في الوصول",
    "security": "إعدادات الأمان",
    "audit": "سجلات التدقيق",
    "authentication": "المصادقة",
    "authorization": "التخويل",
    "policies": "سياسات الأمان"
  },
  "notifications": {
    "title": "الإشعارات",
    "settings": "إعدادات الإشعارات",
    "alerts": "تنبيهات النظام",
    "preferences": "التفضيلات"
  },
  "settings": {
    "title": "الإعدادات",
    "general": "الإعدادات العامة",
    "appearance": "المظهر",
    "language": "اللغة",
    "notifications": "الإشعارات",
    "security": "الأمان",
    "backup": "النسخ الاحتياطي والاستعادة",
    "integrations": "التكاملات",
    "advanced": "الإعدادات المتقدمة",
    "system": "تكوين النظام",
    "user": "تفضيلات المستخدم",
    "theme": "إعدادات السمة",
    "display": "خيارات العرض",
    "privacy": "إعدادات الخصوصية",
    "performance": "إعدادات الأداء",
    "maintenance": "صيانة النظام",
    "updates": "تحديثات النظام",
    "logs": "سجلات النظام",
    "monitoring": "مراقبة النظام",
    "alerts": "تنبيهات النظام",
    "customization": "تخصيص الواجهة",
    "localization": "التوطين",
    "timezone": "إعدادات المنطقة الزمنية",
    "currency": "إعدادات العملة",
    "units": "وحدات القياس",
    "formats": "تنسيقات التاريخ والوقت",
    "defaults": "القيم الافتراضية",
    "templates": "قوالب المستندات",
    "branding": "خيارات العلامة التجارية",
    "workflows": "إعدادات سير العمل"
  },
  "barcodeQR": {
    "title": "إدارة الباركود و QR",
    "generate": "توليد كود",
    "scan": "مسح كود",
    "history": "تاريخ المسح",
    "settings": "إعدادات الكود",
    "types": "أنواع الأكواد",
    "formats": "التنسيقات المدعومة",
    "integration": "تكامل النظام",
    "tracking": "تتبع الكود"
  }
};

// كتابة الملف الجديد
fs.writeFileSync('src/locales/ar.json', JSON.stringify(arData, null, 2), 'utf8');

console.log('✅ تم إنشاء ملف ar.json كامل!');
console.log('📊 عدد الأقسام الرئيسية:', Object.keys(arData).length);

// عد إجمالي المفاتيح
let totalKeys = 0;
function countKeys(obj) {
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      countKeys(obj[key]);
    } else {
      totalKeys++;
    }
  }
}
countKeys(arData);

console.log('📊 إجمالي المفاتيح:', totalKeys);

// التحقق من صحة JSON
try {
    JSON.parse(fs.readFileSync('src/locales/ar.json', 'utf8'));
    console.log('✅ الملف صحيح ويعمل بشكل جيد!');
} catch (e) {
    console.log('❌ خطأ:', e.message);
}