# Fix Ecommerce & Navigation Translations - Workshop Management System
# Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Description: Fix ecommerce and navigation texts to be dynamic based on language

Write-Host "🔧 Fixing Ecommerce & Navigation Translations..." -ForegroundColor Green

# 1. Added Missing Translation Keys
Write-Host "✅ Added Missing Translation Keys:" -ForegroundColor Yellow

Write-Host "🛍️ Ecommerce Keys:" -ForegroundColor Cyan
Write-Host "   - ecommerce.storeName: 'Workshop Store' / 'متجر الورشة'" -ForegroundColor White
Write-Host "   - ecommerce.heroTitle: 'Custom fashion with premium quality' / 'أزياء مخصصة بجودة عالية'" -ForegroundColor White
Write-Host "   - ecommerce.heroDescription: 'Discover our exclusive collection of custom-made clothing and accessories' / 'اكتشف مجموعتنا الحصرية من الملابس والإكسسوارات المصنوعة حسب الطلب'" -ForegroundColor White
Write-Host "   - ecommerce.shopNow: 'Shop Now' / 'تسوق الآن'" -ForegroundColor White
Write-Host "   - ecommerce.featuredProducts: 'Featured Products' / 'المنتجات المميزة'" -ForegroundColor White
Write-Host "   - ecommerce.browseCategories: 'Browse Categories' / 'تصفح الفئات'" -ForegroundColor White
Write-Host "   - ecommerce.addToCart: 'Add to Cart' / 'إضافة للسلة'" -ForegroundColor White
Write-Host "   - ecommerce.outOfStock: 'Out of Stock' / 'نفذ من المخزون'" -ForegroundColor White
Write-Host "   - ecommerce.searchPlaceholder: 'Search products...' / 'البحث في المنتجات...'" -ForegroundColor White

Write-Host "🧭 Navigation Keys:" -ForegroundColor Cyan
Write-Host "   - navigation.home: 'Home' / 'الرئيسية'" -ForegroundColor White
Write-Host "   - navigation.products: 'Products' / 'المنتجات'" -ForegroundColor White
Write-Host "   - navigation.custom: 'Custom' / 'مخصص'" -ForegroundColor White
Write-Host "   - navigation.contact: 'Contact' / 'اتصل بنا'" -ForegroundColor White
Write-Host "   - navigation.about: 'About' / 'حول'" -ForegroundColor White

Write-Host "📂 Categories Keys:" -ForegroundColor Cyan
Write-Host "   - categories.menClothing: 'Men's Clothing' / 'ملابس رجالية'" -ForegroundColor White
Write-Host "   - categories.womenClothing: 'Women's Clothing' / 'ملابس نسائية'" -ForegroundColor White
Write-Host "   - categories.kidsClothing: 'Kids' Clothing' / 'ملابس أطفال'" -ForegroundColor White
Write-Host "   - categories.customDesign: 'Custom Design' / 'تصميم مخصص'" -ForegroundColor White

Write-Host "🦶 Footer Keys:" -ForegroundColor Cyan
Write-Host "   - footer.quickLinks: 'Quick Links' / 'روابط سريعة'" -ForegroundColor White
Write-Host "   - footer.customerService: 'Customer Service' / 'خدمة العملاء'" -ForegroundColor White
Write-Host "   - footer.returnPolicy: 'Return Policy' / 'سياسة الإرجاع'" -ForegroundColor White
Write-Host "   - footer.shipping: 'Shipping' / 'الشحن'" -ForegroundColor White
Write-Host "   - footer.faq: 'FAQ' / 'الأسئلة الشائعة'" -ForegroundColor White
Write-Host "   - footer.support: 'Support' / 'الدعم'" -ForegroundColor White
Write-Host "   - footer.contactUs: 'Contact Us' / 'اتصل بنا'" -ForegroundColor White
Write-Host "   - footer.phone: 'Phone: +965 1234 5678' / 'الهاتف: +965 1234 5678'" -ForegroundColor White
Write-Host "   - footer.email: 'Email: info@workshop.com' / 'البريد الإلكتروني: info@workshop.com'" -ForegroundColor White
Write-Host "   - footer.address: 'Address: Kuwait' / 'العنوان: الكويت'" -ForegroundColor White
Write-Host "   - footer.allRightsReserved: 'All rights reserved' / 'جميع الحقوق محفوظة'" -ForegroundColor White

# 2. Updated Component
Write-Host "✅ Updated Component:" -ForegroundColor Yellow
Write-Host "   - src/pages/ecommerce/HomePage.tsx" -ForegroundColor White
Write-Host "   - Replaced all hardcoded Arabic/English text with translation keys" -ForegroundColor White
Write-Host "   - Updated header, hero section, categories, and footer" -ForegroundColor White
Write-Host "   - Fixed linter errors by removing unused variables" -ForegroundColor White
Write-Host "   - Now supports both English and Arabic languages" -ForegroundColor White

# 3. Files Modified
Write-Host "📝 Files Modified:" -ForegroundColor Yellow
Write-Host "   - src/locales/en.json (added missing ecommerce, navigation, categories, footer keys)" -ForegroundColor White
Write-Host "   - src/locales/ar.json (added missing ecommerce, navigation, categories, footer keys)" -ForegroundColor White
Write-Host "   - src/pages/ecommerce/HomePage.tsx (updated to use translations)" -ForegroundColor White

