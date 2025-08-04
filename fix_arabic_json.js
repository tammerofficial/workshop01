const fs = require('fs');

// قراءة الملف العربي
let content = fs.readFileSync('src/locales/ar.json', 'utf8');

// إزالة المحتوى المكرر والتأكد من البنية الصحيحة
console.log('🔧 إصلاح ملف ar.json...');

try {
    // محاولة parse أولى
    const data = JSON.parse(content);
    console.log('✅ الملف صحيح بالفعل');
} catch (error) {
    console.log('❌ خطأ موجود، سأحاول الإصلاح...');
    
    // إصلاحات شائعة
    content = content
        // إزالة الفواصل الإضافية قبل الأقواس المغلقة
        .replace(/,(\s*[}\]])/g, '$1')
        // إزالة الفواصل المزدوجة
        .replace(/,,/g, ',')
        // إصلاح النهايات المكسورة
        .replace(/}\s*}\s*,\s*}/g, '}')
        .replace(/}\s*}\s*}/g, '}');
    
    try {
        // محاولة parse مرة أخرى
        const data = JSON.parse(content);
        
        // كتابة الملف المُصحح
        fs.writeFileSync('src/locales/ar.json', JSON.stringify(data, null, 2), 'utf8');
        console.log('✅ تم إصلاح الملف بنجاح!');
        
    } catch (finalError) {
        console.log('❌ فشل الإصلاح:', finalError.message);
        
        // البحث عن الموضع الدقيق للخطأ
        const pos = parseInt(finalError.message.match(/position (\d+)/)?.[1]);
        if (pos) {
            console.log('🔍 السياق حول الخطأ:');
            console.log(content.substring(pos-100, pos+100));
        }
    }
}