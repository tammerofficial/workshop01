// معالج التحديث الشامل للترجمات
// يقوم بالبحث والاستبدال التلقائي لجميع النصوص الثابتة الشائعة

const bulkTranslationMappings = {
  // النصوص العربية الشائعة
  'جاري تحميل...': "t('common.loading')",
  'جاري التحميل...': "t('common.loading')",
  'جاري تحميل لوحة التحكم...': "t('common.loading')",
  'جاري تحميل نظام التدفق...': "t('common.loading')",
  'فشل في تحميل البيانات': "t('common.loadingError')",
  'تحديث': "t('common.refresh')",
  'حفظ': "t('common.save')",
  'إلغاء': "t('common.cancel')",
  'حذف': "t('common.delete')",
  'تعديل': "t('common.edit')",
  'إضافة': "t('common.add')",
  'إغلاق': "t('common.close')",
  'رجوع': "t('common.back')",
  'التالي': "t('common.next')",
  'إرسال': "t('common.submit')",
  'تأكيد': "t('common.confirm')",
  'نعم': "t('common.yes')",
  'لا': "t('common.no')",
  'موافق': "t('common.ok')",
  
  // نصوص لوحة التحكم
  'آخر تحديث': "t('dashboard.stats.lastUpdated')",
  'الطلبيات المكتملة اليوم': "t('dashboard.stats.completedOrders')",
  'العمال النشطين': "t('dashboard.stats.activeWorkers')",
  'متوسط الكفاءة': "t('dashboard.stats.averageEfficiency')",
  'متوسط الجودة': "t('dashboard.stats.averageQuality')",
  'مهام نشطة': "t('dashboard.stats.activeTasks')",
  'عمال متصلين': "t('dashboard.stats.connectedWorkers')",
  'طلبيات في الانتظار': "t('dashboard.stats.pendingOrders')",
  'طلبيات عاجلة': "t('dashboard.stats.urgentOrders')",
  'أفضل العمال اليوم': "t('dashboard.stats.topWorkers')",
  'المقاييس الفورية': "t('dashboard.stats.liveMetrics')",
  'مراحل الإنتاج': "t('dashboard.productionStages')",
  'تدفق الإنتاج': "t('dashboard.productionFlow')",
  'التقدم الإجمالي للإنتاج': "t('dashboard.overallProgress')",
  
  // نصوص مراحل الإنتاج
  'الطلبات المعلقة': "t('dashboard.stages.pending')",
  'التصميم': "t('dashboard.stages.design')",
  'القص': "t('dashboard.stages.cutting')",
  'الخياطة': "t('dashboard.stages.sewing')",
  'التفصيل': "t('dashboard.stages.fitting')",
  'اللمسة الأخيرة': "t('dashboard.stages.finishing')",
  'مكتمل': "t('dashboard.stages.completed')",
  
  // نصوص الحالات
  'نشط': "t('status.active')",
  'غير نشط': "t('status.inactive')",
  'معلق': "t('status.pending')",
  'معلقة': "t('status.pending')",
  'مكتمل': "t('status.completed')",
  'مكتملة': "t('status.completed')",
  'قيد التنفيذ': "t('status.inProgress')",
  'فشل': "t('status.failed')",
  'نجح': "t('status.success')",
  'متاح': "t('status.available')",
  'متاحين': "t('status.available')",
  'مشغول': "t('status.busy')",
  'مشغولين': "t('status.busy')",
  'في استراحة': "t('status.onBreak')",
  
  // نصوص العمال والمهام
  'حالة العمال': "t('workflow.workersStatus')",
  'إجمالي العمال النشطين': "t('dashboard.stats.activeWorkers')",
  'معدل الإكمال': "t('workflow.completionRate')",
  'مكتملة اليوم': "t('workflow.completedToday')",
  'عامل': "t('workflow.workers')",
  'المهام الحالية': "t('workflow.currentTasks')",
  'لا توجد مهام حالية': "t('workflow.noCurrentTasks')",
  'سيتم تخصيص مهام جديدة قريباً': "t('workflow.newTasksSoon')",
  'مخصصة': "t('workflow.assigned')",
  'كفاءة الأداء': "t('workflow.efficiency')",
  'درجة الجودة': "t('workflow.quality')",
  'مهام اليوم': "t('workflow.todayTasks')",
  'الترتيب اليومي': "t('workflow.dailyRank')",
  'سلسلة أداء ممتاز': "t('workflow.excellentStreak')",
  'أيام': "t('time.days')",
  'كود الموظف': "t('worker.employeeCode')",
  'التاريخ': "t('time.date')",
  
  // نصوص الأزرار والإجراءات
  'بدء': "t('actions.start')",
  'إيقاف مؤقت': "t('actions.pause')",
  'اكتمل': "t('actions.complete')",
  'عرض التفاصيل': "t('common.viewDetails')",
  
  // نصوص الأولوية والتصنيف
  'عالي': "t('priority.high')",
  'متوسط': "t('priority.medium')",
  'منخفض': "t('priority.low')",
  'عاجل': "t('priority.urgent')",
  
  // نصوص المنتجات والطلبات
  'إدارة الطلبات': "t('page.orders.title')",
  'إدارة المنتجات': "t('page.products.title')",
  'إدارة العملاء': "t('page.clients.title')",
  'إدارة العمال': "t('page.workers.title')",
  'إدارة المخزون': "t('page.inventory.title')",
  'التقويم': "t('page.calendar.title')",
  'محطات الإنتاج': "t('page.stations.title')",
  'المبيعات': "t('page.sales.title')",
  'الفواتير': "t('page.invoices.title')",
  'التحليلات': "t('page.analytics.title')",
  'الحضور والانصراف': "t('page.attendance.title')",
  'الرواتب': "t('page.payroll.title')",
  'إدارة النظام': "t('page.erpManagement.title')",
  'المزايا المتقدمة': "t('page.advancedFeatures.title')",
  'إدارة الإضافات': "t('page.pluginManagement.title')",
  'الأمان والصلاحيات': "t('page.rbacSecurity.title')",
  'إعدادات المستخدم': "t('page.userSettings.title')",
  'الإعدادات': "t('page.settings.title')",
  
  // نصوص الباركود و QR
  'إدارة الباركود و QR Code': "t('page.barcodeQR.title')",
  'الباركود و QR': "t('page.barcodeQR.short')",
  
  // نصوص أخرى شائعة
  'تفاصيل': "t('common.details')",
  'المزيد': "t('common.more')",
  'أقل': "t('common.less')",
  'الكل': "t('common.all')",
  'لا شيء': "t('common.none')",
  'غير محدد': "t('common.undefined')",
  'غير معروف': "t('common.unknown')",
  'خطأ': "t('common.error')",
  'تحذير': "t('common.warning')",
  'معلومات': "t('common.info')",
  'نجح العملية': "t('common.operationSuccess')",
  'فشل العملية': "t('common.operationFailed')",
  
  // أرقام وكميات
  'عدد': "t('common.count')",
  'الكمية': "t('common.quantity')",
  'الإجمالي': "t('common.total')",
  'المجموع': "t('common.sum')",
  'المتوسط': "t('common.average')",
  'الحد الأدنى': "t('common.minimum')",
  'الحد الأقصى': "t('common.maximum')",
  
  // تواريخ ووقت
  'اليوم': "t('time.today')",
  'أمس': "t('time.yesterday')",
  'غداً': "t('time.tomorrow')",
  'هذا الأسبوع': "t('time.thisWeek')",
  'هذا الشهر': "t('time.thisMonth')",
  'هذه السنة': "t('time.thisYear')",
  'صباحاً': "t('time.am')",
  'مساءً': "t('time.pm')",
};

