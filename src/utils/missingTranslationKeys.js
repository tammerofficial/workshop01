// قائمة شاملة بجميع مفاتيح الترجمة المفقودة من جميع الصفحات

export const missingTranslationKeys = {
  // Orders Management
  orders: {
    title: { en: "Orders Management", ar: "إدارة الطلبات" },
    subtitle: { en: "Manage and track all workshop orders", ar: "إدارة وتتبع جميع طلبات الورشة" },
    refresh: { en: "Refresh", ar: "تحديث" },
    export: { en: "Export", ar: "تصدير" },
    newOrder: { en: "New Order", ar: "طلب جديد" },
    searchPlaceholder: { en: "Search orders...", ar: "البحث في الطلبات..." },
    ordersCount: { en: "orders", ar: "طلبية" },
    noItemsInStage: { en: "No items in this stage", ar: "لا توجد عناصر في هذه المرحلة" },
    filters: {
      allStatuses: { en: "All Statuses", ar: "جميع الحالات" },
      allPriorities: { en: "All Priorities", ar: "جميع الأولويات" }
    },
    stats: {
      total: { en: "Total Orders", ar: "إجمالي الطلبات" },
      totalRevenue: { en: "Total Revenue", ar: "إجمالي الإيرادات" }
    },
    status: {
      pending: { en: "Pending", ar: "معلق" },
      inProgress: { en: "In Progress", ar: "قيد التنفيذ" },
      completed: { en: "Completed", ar: "مكتمل" }
    },
    priority: {
      high: { en: "High", ar: "عالي" },
      medium: { en: "Medium", ar: "متوسط" },
      low: { en: "Low", ar: "منخفض" }
    },
    table: {
      orderNumber: { en: "Order Number", ar: "رقم الطلب" },
      customer: { en: "Customer", ar: "العميل" },
      status: { en: "Status", ar: "الحالة" },
      priority: { en: "Priority", ar: "الأولوية" },
      progress: { en: "Progress", ar: "التقدم" },
      amount: { en: "Amount", ar: "المبلغ" },
      dueDate: { en: "Due Date", ar: "تاريخ الاستحقاق" },
      actions: { en: "Actions", ar: "الإجراءات" }
    }
  },

  // Clients Management
  clients: {
    title: { en: "Clients", ar: "العملاء" },
    subtitle: { en: "Manage customer information and profiles", ar: "إدارة معلومات وملفات العملاء" },
    syncFromWooCommerce: { en: "Sync from WooCommerce", ar: "مزامنة من ووكومرس" },
    addNew: { en: "Add New", ar: "إضافة جديد" },
    total: { en: "Total Clients", ar: "إجمالي العملاء" },
    woocommerce: { en: "WooCommerce", ar: "ووكومرس" },
    local: { en: "Local", ar: "محلي" },
    searchPlaceholder: { en: "Search clients...", ar: "البحث في العملاء..." },
    viewProfile: { en: "View Profile", ar: "عرض الملف الشخصي" },
    editClient: { en: "Edit Client", ar: "تعديل العميل" },
    source: {
      all: { en: "All Sources", ar: "جميع المصادر" },
      local: { en: "Local", ar: "محلي" },
      woocommerce: { en: "WooCommerce", ar: "ووكومرس" }
    },
    table: {
      name: { en: "Name", ar: "الاسم" },
      email: { en: "Email", ar: "البريد الإلكتروني" },
      phone: { en: "Phone", ar: "الهاتف" },
      source: { en: "Source", ar: "المصدر" },
      orders: { en: "Orders", ar: "الطلبات" },
      actions: { en: "Actions", ar: "الإجراءات" }
    }
  },

  // Inventory Management
  inventory: {
    title: { en: "Inventory", ar: "المخزون" },
    subtitle: { en: "Track materials and supplies", ar: "تتبع المواد والمستلزمات" },
    addItem: { en: "Add Item", ar: "إضافة عنصر" },
    totalItems: { en: "Total Items", ar: "إجمالي العناصر" },
    lowStock: { en: "Low Stock", ar: "مخزون منخفض" },
    outOfStock: { en: "Out of Stock", ar: "نفد المخزون" },
    stockValue: { en: "Stock Value", ar: "قيمة المخزون" },
    searchPlaceholder: { en: "Search inventory...", ar: "البحث في المخزون..." },
    allCategories: { en: "All Categories", ar: "جميع الفئات" },
    allStatuses: { en: "All Statuses", ar: "جميع الحالات" },
    lowStockStatus: { en: "Low Stock", ar: "مخزون منخفض" },
    table: {
      image: { en: "Image", ar: "الصورة" },
      name: { en: "Name", ar: "الاسم" },
      sku: { en: "SKU", ar: "رمز المنتج" },
      category: { en: "Category", ar: "الفئة" },
      quantity: { en: "Quantity", ar: "الكمية" },
      status: { en: "Status", ar: "الحالة" },
      actions: { en: "Actions", ar: "الإجراءات" }
    }
  },

  // Workers Management
  workers: {
    title: { en: "Workers", ar: "العمال" },
    subtitle: { en: "عرض العمال المسجلين من النظام البيومتري فقط", ar: "عرض العمال المسجلين من النظام البيومتري فقط" },
    refresh: { en: "Refresh", ar: "تحديث" },
    addWorker: { en: "Add Worker", ar: "إضافة عامل" },
    total: { en: "Total Workers", ar: "إجمالي العمال" },
    active: { en: "Active", ar: "نشط" },
    inactive: { en: "Inactive", ar: "غير نشط" },
    department: { en: "Department", ar: "القسم" },
    searchPlaceholder: { en: "Search workers...", ar: "البحث في العمال..." },
    allDepartments: { en: "All Departments", ar: "جميع الأقسام" },
    activeStatus: { en: "Active", ar: "نشط" },
    biometric: { en: "Biometric", ar: "بيومتري" },
    employeeCode: { en: "Employee Code", ar: "كود الموظف" },
    workersCount: { en: "workers", ar: "عامل" }
  },

  // Calendar
  calendar: {
    title: { en: "Calendar", ar: "التقويم" },
    subtitle: { en: "Schedule appointments and manage events", ar: "جدولة المواعيد وإدارة الأحداث" },
    view: {
      month: { en: "Month", ar: "شهر" },
      week: { en: "Week", ar: "أسبوع" },
      day: { en: "Day", ar: "يوم" }
    },
    filter: {
      all: { en: "All", ar: "الكل" },
      tasks: { en: "Tasks", ar: "المهام" },
      orders: { en: "Orders", ar: "الطلبات" }
    },
    refresh: { en: "Refresh", ar: "تحديث" },
    stats: {
      title: { en: "Statistics", ar: "الإحصائيات" },
      pendingTasks: { en: "Pending Tasks", ar: "المهام المعلقة" },
      completedTasks: { en: "Completed Tasks", ar: "المهام المكتملة" },
      pendingOrders: { en: "Pending Orders", ar: "الطلبات المعلقة" },
      completedOrders: { en: "Completed Orders", ar: "الطلبات المكتملة" }
    },
    dayNames: {
      sun: { en: "Sun", ar: "أحد" },
      mon: { en: "Mon", ar: "اثنين" },
      tue: { en: "Tue", ar: "ثلاثاء" },
      wed: { en: "Wed", ar: "أربعاء" },
      thu: { en: "Thu", ar: "خميس" },
      fri: { en: "Fri", ar: "جمعة" },
      sat: { en: "Sat", ar: "سبت" }
    },
    legend: {
      title: { en: "Legend", ar: "المفتاح" },
      tasks: { en: "Tasks", ar: "المهام" },
      orders: { en: "Orders", ar: "الطلبات" },
      completed: { en: "Completed", ar: "مكتمل" },
      pending: { en: "Pending", ar: "معلق" }
    }
  },

  // Production Flow
  productionFlow: {
    title: { en: "Production Flow", ar: "تدفق الإنتاج" },
    subtitle: { en: "Track production workflow", ar: "تتبع سير العمل الإنتاجي" }
  },

  // Station Display
  stationDisplay: {
    title: { en: "Station Display", ar: "عرض المحطات" }
  },

  // Production Tracking
  productionTracking: {
    title: { en: "Production Tracking", ar: "تتبع الإنتاج" },
    subtitle: { en: "Monitor production progress", ar: "مراقبة تقدم الإنتاج" },
    alerts: { en: "Alerts", ar: "التنبيهات" },
    workerAnalysis: { en: "Worker Analysis", ar: "تحليل العمال" },
    reports: { en: "Reports", ar: "التقارير" },
    refreshData: { en: "Refresh Data", ar: "تحديث البيانات" },
    searchPlaceholder: { en: "Search...", ar: "البحث..." },
    allStatuses: { en: "All Statuses", ar: "جميع الحالات" },
    totalOrders: { en: "Total Orders", ar: "إجمالي الطلبات" },
    inProgressOrders: { en: "In Progress Orders", ar: "الطلبات قيد التنفيذ" },
    completedOrders: { en: "Completed Orders", ar: "الطلبات المكتملة" },
    averageEfficiency: { en: "Average Efficiency", ar: "متوسط الكفاءة" },
    lowStockMaterials: { en: "Low Stock Materials", ar: "المواد منخفضة المخزون" }
  },

  // Tasks
  tasks: {
    total: { en: "Total Tasks", ar: "إجمالي المهام" },
    tasksCount: { en: "tasks", ar: "مهمة" }
  },

  // Production
  production: {
    dragToMove: { en: "Drag to move", ar: "اسحب للنقل" },
    stages: {
      design: { en: "Design", ar: "التصميم" },
      cutting: { en: "Cutting", ar: "القص" },
      sewing: { en: "Sewing", ar: "الخياطة" },
      fitting: { en: "Fitting", ar: "التفصيل" },
      completed: { en: "Completed", ar: "مكتمل" }
    }
  },

  // Stations
  stations: {
    title: { en: "Stations", ar: "المحطات" },
    subtitle: { en: "Manage production stations", ar: "إدارة محطات الإنتاج" },
    viewProduction: { en: "View Production", ar: "عرض الإنتاج" },
    viewTracking: { en: "View Tracking", ar: "عرض التتبع" },
    refresh: { en: "Refresh", ar: "تحديث" },
    integration: { en: "Integration", ar: "التكامل" },
    flowConnection: { en: "Flow Connection", ar: "اتصال التدفق" },
    trackingConnection: { en: "Tracking Connection", ar: "اتصال التتبع" },
    realTimeUpdates: { en: "Real-time Updates", ar: "التحديثات الفورية" },
    totalWorkers: { en: "Total Workers", ar: "إجمالي العمال" },
    availableWorkers: { en: "Available Workers", ar: "العمال المتاحين" },
    activeTasks: { en: "Active Tasks", ar: "المهام النشطة" },
    pendingOrders: { en: "Pending Orders", ar: "الطلبات المعلقة" },
    allDepartments: { en: "All Departments", ar: "جميع الأقسام" },
    gridView: { en: "Grid View", ar: "عرض الشبكة" },
    listView: { en: "List View", ar: "عرض القائمة" },
    available: { en: "Available", ar: "متاح" },
    efficiency: { en: "Efficiency", ar: "الكفاءة" },
    completedTasks: { en: "Completed Tasks", ar: "المهام المكتملة" },
    currentTask: { en: "Current Task", ar: "المهمة الحالية" },
    noCurrentTask: { en: "No current task", ar: "لا توجد مهمة حالية" },
    startTask: { en: "Start Task", ar: "بدء المهمة" }
  },

  // Sales
  sales: {
    title: { en: "Sales Management 💰", ar: "إدارة المبيعات 💰" },
    subtitle: { en: "Track all sales and revenue", ar: "تتبع جميع المبيعات والإيرادات" },
    newSale: { en: "New Sale", ar: "بيع جديد" },
    totalSales: { en: "Total Sales", ar: "إجمالي المبيعات" },
    todaySales: { en: "Today's Sales", ar: "مبيعات اليوم" },
    averageSale: { en: "Average Sale", ar: "متوسط البيع" },
    totalOrders: { en: "Total Orders", ar: "إجمالي الطلبات" },
    recentSales: { en: "Recent Sales", ar: "المبيعات الأخيرة" }
  },

  // Invoices
  invoices: {
    title: { en: "Invoices", ar: "الفواتير" },
    subtitle: { en: "Manage billing and payments", ar: "إدارة الفوترة والمدفوعات" },
    new: { en: "New Invoice", ar: "فاتورة جديدة" },
    total: { en: "Total Invoices", ar: "إجمالي الفواتير" },
    paid: { en: "Paid Amount", ar: "المبلغ المدفوع" },
    pending: { en: "Pending Amount", ar: "المبلغ المعلق" },
    overdue: { en: "Overdue", ar: "متأخر" },
    searchPlaceholder: { en: "Search invoices...", ar: "البحث في الفواتير..." },
    allStatuses: { en: "All Statuses", ar: "جميع الحالات" },
    noInvoices: { en: "No invoices found", ar: "لم يتم العثور على فواتير" },
    createFirst: { en: "Create your first invoice", ar: "أنشئ فاتورتك الأولى" }
  },

  // Analytics
  analytics: {
    title: { en: "Analytics", ar: "التحليلات" },
    subtitle: { en: "Business insights and performance metrics", ar: "رؤى الأعمال ومقاييس الأداء" },
    controls: {
      week: { en: "Week", ar: "أسبوع" },
      month: { en: "Month", ar: "شهر" },
      quarter: { en: "Quarter", ar: "ربع سنة" },
      year: { en: "Year", ar: "سنة" },
      orders: { en: "Orders", ar: "الطلبات" },
      revenue: { en: "Revenue", ar: "الإيرادات" },
      workers: { en: "Workers", ar: "العمال" },
      tasks: { en: "Tasks", ar: "المهام" },
      export: { en: "Export", ar: "تصدير" }
    },
    metrics: {
      totalOrders: { en: "Total Orders", ar: "إجمالي الطلبات" },
      totalRevenue: { en: "Total Revenue", ar: "إجمالي الإيرادات" },
      activeWorkers: { en: "Active Workers", ar: "العمال النشطين" },
      completedTasks: { en: "Completed Tasks", ar: "المهام المكتملة" },
      fromLastMonth: { en: "from last month", ar: "من الشهر الماضي" }
    },
    charts: {
      monthlyOrders: { en: "Monthly Orders", ar: "الطلبات الشهرية" },
      departmentPerformance: { en: "Department Performance", ar: "أداء الأقسام" },
      orderStatus: { en: "Order Status", ar: "حالة الطلبات" },
      taskStatus: { en: "Task Status", ar: "حالة المهام" },
      completed: { en: "Completed", ar: "مكتمل" },
      inProgress: { en: "In Progress", ar: "قيد التنفيذ" },
      pending: { en: "Pending", ar: "معلق" },
      overdue: { en: "Overdue", ar: "متأخر" }
    }
  },

  // Attendance
  attendance: {
    title: { en: "Attendance", ar: "الحضور والانصراف" },
    subtitle: { en: "Track worker attendance and time", ar: "تتبع حضور العمال والوقت" },
    syncBiometric: { en: "Sync Biometric", ar: "مزامنة البيومتري" },
    attendanceRecords: { en: "Attendance Records", ar: "سجلات الحضور" },
    totalHours: { en: "Total Hours", ar: "إجمالي الساعات" },
    noRecordsFound: { en: "No records found", ar: "لم يتم العثور على سجلات" },
    adjustFilters: { en: "Try adjusting your filters", ar: "جرب تعديل المرشحات" },
    syncNow: { en: "Sync Now", ar: "مزامنة الآن" }
  },

  // Payroll
  payroll: {
    title: { en: "Payroll 💰", ar: "الرواتب 💰" },
    description: { en: "Manage employee salaries and payments", ar: "إدارة رواتب ومدفوعات الموظفين" },
    createPayroll: { en: "Create Payroll", ar: "إنشاء راتب" },
    createAllPayrolls: { en: "Create All Payrolls", ar: "إنشاء جميع الرواتب" },
    totalPayroll: { en: "Total Payroll", ar: "إجمالي الرواتب" },
    averageSalary: { en: "Average Salary", ar: "متوسط الراتب" },
    totalWorkers: { en: "Total Workers", ar: "إجمالي العمال" },
    totalHours: { en: "Total Hours", ar: "إجمالي الساعات" },
    records: { en: "Payroll Records", ar: "سجلات الرواتب" },
    payrollNumber: { en: "Payroll Number", ar: "رقم الراتب" },
    worker: { en: "Worker", ar: "العامل" },
    hours: { en: "Hours", ar: "الساعات" },
    baseSalary: { en: "Base Salary", ar: "الراتب الأساسي" },
    overtime: { en: "Overtime", ar: "الوقت الإضافي" },
    bonus: { en: "Bonus", ar: "المكافأة" },
    netSalary: { en: "Net Salary", ar: "صافي الراتب" }
  },

  // ERP Management
  erp: {
    title: { en: "ERP Management", ar: "إدارة نظام تخطيط الموارد" },
    subtitle: { en: "Manage departments and positions for the organization", ar: "إدارة الأقسام والمناصب للمؤسسة" },
    departments: { en: "Departments", ar: "الأقسام" },
    positions: { en: "Positions", ar: "المناصب" },
    resignations: { en: "Resignations", ar: "الاستقالات" },
    devices: { en: "Devices", ar: "الأجهزة" },
    addDepartment: { en: "Add department", ar: "إضافة قسم" },
    departmentName: { en: "Department Name", ar: "اسم القسم" },
    departmentCode: { en: "Department Code", ar: "كود القسم" },
    noDepartmentsFound: { en: "No departments found", ar: "لم يتم العثور على أقسام" }
  },

  // Advanced Features
  advanced: {
    title: { en: "Advanced Features", ar: "المزايا المتقدمة" },
    subtitle: { en: "AI, IoT integration, and smart automation tools", ar: "الذكاء الاصطناعي وإنترنت الأشياء وأدوات الأتمتة الذكية" },
    tabs: {
      ai: { en: "AI Features", ar: "مزايا الذكاء الاصطناعي" },
      iot: { en: "IoT Integration", ar: "تكامل إنترنت الأشياء" },
      system: { en: "System", ar: "النظام" },
      automation: { en: "Automation", ar: "الأتمتة" }
    },
    features: {
      ai: {
        title: { en: "AI-Powered Features", ar: "المزايا المدعومة بالذكاء الاصطناعي" },
        description: { en: "Smart automation and predictive analytics", ar: "الأتمتة الذكية والتحليلات التنبؤية" },
        autoAssignment: { en: "Auto Task Assignment", ar: "تخصيص المهام التلقائي" },
        autoAssignmentDescription: { en: "Automatically assign tasks based on worker skills and availability", ar: "تخصيص المهام تلقائياً بناءً على مهارات العمال وتوفرهم" },
        predictiveAnalytics: { en: "Predictive Analytics", ar: "التحليلات التنبؤية" },
        predictiveAnalyticsDescription: { en: "Predict bottlenecks and optimize workflow", ar: "التنبؤ بالاختناقات وتحسين سير العمل" },
        qualityControl: { en: "AI Quality Control", ar: "مراقبة الجودة بالذكاء الاصطناعي" },
        qualityControlDescription: { en: "Automated quality inspection using computer vision", ar: "فحص الجودة التلقائي باستخدام الرؤية الحاسوبية" },
        demandForecasting: { en: "Demand Forecasting", ar: "توقع الطلب" },
        demandForecastingDescription: { en: "Predict demand patterns for better inventory management", ar: "توقع أنماط الطلب لإدارة أفضل للمخزون" }
      }
    }
  },

  // RBAC Security
  rbac: {
    title: { en: "Security & Permissions Dashboard", ar: "لوحة تحكم الأمان والصلاحيات" },
    subtitle: { en: "Monitor and manage system security in real-time", ar: "مراقبة وإدارة أمان النظام في الوقت الفعلي" },
    exportReport: { en: "Export Report", ar: "تصدير التقرير" },
    overview: { en: "Overview", ar: "نظرة عامة" },
    security: { en: "Security", ar: "الأمان" },
    audit: { en: "Audit", ar: "المراجعة" },
    reports: { en: "Reports", ar: "التقارير" },
    totalUsers: { en: "Total Users", ar: "إجمالي المستخدمين" },
    activeUsers: { en: "Active Users", ar: "المستخدمون النشطون" },
    totalRoles: { en: "Total Roles", ar: "إجمالي الأدوار" },
    deniedPermissions: { en: "Denied Permissions Today", ar: "الصلاحيات المرفوضة اليوم" },
    criticalAlerts: { en: "Critical Security Alerts", ar: "التنبيهات الأمنية الحرجة" },
    noCriticalAlerts: { en: "No critical alerts", ar: "لا يوجد تنبيهات حرجة" },
    systemSecure: { en: "System operating securely", ar: "النظام يعمل بأمان تام" },
    roleDistribution: { en: "Role Distribution", ar: "توزيع الأدوار" },
    level: { en: "Level", ar: "المستوى" },
    user: { en: "user", ar: "مستخدم" },
    users: { en: "users", ar: "مستخدم" },
    recentActivities: { en: "Recent Activities", ar: "الأنشطة الأخيرة" }
  },

  // Notifications
  notifications: {
    title: { en: "Notifications", ar: "الإشعارات" },
    subtitle: { en: "Manage notifications and alerts", ar: "إدارة الإشعارات والتنبيهات" },
    markAllAsRead: { en: "Mark all as read", ar: "تحديد الكل كمقروء" },
    viewDetails: { en: "View Details", ar: "عرض التفاصيل" }
  },

  // Settings
  settings: {
    title: { en: "Settings ⚙️", ar: "الإعدادات ⚙️" },
    subtitle: { en: "Configure your application preferences", ar: "تكوين تفضيلات التطبيق الخاص بك" },
    appearance: {
      title: { en: "Appearance", ar: "المظهر" },
      description: { en: "Customize the look and feel", ar: "تخصيص الشكل والمظهر" },
      theme: {
        light: { en: "Light", ar: "فاتح" },
        lightDesc: { en: "Light theme", ar: "المظهر الفاتح" },
        dark: { en: "Dark", ar: "داكن" },
        darkDesc: { en: "Dark theme", ar: "المظهر الداكن" },
        auto: { en: "Auto", ar: "تلقائي" },
        autoDesc: { en: "Matches system preference", ar: "يطابق تفضيل النظام" }
      },
      primaryColor: {
        title: { en: "Primary Color", ar: "اللون الأساسي" }
      },
      colors: {
        custom: { en: "Custom", ar: "مخصص" }
      },
      preview: {
        title: { en: "Preview", ar: "معاينة" },
        description: { en: "See how your changes look", ar: "شاهد كيف تبدو تغييراتك" },
        cardTitle: { en: "Preview Card", ar: "بطاقة المعاينة" },
        cardDescription: { en: "This is how your theme will look", ar: "هكذا سيبدو المظهر الخاص بك" },
        successButton: { en: "Success Button", ar: "زر النجاح" },
        secondaryButton: { en: "Secondary Button", ar: "الزر الثانوي" }
      }
    },
    advancedAppearance: {
      title: { en: "Advanced Appearance", ar: "المظهر المتقدم" },
      description: { en: "Advanced customization options", ar: "خيارات التخصيص المتقدمة" }
    },
    notifications: {
      title: { en: "Notifications", ar: "الإشعارات" },
      description: { en: "Manage notification preferences", ar: "إدارة تفضيلات الإشعارات" }
    },
    general: {
      title: { en: "General", ar: "عام" },
      description: { en: "General application settings", ar: "الإعدادات العامة للتطبيق" },
      language: {
        title: { en: "Language", ar: "اللغة" },
        ltr: { en: "Left to Right", ar: "من اليسار لليمين" },
        rtl: { en: "Right to Left", ar: "من اليمين لليسار" }
      }
    },
    security: {
      title: { en: "Security", ar: "الأمان" },
      description: { en: "Security and privacy settings", ar: "إعدادات الأمان والخصوصية" }
    },
    woocommerce: {
      title: { en: "WooCommerce", ar: "ووكومرس" },
      description: { en: "WooCommerce integration settings", ar: "إعدادات تكامل ووكومرس" }
    },
    actions: {
      save: { en: "Save Changes", ar: "حفظ التغييرات" },
      reset: { en: "Reset to Default", ar: "إعادة تعيين للافتراضي" }
    }
  },

  // Language
  language: {
    english: { en: "English", ar: "الإنجليزية" },
    arabic: { en: "Arabic", ar: "العربية" }
  },

  // Common terms
  common: {
    client: { en: "Client", ar: "العميل" },
    dueDate: { en: "Due Date", ar: "تاريخ الاستحقاق" },
    progress: { en: "Progress", ar: "التقدم" },
    showMore: { en: "Show More", ar: "عرض المزيد" },
    status: { en: "Status", ar: "الحالة" },
    date: { en: "Date", ar: "التاريخ" },
    actions: { en: "Actions", ar: "الإجراءات" },
    enabled: { en: "Enabled", ar: "مفعل" },
    disabled: { en: "Disabled", ar: "معطل" }
  }
};

export default missingTranslationKeys;