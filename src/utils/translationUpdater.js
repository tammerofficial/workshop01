// معالج تحديث الترجمات التلقائي
// يقوم بتحويل النصوص الثابتة الشائعة إلى مفاتيح ترجمة

const commonTranslations = {
  // النصوص الإنجليزية الشائعة
  'Loading...': "t('common.loading')",
  'Search...': "t('common.search')",
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
  
  // النصوص العربية الشائعة
  'جاري التحميل...': "t('common.loading')",
  'بحث...': "t('common.search')",
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
  
  // نصوص خاصة بالتجارة الإلكترونية
  'Add to Cart': "t('ecommerce.addToCart')",
  'أضف للسلة': "t('ecommerce.addToCart')",
  'Out of Stock': "t('ecommerce.outOfStock')",
  'غير متوفر': "t('ecommerce.outOfStock')",
  'Shop Now': "t('ecommerce.shopNow')",
  'تسوق الآن': "t('ecommerce.shopNow')",
  'Product Details': "t('ecommerce.productDetails')",
  'تفاصيل المنتج': "t('ecommerce.productDetails')",
  'Customer Reviews': "t('ecommerce.customerReviews')",
  'آراء العملاء': "t('ecommerce.customerReviews')",
  'Write a Review': "t('ecommerce.writeReview')",
  'اكتب تقييماً': "t('ecommerce.writeReview')",
  
  // نصوص التنقل
  'Home': "t('navigation.home')",
  'الرئيسية': "t('navigation.home')",
  'Products': "t('navigation.products')",
  'المنتجات': "t('navigation.products')",
  'Contact': "t('navigation.contact')",
  'اتصل بنا': "t('navigation.contact')",
  'About': "t('navigation.about')",
  'من نحن': "t('navigation.about')",
  
  // نصوص النماذج
  'Name': "t('form.name')",
  'الاسم': "t('form.name')",
  'Email': "t('form.email')",
  'البريد الإلكتروني': "t('form.email')",
  'Phone': "t('form.phone')",
  'الهاتف': "t('form.phone')",
  'Address': "t('form.address')",
  'العنوان': "t('form.address')",
  'Message': "t('form.message')",
  'الرسالة': "t('form.message')",
  'Required': "t('form.required')",
  'مطلوب': "t('form.required')",
  
  // نصوص الوقت والتاريخ
  'Today': "t('time.today')",
  'اليوم': "t('time.today')",
  'Yesterday': "t('time.yesterday')",
  'أمس': "t('time.yesterday')",
  'Tomorrow': "t('time.tomorrow')",
  'غداً': "t('time.tomorrow')",
  'This Week': "t('time.thisWeek')",
  'هذا الأسبوع': "t('time.thisWeek')",
  'This Month': "t('time.thisMonth')",
  'هذا الشهر': "t('time.thisMonth')",
  
  // نصوص الحالة
  'Active': "t('status.active')",
  'نشط': "t('status.active')",
  'Inactive': "t('status.inactive')",
  'غير نشط': "t('status.inactive')",
  'Pending': "t('status.pending')",
  'معلق': "t('status.pending')",
  'Completed': "t('status.completed')",
  'مكتمل': "t('status.completed')",
  'In Progress': "t('status.inProgress')",
  'قيد التنفيذ': "t('status.inProgress')",
  'Failed': "t('status.failed')",
  'فشل': "t('status.failed')",
  'Success': "t('status.success')",
  'نجح': "t('status.success')",
  
  // عبارات conditional شائعة
  "{isRTL ? 'نعم' : 'Yes'}": "t('common.yes')",
  "{isRTL ? 'لا' : 'No'}": "t('common.no')",
  "{isRTL ? 'حفظ' : 'Save'}": "t('common.save')",
  "{isRTL ? 'إلغاء' : 'Cancel'}": "t('common.cancel')",
  "{isRTL ? 'حذف' : 'Delete'}": "t('common.delete')",
  "{isRTL ? 'تعديل' : 'Edit'}": "t('common.edit')",
  "{isRTL ? 'إضافة' : 'Add'}": "t('common.add')",
  "{isRTL ? 'إغلاق' : 'Close'}": "t('common.close')",
  "{isRTL ? 'رجوع' : 'Back'}": "t('common.back')",
  "{isRTL ? 'التالي' : 'Next'}": "t('common.next')",
  "{isRTL ? 'إرسال' : 'Submit'}": "t('common.submit')",
  "{isRTL ? 'تأكيد' : 'Confirm'}": "t('common.confirm')",
  
  // عبارات العملة
  "{isRTL ? 'د.ك' : 'KWD'}": "t('common.currency')",
  "isRTL ? 'د.ك' : 'KWD'": "t('common.currency')",
  
  // عبارات الحمولة
  "{isRTL ? 'جاري التحميل...' : 'Loading...'}": "t('common.loading')",
  
  // عبارات البحث
  "{isRTL ? 'ابحث عن المنتجات...' : 'Search products...'}": "t('ecommerce.searchPlaceholder')",
  "{isRTL ? 'ابحث...' : 'Search...'}": "t('common.searchPlaceholder')",
  
  // عبارات التسوق
  "{isRTL ? 'أضف للسلة' : 'Add to Cart'}": "t('ecommerce.addToCart')",
  "{isRTL ? 'غير متوفر' : 'Out of Stock'}": "t('ecommerce.outOfStock')",
  "{isRTL ? 'تسوق الآن' : 'Shop Now'}": "t('ecommerce.shopNow')",
  "{isRTL ? 'المنتجات المميزة' : 'Featured Products'}": "t('ecommerce.featuredProducts')",
  "{isRTL ? 'تصفح الفئات' : 'Browse Categories'}": "t('ecommerce.browseCategories')",
  
  // عبارات التنقل
  "{isRTL ? 'الرئيسية' : 'Home'}": "t('navigation.home')",
  "{isRTL ? 'المنتجات' : 'Products'}": "t('navigation.products')",
  "{isRTL ? 'التخصيص' : 'Custom'}": "t('navigation.custom')",
  "{isRTL ? 'اتصل بنا' : 'Contact'}": "t('navigation.contact')",
};

console.log('Translation mappings loaded:', Object.keys(commonTranslations).length, 'entries');