const fs = require('fs');

try {
    // قراءة الملف
    const content = fs.readFileSync('src/locales/en.json', 'utf8');
    
    // محاولة parse JSON
    const jsonData = JSON.parse(content);
    
    // إعادة كتابة الملف بتنسيق صحيح
    fs.writeFileSync('src/locales/en.json', JSON.stringify(jsonData, null, 2), 'utf8');
    
    console.log('✅ JSON file fixed successfully!');
} catch (error) {
    console.log('❌ Error:', error.message);
    
    // إذا فشل الـ parse، نحاول إصلاح المشكلة يدوياً
    const content = fs.readFileSync('src/locales/en.json', 'utf8');
    
    // البحث عن مشاكل شائعة
    let fixed = content;
    
    // إزالة الفواصل الإضافية قبل الأقواس المغلقة
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    
    // إزالة الفواصل المزدوجة
    fixed = fixed.replace(/,,/g, ',');
    
    // إزالة المسافات الإضافية
    fixed = fixed.replace(/\s+/g, ' ');
    
    try {
        // محاولة parse مرة أخرى
        const jsonData = JSON.parse(fixed);
        fs.writeFileSync('src/locales/en.json', JSON.stringify(jsonData, null, 2), 'utf8');
        console.log('✅ JSON file fixed after cleanup!');
    } catch (finalError) {
        console.log('❌ Still failed:', finalError.message);
        
        // طباعة السياق حول الخطأ
        const pos = parseInt(finalError.message.match(/position (\d+)/)?.[1]);
        if (pos) {
            console.log('Context around error:', fixed.substring(pos-50, pos+50));
        }
    }
}