-- =====================================================
-- أوامر SQL مباشرة لقاعدة البيانات
-- Direct SQL Commands for Database Setup
-- =====================================================

-- 1️⃣ إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS `workshop_asdgdgh45` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2️⃣ استخدام قاعدة البيانات
USE `workshop_asdgdgh45`;

-- 3️⃣ التحقق من إنشاء قاعدة البيانات
SHOW DATABASES LIKE 'workshop_asdgdgh45';

-- 4️⃣ عرض معلومات قاعدة البيانات
SELECT 
    SCHEMA_NAME as 'Database Name',
    DEFAULT_CHARACTER_SET_NAME as 'Charset',
    DEFAULT_COLLATION_NAME as 'Collation'
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'workshop_asdgdgh45';

-- =====================================================
-- إنتهى - تم إنشاء قاعدة البيانات بنجاح
-- =====================================================
