const fs = require('fs');

// قراءة الملف العربي
const content = fs.readFileSync('src/locales/ar.json', 'utf8');

console.log('🔍 البحث عن الخطأ في الملف...');
console.log('حجم الملف:', content.length, 'حرف');

try {
    JSON.parse(content);
    console.log('✅ الملف صحيح!');
} catch (error) {
    console.log('❌ خطأ:', error.message);
    
    const pos = parseInt(error.message.match(/position (\d+)/)?.[1]);
    if (pos) {
        console.log('\n🎯 الموضع الدقيق:', pos);
        console.log('\n📝 السياق (100 حرف قبل وبعد):');
        const start = Math.max(0, pos - 100);
        const end = Math.min(content.length, pos + 100);
        const context = content.substring(start, end);
        
        // طباعة السياق مع إبراز الموضع المشكوك فيه
        const lines = context.split('\n');
        lines.forEach((line, i) => {
            console.log(`${start + context.indexOf(line)}:`, line);
        });
        
        console.log('\n🔍 الحرف في الموضع المشكوك فيه:');
        console.log('حرف:', JSON.stringify(content.charAt(pos)));
        console.log('كود ASCII:', content.charCodeAt(pos));
        
        // البحث عن أقواس غير متطابقة
        let openBrackets = 0;
        let openBraces = 0;
        for (let i = 0; i < pos; i++) {
            if (content[i] === '{') openBraces++;
            if (content[i] === '}') openBraces--;
            if (content[i] === '[') openBrackets++;
            if (content[i] === ']') openBrackets--;
        }
        
        console.log('\n🔧 تحليل الأقواس:');
        console.log('أقواس مفتوحة {}:', openBraces);
        console.log('أقواس مفتوحة []:', openBrackets);
    }
}