const bulkEnglishMappings = {
  // Common English texts
  'Loading...': "t('common.loading')",
  'Save': "t('common.save')",
  'Cancel': "t('common.cancel')",
  'Delete': "t('common.delete')",
  'Edit': "t('common.edit')",
  'Add': "t('common.add')",
  'Close': "t('common.close')",
  'Back': "t('common.back')",
  'Next': "t('common.next')",
  'Submit': "t('common.submit')",
  'Confirm': "t('common.confirm')",
  'Yes': "t('common.yes')",
  'No': "t('common.no')",
  'OK': "t('common.ok')",
  'Refresh': "t('common.refresh')",
  'View Details': "t('common.viewDetails')",
  
  // Status texts
  'Active': "t('status.active')",
  'Inactive': "t('status.inactive')",
  'Pending': "t('status.pending')",
  'Completed': "t('status.completed')",
  'In Progress': "t('status.inProgress')",
  'Failed': "t('status.failed')",
  'Success': "t('status.success')",
  'Available': "t('status.available')",
  'Busy': "t('status.busy')",
  'On Break': "t('status.onBreak')",
  
  // Priority texts
  'High': "t('priority.high')",
  'Medium': "t('priority.medium')",
  'Low': "t('priority.low')",
  'Urgent': "t('priority.urgent')",
  
  // Time texts
  'Today': "t('time.today')",
  'Yesterday': "t('time.yesterday')",
  'Tomorrow': "t('time.tomorrow')",
  'This Week': "t('time.thisWeek')",
  'This Month': "t('time.thisMonth')",
  'Days': "t('time.days')",
  'Date': "t('time.date')",
  
  // Actions
  'Start': "t('actions.start')",
  'Pause': "t('actions.pause')",
  'Complete': "t('actions.complete')",
  'Stop': "t('actions.stop')",
  'Resume': "t('actions.resume')",
};

console.log('Bulk translation mappings loaded:');
console.log('Arabic mappings:', Object.keys(bulkTranslationMappings).length);
console.log('English mappings:', Object.keys(bulkEnglishMappings).length);

export { bulkTranslationMappings, bulkEnglishMappings };