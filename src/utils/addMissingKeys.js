import fs from 'fs';
import path from 'path';
import missingTranslationKeys from './missingTranslationKeys.js';

// دالة لإضافة المفاتيح المفقودة إلى ملفات الترجمة
function addMissingKeys() {
  const localesDir = path.join(process.cwd(), 'src/locales');
  
  // قراءة ملفات الترجمة الحالية
  const enFile = path.join(localesDir, 'en.json');
  const arFile = path.join(localesDir, 'ar.json');
  
  let enTranslations = {};
  let arTranslations = {};
  
  try {
    enTranslations = JSON.parse(fs.readFileSync(enFile, 'utf8'));
    arTranslations = JSON.parse(fs.readFileSync(arFile, 'utf8'));
  } catch (error) {
    console.error('Error reading translation files:', error);
    return;
  }
  
  // دالة مساعدة لإضافة مفاتيح متداخلة
  function addNestedKeys(target, source, lang) {
    Object.keys(source).forEach(key => {
      if (typeof source[key] === 'object' && !source[key][lang]) {
        // إذا كان الكائن يحتوي على مفاتيح فرعية
        if (!target[key]) {
          target[key] = {};
        }
        addNestedKeys(target[key], source[key], lang);
      } else if (source[key][lang]) {
        // إذا كان المفتاح يحتوي على ترجمة للغة المحددة
        target[key] = source[key][lang];
      }
    });
  }
  
  // إضافة المفاتيح المفقودة
  addNestedKeys(enTranslations, missingTranslationKeys, 'en');
  addNestedKeys(arTranslations, missingTranslationKeys, 'ar');
  
  // كتابة الملفات المحدثة
  try {
    fs.writeFileSync(enFile, JSON.stringify(enTranslations, null, 2), 'utf8');
    fs.writeFileSync(arFile, JSON.stringify(arTranslations, null, 2), 'utf8');
    
    console.log('✅ تم إضافة المفاتيح المفقودة بنجاح!');
    console.log('📄 تم تحديث ملف en.json');
    console.log('📄 تم تحديث ملف ar.json');
  } catch (error) {
    console.error('❌ خطأ في كتابة ملفات الترجمة:', error);
  }
}

// تشغيل الدالة إذا تم استدعاء الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  addMissingKeys();
}

export default addMissingKeys;