# 4. Original Text Patterns
Write-Host "📋 Original Text Patterns:" -ForegroundColor Yellow
Write-Host "   - Workshop Store / متجر الورشة" -ForegroundColor White
Write-Host "   - Custom fashion with premium quality / أزياء مخصصة بجودة عالية" -ForegroundColor White
Write-Host "   - Quick Links / روابط سريعة" -ForegroundColor White
Write-Host "   - Customer Service / خدمة العملاء" -ForegroundColor White
Write-Host "   - Return Policy / سياسة الإرجاع" -ForegroundColor White
Write-Host "   - Shipping / الشحن" -ForegroundColor White
Write-Host "   - FAQ / الأسئلة الشائعة" -ForegroundColor White
Write-Host "   - Support / الدعم" -ForegroundColor White
Write-Host "   - Contact Us / اتصل بنا" -ForegroundColor White
Write-Host "   - Phone: +965 1234 5678 / الهاتف: +965 1234 5678" -ForegroundColor White
Write-Host "   - Email: info@workshop.com / البريد الإلكتروني: info@workshop.com" -ForegroundColor White
Write-Host "   - Address: Kuwait / العنوان: الكويت" -ForegroundColor White
Write-Host "   - All rights reserved / جميع الحقوق محفوظة" -ForegroundColor White

# 5. Translation Keys Now Available
Write-Host "🔑 Translation Keys Now Available:" -ForegroundColor Yellow
Write-Host "   - t('ecommerce.storeName') - Workshop Store / متجر الورشة" -ForegroundColor White
Write-Host "   - t('ecommerce.heroTitle') - Custom fashion with premium quality / أزياء مخصصة بجودة عالية" -ForegroundColor White
Write-Host "   - t('ecommerce.heroDescription') - Discover our exclusive collection... / اكتشف مجموعتنا الحصرية..." -ForegroundColor White
Write-Host "   - t('ecommerce.shopNow') - Shop Now / تسوق الآن" -ForegroundColor White
Write-Host "   - t('ecommerce.featuredProducts') - Featured Products / المنتجات المميزة" -ForegroundColor White
Write-Host "   - t('ecommerce.browseCategories') - Browse Categories / تصفح الفئات" -ForegroundColor White
Write-Host "   - t('navigation.home') - Home / الرئيسية" -ForegroundColor White
Write-Host "   - t('navigation.products') - Products / المنتجات" -ForegroundColor White
Write-Host "   - t('navigation.custom') - Custom / مخصص" -ForegroundColor White
Write-Host "   - t('navigation.contact') - Contact / اتصل بنا" -ForegroundColor White
Write-Host "   - t('navigation.about') - About / حول" -ForegroundColor White
Write-Host "   - t('categories.menClothing') - Men's Clothing / ملابس رجالية" -ForegroundColor White
Write-Host "   - t('categories.womenClothing') - Women's Clothing / ملابس نسائية" -ForegroundColor White
Write-Host "   - t('categories.kidsClothing') - Kids' Clothing / ملابس أطفال" -ForegroundColor White
Write-Host "   - t('categories.customDesign') - Custom Design / تصميم مخصص" -ForegroundColor White
Write-Host "   - t('footer.quickLinks') - Quick Links / روابط سريعة" -ForegroundColor White
Write-Host "   - t('footer.customerService') - Customer Service / خدمة العملاء" -ForegroundColor White
Write-Host "   - t('footer.returnPolicy') - Return Policy / سياسة الإرجاع" -ForegroundColor White
Write-Host "   - t('footer.shipping') - Shipping / الشحن" -ForegroundColor White
Write-Host "   - t('footer.faq') - FAQ / الأسئلة الشائعة" -ForegroundColor White
Write-Host "   - t('footer.support') - Support / الدعم" -ForegroundColor White
Write-Host "   - t('footer.contactUs') - Contact Us / اتصل بنا" -ForegroundColor White
Write-Host "   - t('footer.phone') - Phone: +965 1234 5678 / الهاتف: +965 1234 5678" -ForegroundColor White
Write-Host "   - t('footer.email') - Email: info@workshop.com / البريد الإلكتروني: info@workshop.com" -ForegroundColor White
Write-Host "   - t('footer.address') - Address: Kuwait / العنوان: الكويت" -ForegroundColor White
Write-Host "   - t('footer.allRightsReserved') - All rights reserved / جميع الحقوق محفوظة" -ForegroundColor White

# 6. Currency Format
Write-Host "💰 Currency Format:" -ForegroundColor Yellow
Write-Host "   - All monetary values use t('common.currency') which returns 'KWD' / 'د.ك'" -ForegroundColor White
Write-Host "   - Format: {amount} {t('common.currency')}" -ForegroundColor White
Write-Host "   - Example: 1500 KWD / 1500 د.ك" -ForegroundColor White

Write-Host "`n🎉 Ecommerce & Navigation translations have been fixed!" -ForegroundColor Green
Write-Host "   All texts now dynamically change based on the selected language." -ForegroundColor White
Write-Host "   The ecommerce homepage now fully supports both English and Arabic." -ForegroundColor White 