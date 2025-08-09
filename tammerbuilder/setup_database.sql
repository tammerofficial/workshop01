-- =====================================================
-- نظام إدارة الورشة الكامل - مخطط قاعدة البيانات
-- Workshop Management System - Complete Database Schema
-- تاريخ الإنشاء: 2025-01-15
-- إصدار: v23
-- =====================================================

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS `workshop01` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `workshop01`;

-- =====================================================
-- جداول النظام الأساسية - Core System Tables
-- =====================================================

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS `users` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL UNIQUE,
    `email_verified_at` timestamp NULL DEFAULT NULL,
    `password` varchar(255) NOT NULL,
    `remember_token` varchar(100) DEFAULT NULL,
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    `role_id` bigint(20) unsigned DEFAULT NULL,
    `boutique_id` bigint(20) unsigned DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول إعادة تعيين كلمات المرور
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
    `email` varchar(255) NOT NULL,
    `token` varchar(255) NOT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الجلسات
CREATE TABLE IF NOT EXISTS `sessions` (
    `id` varchar(255) NOT NULL,
    `user_id` bigint(20) unsigned DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text,
    `payload` longtext NOT NULL,
    `last_activity` int(11) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `sessions_user_id_index` (`user_id`),
    KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول التخزين المؤقت
CREATE TABLE IF NOT EXISTS `cache` (
    `key` varchar(255) NOT NULL,
    `value` mediumtext NOT NULL,
    `expiration` int(11) NOT NULL,
    PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cache_locks` (
    `key` varchar(255) NOT NULL,
    `owner` varchar(255) NOT NULL,
    `expiration` int(11) NOT NULL,
    PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المهام المؤجلة
CREATE TABLE IF NOT EXISTS `jobs` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `queue` varchar(255) NOT NULL,
    `payload` longtext NOT NULL,
    `attempts` tinyint(3) unsigned NOT NULL,
    `reserved_at` int(10) unsigned DEFAULT NULL,
    `available_at` int(10) unsigned NOT NULL,
    `created_at` int(10) unsigned NOT NULL,
    PRIMARY KEY (`id`),
    KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `job_batches` (
    `id` varchar(255) NOT NULL,
    `name` varchar(255) NOT NULL,
    `total_jobs` int(11) NOT NULL,
    `pending_jobs` int(11) NOT NULL,
    `failed_jobs` int(11) NOT NULL,
    `failed_job_ids` longtext NOT NULL,
    `options` mediumtext,
    `cancelled_at` int(11) DEFAULT NULL,
    `created_at` int(11) NOT NULL,
    `finished_at` int(11) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `failed_jobs` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(255) NOT NULL,
    `connection` text NOT NULL,
    `queue` text NOT NULL,
    `payload` longtext NOT NULL,
    `exception` longtext NOT NULL,
    `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- نظام الصلاحيات - Permission System
-- =====================================================

-- جدول الصلاحيات
CREATE TABLE IF NOT EXISTS `permissions` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `guard_name` varchar(255) NOT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `permissions_name_guard_name_unique` (`name`, `guard_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الأدوار
CREATE TABLE IF NOT EXISTS `roles` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `guard_name` varchar(255) NOT NULL,
    `hierarchy_level` int(11) NOT NULL DEFAULT 0,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `roles_name_guard_name_unique` (`name`, `guard_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول ربط النماذج بالصلاحيات
CREATE TABLE IF NOT EXISTS `model_has_permissions` (
    `permission_id` bigint(20) unsigned NOT NULL,
    `model_type` varchar(255) NOT NULL,
    `model_id` bigint(20) unsigned NOT NULL,
    PRIMARY KEY (`permission_id`, `model_id`, `model_type`),
    KEY `model_has_permissions_model_id_model_type_index` (`model_id`, `model_type`),
    CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول ربط النماذج بالأدوار
CREATE TABLE IF NOT EXISTS `model_has_roles` (
    `role_id` bigint(20) unsigned NOT NULL,
    `model_type` varchar(255) NOT NULL,
    `model_id` bigint(20) unsigned NOT NULL,
    PRIMARY KEY (`role_id`, `model_id`, `model_type`),
    KEY `model_has_roles_model_id_model_type_index` (`model_id`, `model_type`),
    CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول ربط الأدوار بالصلاحيات
CREATE TABLE IF NOT EXISTS `role_has_permissions` (
    `permission_id` bigint(20) unsigned NOT NULL,
    `role_id` bigint(20) unsigned NOT NULL,
    PRIMARY KEY (`permission_id`, `role_id`),
    CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
    CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الرموز المميزة للوصول الشخصي
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `tokenable_type` varchar(255) NOT NULL,
    `tokenable_id` bigint(20) unsigned NOT NULL,
    `name` varchar(255) NOT NULL,
    `token` varchar(64) NOT NULL,
    `abilities` text,
    `last_used_at` timestamp NULL DEFAULT NULL,
    `expires_at` timestamp NULL DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
    KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- إدارة العملاء والفئات - Client & Category Management
-- =====================================================

-- جدول الفئات
CREATE TABLE IF NOT EXISTS `categories` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `description` text,
    `parent_id` bigint(20) unsigned DEFAULT NULL,
    `image_url` varchar(255) DEFAULT NULL,
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    `woocommerce_id` bigint(20) unsigned DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `categories_parent_id_foreign` (`parent_id`),
    CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول العملاء
CREATE TABLE IF NOT EXISTS `clients` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `email` varchar(255) DEFAULT NULL,
    `phone` varchar(255) DEFAULT NULL,
    `address` text,
    `notes` text,
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    `loyalty_points` int(11) NOT NULL DEFAULT 0,
    `loyalty_tier` varchar(255) NOT NULL DEFAULT 'bronze',
    `total_spent` decimal(10,3) NOT NULL DEFAULT 0.000,
    `last_purchase_date` date DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- إدارة العمال - Workers Management  
-- =====================================================

-- جدول العمال
CREATE TABLE IF NOT EXISTS `workers` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `email` varchar(255) DEFAULT NULL,
    `phone` varchar(255) DEFAULT NULL,
    `employee_code` varchar(255) NOT NULL UNIQUE,
    `department` varchar(255) NOT NULL,
    `position` varchar(255) NOT NULL,
    `speciality` varchar(255) DEFAULT NULL,
    `experience_years` int(11) NOT NULL DEFAULT 0,
    `hourly_rate` decimal(8,3) NOT NULL DEFAULT 0.000,
    `efficiency_rating` int(11) NOT NULL DEFAULT 0,
    `quality_score` int(11) NOT NULL DEFAULT 0,
    `status` varchar(255) NOT NULL DEFAULT 'active',
    `hire_date` date DEFAULT NULL,
    `user_id` bigint(20) unsigned DEFAULT NULL,
    `biometric_template` text,
    `fingerprint_data` text,
    `face_recognition_data` text,
    `monthly_salary_kwd` decimal(8,3) DEFAULT NULL,
    `overtime_rate_kwd` decimal(8,3) DEFAULT NULL,
    `bonus_kwd` decimal(8,3) DEFAULT NULL,
    `deductions_kwd` decimal(8,3) DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `workers_employee_code_unique` (`employee_code`),
    KEY `workers_user_id_foreign` (`user_id`),
    CONSTRAINT `workers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- إدارة المواد والمخزون - Materials & Inventory
-- =====================================================

-- جدول المواد
CREATE TABLE IF NOT EXISTS `materials` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `category` varchar(255) NOT NULL,
    `unit` varchar(255) NOT NULL,
    `cost_per_unit` decimal(8,3) NOT NULL,
    `stock_quantity` int(11) NOT NULL DEFAULT 0,
    `reserved_quantity` int(11) NOT NULL DEFAULT 0,
    `minimum_stock` int(11) NOT NULL DEFAULT 10,
    `supplier` varchar(255) DEFAULT NULL,
    `description` text,
    `type` varchar(255) NOT NULL DEFAULT 'raw_material',
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول معاملات المواد
CREATE TABLE IF NOT EXISTS `material_transactions` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `material_id` bigint(20) unsigned NOT NULL,
    `transaction_type` varchar(255) NOT NULL,
    `quantity` int(11) NOT NULL,
    `unit_cost` decimal(8,3) NOT NULL,
    `total_cost` decimal(10,3) NOT NULL,
    `reference_type` varchar(255) DEFAULT NULL,
    `reference_id` bigint(20) unsigned DEFAULT NULL,
    `notes` text,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `material_transactions_material_id_foreign` (`material_id`),
    CONSTRAINT `material_transactions_material_id_foreign` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- إدارة الطلبات - Orders Management
-- =====================================================

-- جدول الطلبات
CREATE TABLE IF NOT EXISTS `orders` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `order_number` varchar(255) NOT NULL UNIQUE,
    `client_id` bigint(20) unsigned DEFAULT NULL,
    `client_name` varchar(255) NOT NULL,
    `item_type` varchar(255) NOT NULL,
    `description` text NOT NULL,
    `fabric` varchar(255) DEFAULT NULL,
    `color` varchar(255) DEFAULT NULL,
    `size` varchar(255) DEFAULT NULL,
    `quantity` int(11) NOT NULL DEFAULT 1,
    `price` decimal(10,3) NOT NULL,
    `total_amount` decimal(10,3) NOT NULL,
    `deposit_amount` decimal(10,3) DEFAULT NULL,
    `currency` varchar(255) NOT NULL DEFAULT 'KWD',
    `status` varchar(255) NOT NULL DEFAULT 'pending',
    `priority` varchar(255) NOT NULL DEFAULT 'medium',
    `delivery_date` date DEFAULT NULL,
    `special_requests` text,
    `progress_percentage` int(11) NOT NULL DEFAULT 0,
    `type` varchar(255) NOT NULL DEFAULT 'custom',
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `orders_order_number_unique` (`order_number`),
    KEY `orders_client_id_foreign` (`client_id`),
    CONSTRAINT `orders_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول مواد الطلبات
CREATE TABLE IF NOT EXISTS `order_materials` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `order_id` bigint(20) unsigned NOT NULL,
    `material_id` bigint(20) unsigned NOT NULL,
    `quantity_needed` int(11) NOT NULL,
    `quantity_used` int(11) NOT NULL DEFAULT 0,
    `cost_per_unit` decimal(8,3) NOT NULL,
    `total_cost` decimal(10,3) NOT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `order_materials_order_id_foreign` (`order_id`),
    KEY `order_materials_material_id_foreign` (`material_id`),
    CONSTRAINT `order_materials_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `order_materials_material_id_foreign` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- نظام الإنتاج - Production System
-- =====================================================

-- جدول مراحل الإنتاج
CREATE TABLE IF NOT EXISTS `production_stages` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `description` text,
    `sequence_order` int(11) NOT NULL,
    `estimated_duration_minutes` int(11) NOT NULL DEFAULT 0,
    `required_skills` json DEFAULT NULL,
    `quality_checkpoints` json DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول محطات العمل
CREATE TABLE IF NOT EXISTS `stations` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `type` varchar(255) NOT NULL,
    `location` varchar(255) DEFAULT NULL,
    `capacity` int(11) NOT NULL DEFAULT 1,
    `status` varchar(255) NOT NULL DEFAULT 'active',
    `equipment_details` json DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تتبع إنتاج الطلبات
CREATE TABLE IF NOT EXISTS `order_production_tracking` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `order_id` bigint(20) unsigned NOT NULL,
    `stage_id` bigint(20) unsigned NOT NULL,
    `worker_id` bigint(20) unsigned DEFAULT NULL,
    `station_id` bigint(20) unsigned DEFAULT NULL,
    `status` varchar(255) NOT NULL DEFAULT 'pending',
    `start_time` timestamp NULL DEFAULT NULL,
    `end_time` timestamp NULL DEFAULT NULL,
    `actual_duration_minutes` int(11) DEFAULT NULL,
    `estimated_minutes` int(11) DEFAULT NULL,
    `quality_score` int(11) DEFAULT NULL,
    `notes` text,
    `defects_found` int(11) NOT NULL DEFAULT 0,
    `rework_required` tinyint(1) NOT NULL DEFAULT 0,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `order_production_tracking_order_id_foreign` (`order_id`),
    KEY `order_production_tracking_stage_id_foreign` (`stage_id`),
    KEY `order_production_tracking_worker_id_foreign` (`worker_id`),
    KEY `order_production_tracking_station_id_foreign` (`station_id`),
    CONSTRAINT `order_production_tracking_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `order_production_tracking_stage_id_foreign` FOREIGN KEY (`stage_id`) REFERENCES `production_stages` (`id`) ON DELETE CASCADE,
    CONSTRAINT `order_production_tracking_worker_id_foreign` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE SET NULL,
    CONSTRAINT `order_production_tracking_station_id_foreign` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- نظام الحضور والغياب - Attendance System
-- =====================================================

-- جدول الحضور
CREATE TABLE IF NOT EXISTS `attendance` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `worker_id` bigint(20) unsigned NOT NULL,
    `worker_code` varchar(255) NOT NULL,
    `date` date NOT NULL,
    `check_in` timestamp NULL DEFAULT NULL,
    `check_out` timestamp NULL DEFAULT NULL,
    `break_start` timestamp NULL DEFAULT NULL,
    `break_end` timestamp NULL DEFAULT NULL,
    `hours_worked` int(11) NOT NULL DEFAULT 0,
    `status` varchar(255) NOT NULL DEFAULT 'present',
    `overtime_hours` int(11) NOT NULL DEFAULT 0,
    `notes` text,
    `biometric_check_in` text,
    `biometric_check_out` text,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `attendance_worker_id_foreign` (`worker_id`),
    CONSTRAINT `attendance_worker_id_foreign` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول كشوف المرتبات
CREATE TABLE IF NOT EXISTS `payroll` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `worker_id` bigint(20) unsigned NOT NULL,
    `month` int(11) NOT NULL,
    `year` int(11) NOT NULL,
    `basic_salary` decimal(10,3) NOT NULL,
    `overtime_amount` decimal(10,3) NOT NULL DEFAULT 0.000,
    `bonus` decimal(10,3) NOT NULL DEFAULT 0.000,
    `deductions` decimal(10,3) NOT NULL DEFAULT 0.000,
    `net_salary` decimal(10,3) NOT NULL,
    `payment_date` date DEFAULT NULL,
    `status` varchar(255) NOT NULL DEFAULT 'pending',
    `notes` text,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `payroll_worker_id_foreign` (`worker_id`),
    CONSTRAINT `payroll_worker_id_foreign` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- نظام البوتيك - Boutique System
-- =====================================================

-- جدول البوتيكات
CREATE TABLE IF NOT EXISTS `boutiques` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `location` varchar(255) NOT NULL,
    `manager_id` bigint(20) unsigned DEFAULT NULL,
    `phone` varchar(255) DEFAULT NULL,
    `email` varchar(255) DEFAULT NULL,
    `address` text,
    `status` varchar(255) NOT NULL DEFAULT 'active',
    `settings` json DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `boutiques_manager_id_foreign` (`manager_id`),
    CONSTRAINT `boutiques_manager_id_foreign` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول مبيعات البوتيك
CREATE TABLE IF NOT EXISTS `boutique_sales` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `boutique_id` bigint(20) unsigned NOT NULL,
    `sale_number` varchar(255) NOT NULL UNIQUE,
    `customer_name` varchar(255) DEFAULT NULL,
    `customer_phone` varchar(255) DEFAULT NULL,
    `items` json NOT NULL,
    `total_amount` decimal(10,3) NOT NULL,
    `discount_amount` decimal(10,3) NOT NULL DEFAULT 0.000,
    `tax_amount` decimal(10,3) NOT NULL DEFAULT 0.000,
    `final_amount` decimal(10,3) NOT NULL,
    `payment_method` varchar(255) NOT NULL,
    `payment_status` varchar(255) NOT NULL DEFAULT 'pending',
    `served_by` bigint(20) unsigned DEFAULT NULL,
    `notes` text,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `boutique_sales_sale_number_unique` (`sale_number`),
    KEY `boutique_sales_boutique_id_foreign` (`boutique_id`),
    KEY `boutique_sales_served_by_foreign` (`served_by`),
    CONSTRAINT `boutique_sales_boutique_id_foreign` FOREIGN KEY (`boutique_id`) REFERENCES `boutiques` (`id`) ON DELETE CASCADE,
    CONSTRAINT `boutique_sales_served_by_foreign` FOREIGN KEY (`served_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول معاملات نقاط البيع
CREATE TABLE IF NOT EXISTS `pos_transactions` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `boutique_id` bigint(20) unsigned NOT NULL,
    `transaction_number` varchar(255) NOT NULL UNIQUE,
    `type` varchar(255) NOT NULL,
    `amount` decimal(10,3) NOT NULL,
    `payment_method` varchar(255) NOT NULL,
    `reference_type` varchar(255) DEFAULT NULL,
    `reference_id` bigint(20) unsigned DEFAULT NULL,
    `processed_by` bigint(20) unsigned DEFAULT NULL,
    `status` varchar(255) NOT NULL DEFAULT 'completed',
    `notes` text,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `pos_transactions_transaction_number_unique` (`transaction_number`),
    KEY `pos_transactions_boutique_id_foreign` (`boutique_id`),
    KEY `pos_transactions_processed_by_foreign` (`processed_by`),
    CONSTRAINT `pos_transactions_boutique_id_foreign` FOREIGN KEY (`boutique_id`) REFERENCES `boutiques` (`id`) ON DELETE CASCADE,
    CONSTRAINT `pos_transactions_processed_by_foreign` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- نظام الولاء - Loyalty System
-- =====================================================

-- جدول عملاء الولاء
CREATE TABLE IF NOT EXISTS `loyalty_customers` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `customer_id` varchar(255) NOT NULL UNIQUE,
    `name` varchar(255) NOT NULL,
    `email` varchar(255) DEFAULT NULL,
    `phone` varchar(255) NOT NULL,
    `total_points` int(11) NOT NULL DEFAULT 0,
    `current_tier` varchar(255) NOT NULL DEFAULT 'bronze',
    `total_spent` decimal(10,3) NOT NULL DEFAULT 0.000,
    `join_date` date NOT NULL,
    `last_activity` date DEFAULT NULL,
    `status` varchar(255) NOT NULL DEFAULT 'active',
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `loyalty_customers_customer_id_unique` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول معاملات الولاء
CREATE TABLE IF NOT EXISTS `loyalty_transactions` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `customer_id` bigint(20) unsigned NOT NULL,
    `type` varchar(255) NOT NULL,
    `points` int(11) NOT NULL,
    `amount` decimal(10,3) DEFAULT NULL,
    `reference_type` varchar(255) DEFAULT NULL,
    `reference_id` varchar(255) DEFAULT NULL,
    `description` text,
    `processed_by` bigint(20) unsigned DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `loyalty_transactions_customer_id_foreign` (`customer_id`),
    KEY `loyalty_transactions_processed_by_foreign` (`processed_by`),
    CONSTRAINT `loyalty_transactions_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `loyalty_customers` (`id`) ON DELETE CASCADE,
    CONSTRAINT `loyalty_transactions_processed_by_foreign` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- النظام المطور للإنتاج - Advanced Production System
-- =====================================================

-- جدول مراحل سير العمل
CREATE TABLE IF NOT EXISTS `workflow_stages` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `description` text,
    `sequence_order` int(11) NOT NULL,
    `estimated_minutes` int(11) NOT NULL DEFAULT 0,
    `required_skills` json DEFAULT NULL,
    `quality_checkpoints` json DEFAULT NULL,
    `is_quality_gate` tinyint(1) NOT NULL DEFAULT 0,
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تعيين العمال للمراحل
CREATE TABLE IF NOT EXISTS `worker_stage_assignments` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `worker_id` bigint(20) unsigned NOT NULL,
    `stage_id` bigint(20) unsigned NOT NULL,
    `proficiency_level` int(11) NOT NULL DEFAULT 1,
    `is_primary` tinyint(1) NOT NULL DEFAULT 0,
    `assigned_date` date NOT NULL,
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `worker_stage_assignments_worker_id_foreign` (`worker_id`),
    KEY `worker_stage_assignments_stage_id_foreign` (`stage_id`),
    CONSTRAINT `worker_stage_assignments_worker_id_foreign` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE,
    CONSTRAINT `worker_stage_assignments_stage_id_foreign` FOREIGN KEY (`stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تقدم سير عمل الطلبات
CREATE TABLE IF NOT EXISTS `order_workflow_progress` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `order_id` bigint(20) unsigned NOT NULL,
    `stage_id` bigint(20) unsigned NOT NULL,
    `worker_id` bigint(20) unsigned DEFAULT NULL,
    `status` varchar(255) NOT NULL DEFAULT 'pending',
    `started_at` timestamp NULL DEFAULT NULL,
    `completed_at` timestamp NULL DEFAULT NULL,
    `estimated_minutes` int(11) DEFAULT NULL,
    `actual_minutes` int(11) DEFAULT NULL,
    `quality_score` int(11) DEFAULT NULL,
    `notes` text,
    `issues_found` json DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `order_workflow_progress_order_id_foreign` (`order_id`),
    KEY `order_workflow_progress_stage_id_foreign` (`stage_id`),
    KEY `order_workflow_progress_worker_id_foreign` (`worker_id`),
    CONSTRAINT `order_workflow_progress_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `order_workflow_progress_stage_id_foreign` FOREIGN KEY (`stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE CASCADE,
    CONSTRAINT `order_workflow_progress_worker_id_foreign` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول انتقالات المراحل
CREATE TABLE IF NOT EXISTS `stage_transitions` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `order_id` bigint(20) unsigned NOT NULL,
    `from_stage_id` bigint(20) unsigned DEFAULT NULL,
    `to_stage_id` bigint(20) unsigned NOT NULL,
    `worker_id` bigint(20) unsigned DEFAULT NULL,
    `transition_type` varchar(255) NOT NULL DEFAULT 'forward',
    `reason` text,
    `automated` tinyint(1) NOT NULL DEFAULT 0,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `stage_transitions_order_id_foreign` (`order_id`),
    KEY `stage_transitions_from_stage_id_foreign` (`from_stage_id`),
    KEY `stage_transitions_to_stage_id_foreign` (`to_stage_id`),
    KEY `stage_transitions_worker_id_foreign` (`worker_id`),
    CONSTRAINT `stage_transitions_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `stage_transitions_from_stage_id_foreign` FOREIGN KEY (`from_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL,
    CONSTRAINT `stage_transitions_to_stage_id_foreign` FOREIGN KEY (`to_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE CASCADE,
    CONSTRAINT `stage_transitions_worker_id_foreign` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- مقاييس الأداء - Performance Metrics
-- =====================================================

-- جدول مقاييس أداء العمال
CREATE TABLE IF NOT EXISTS `worker_performance_metrics` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `worker_id` bigint(20) unsigned NOT NULL,
    `date` date NOT NULL,
    `orders_completed` int(11) NOT NULL DEFAULT 0,
    `average_quality_score` decimal(5,2) DEFAULT NULL,
    `total_work_minutes` int(11) NOT NULL DEFAULT 0,
    `efficiency_rating` decimal(5,2) DEFAULT NULL,
    `defects_count` int(11) NOT NULL DEFAULT 0,
    `rework_count` int(11) NOT NULL DEFAULT 0,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `worker_performance_metrics_worker_id_date_unique` (`worker_id`, `date`),
    KEY `worker_performance_metrics_worker_id_foreign` (`worker_id`),
    CONSTRAINT `worker_performance_metrics_worker_id_foreign` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول ملخصات الأداء اليومي
CREATE TABLE IF NOT EXISTS `daily_performance_summaries` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `date` date NOT NULL,
    `total_orders_processed` int(11) NOT NULL DEFAULT 0,
    `total_orders_completed` int(11) NOT NULL DEFAULT 0,
    `average_completion_time` int(11) DEFAULT NULL,
    `overall_quality_score` decimal(5,2) DEFAULT NULL,
    `total_defects` int(11) NOT NULL DEFAULT 0,
    `worker_utilization` decimal(5,2) DEFAULT NULL,
    `revenue_generated` decimal(10,3) NOT NULL DEFAULT 0.000,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `daily_performance_summaries_date_unique` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- نظام الإشعارات - Notifications System
-- =====================================================

-- جدول الإشعارات الفورية
CREATE TABLE IF NOT EXISTS `real_time_notifications` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `type` varchar(255) NOT NULL,
    `title` varchar(255) NOT NULL,
    `message` text NOT NULL,
    `data` json DEFAULT NULL,
    `user_id` bigint(20) unsigned DEFAULT NULL,
    `department` varchar(255) DEFAULT NULL,
    `priority` varchar(255) NOT NULL DEFAULT 'medium',
    `is_read` tinyint(1) NOT NULL DEFAULT 0,
    `read_at` timestamp NULL DEFAULT NULL,
    `expires_at` timestamp NULL DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `real_time_notifications_user_id_foreign` (`user_id`),
    CONSTRAINT `real_time_notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- نظام النشاط والأمان - Activity & Security System
-- =====================================================

-- جدول سجلات النشاط
CREATE TABLE IF NOT EXISTS `activity_logs` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `log_name` varchar(255) DEFAULT NULL,
    `description` text NOT NULL,
    `subject_type` varchar(255) DEFAULT NULL,
    `event` varchar(255) DEFAULT NULL,
    `subject_id` bigint(20) unsigned DEFAULT NULL,
    `causer_type` varchar(255) DEFAULT NULL,
    `causer_id` bigint(20) unsigned DEFAULT NULL,
    `properties` json DEFAULT NULL,
    `batch_uuid` char(36) DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `subject` (`subject_type`, `subject_id`),
    KEY `causer` (`causer_type`, `causer_id`),
    KEY `activity_logs_log_name_index` (`log_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول سجلات تدقيق الصلاحيات
CREATE TABLE IF NOT EXISTS `permission_audit_logs` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `user_id` bigint(20) unsigned NOT NULL,
    `action` varchar(255) NOT NULL,
    `permission` varchar(255) NOT NULL,
    `resource` varchar(255) DEFAULT NULL,
    `result` varchar(255) NOT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text,
    `metadata` json DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `permission_audit_logs_user_id_foreign` (`user_id`),
    CONSTRAINT `permission_audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول أحداث الأمان
CREATE TABLE IF NOT EXISTS `security_events` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `event_type` varchar(255) NOT NULL,
    `severity` varchar(255) NOT NULL DEFAULT 'low',
    `user_id` bigint(20) unsigned DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text,
    `description` text NOT NULL,
    `metadata` json DEFAULT NULL,
    `resolved` tinyint(1) NOT NULL DEFAULT 0,
    `resolved_at` timestamp NULL DEFAULT NULL,
    `resolved_by` bigint(20) unsigned DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `security_events_user_id_foreign` (`user_id`),
    KEY `security_events_resolved_by_foreign` (`resolved_by`),
    CONSTRAINT `security_events_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `security_events_resolved_by_foreign` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول سجلات الأخطاء
CREATE TABLE IF NOT EXISTS `error_logs` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `level` varchar(255) NOT NULL,
    `message` text NOT NULL,
    `context` json DEFAULT NULL,
    `file` varchar(255) DEFAULT NULL,
    `line` int(11) DEFAULT NULL,
    `trace` text,
    `user_id` bigint(20) unsigned DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `error_logs_user_id_foreign` (`user_id`),
    CONSTRAINT `error_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تنبيهات النظام
CREATE TABLE IF NOT EXISTS `system_alerts` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `type` varchar(255) NOT NULL,
    `title` varchar(255) NOT NULL,
    `description` text NOT NULL,
    `severity` varchar(255) NOT NULL DEFAULT 'info',
    `data` json DEFAULT NULL,
    `triggered_by` varchar(255) DEFAULT NULL,
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    `acknowledged` tinyint(1) NOT NULL DEFAULT 0,
    `acknowledged_by` bigint(20) unsigned DEFAULT NULL,
    `acknowledged_at` timestamp NULL DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `system_alerts_acknowledged_by_foreign` (`acknowledged_by`),
    CONSTRAINT `system_alerts_acknowledged_by_foreign` FOREIGN KEY (`acknowledged_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول سجلات المسح
CREATE TABLE IF NOT EXISTS `scan_logs` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `scanner_type` varchar(255) NOT NULL,
    `scanned_data` text NOT NULL,
    `decoded_value` varchar(255) DEFAULT NULL,
    `scan_result` varchar(255) NOT NULL,
    `order_id` bigint(20) unsigned DEFAULT NULL,
    `worker_id` bigint(20) unsigned DEFAULT NULL,
    `stage_id` bigint(20) unsigned DEFAULT NULL,
    `additional_data` json DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `scan_logs_order_id_foreign` (`order_id`),
    KEY `scan_logs_worker_id_foreign` (`worker_id`),
    KEY `scan_logs_stage_id_foreign` (`stage_id`),
    CONSTRAINT `scan_logs_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `scan_logs_worker_id_foreign` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE SET NULL,
    CONSTRAINT `scan_logs_stage_id_foreign` FOREIGN KEY (`stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- الجداول التحليلية الموسعة - Extended Analytics Tables
-- =====================================================

-- جدول التحليلات الشهرية
CREATE TABLE IF NOT EXISTS `monthly_summaries` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `month` int(11) NOT NULL,
    `year` int(11) NOT NULL,
    `total_orders` int(11) NOT NULL DEFAULT 0,
    `completed_orders` int(11) NOT NULL DEFAULT 0,
    `total_revenue` decimal(12,3) NOT NULL DEFAULT 0.000,
    `total_expenses` decimal(12,3) NOT NULL DEFAULT 0.000,
    `net_profit` decimal(12,3) NOT NULL DEFAULT 0.000,
    `average_order_value` decimal(10,3) NOT NULL DEFAULT 0.000,
    `customer_satisfaction` decimal(5,2) DEFAULT NULL,
    `worker_productivity` decimal(5,2) DEFAULT NULL,
    `material_utilization` decimal(5,2) DEFAULT NULL,
    `quality_metrics` json DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `monthly_summaries_month_year_unique` (`month`, `year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول القدرة الإنتاجية للورشة
CREATE TABLE IF NOT EXISTS `workshop_capacity` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `total_workstations` int(11) NOT NULL DEFAULT 0,
    `active_workstations` int(11) NOT NULL DEFAULT 0,
    `max_daily_orders` int(11) NOT NULL DEFAULT 0,
    `current_utilization` decimal(5,2) NOT NULL DEFAULT 0.00,
    `peak_season_capacity` int(11) NOT NULL DEFAULT 0,
    `off_season_capacity` int(11) NOT NULL DEFAULT 0,
    `overtime_capacity` int(11) NOT NULL DEFAULT 0,
    `quality_stations` int(11) NOT NULL DEFAULT 0,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- إدراج البيانات الأساسية - Basic Data Insertion
-- =====================================================

-- إدراج الأدوار الأساسية
INSERT INTO `roles` (`name`, `guard_name`, `hierarchy_level`) VALUES
('system_super_admin', 'web', 100),
('system_admin', 'web', 90),
('admin', 'web', 80),
('accountant', 'web', 70),
('staff_manager', 'web', 60),
('boutique_manager', 'web', 50),
('boutique_cashier', 'web', 40),
('production_supervisor', 'web', 55),
('quality_inspector', 'web', 45),
('worker', 'web', 30);

-- إدراج الصلاحيات الأساسية
INSERT INTO `permissions` (`name`, `guard_name`) VALUES
-- إدارة المستخدمين
('users.view', 'web'),
('users.create', 'web'),
('users.edit', 'web'),
('users.delete', 'web'),
-- إدارة الطلبات
('orders.view', 'web'),
('orders.create', 'web'),
('orders.edit', 'web'),
('orders.delete', 'web'),
-- إدارة العمال
('workers.view', 'web'),
('workers.create', 'web'),
('workers.edit', 'web'),
('workers.delete', 'web'),
-- إدارة المخزون
('inventory.view', 'web'),
('inventory.create', 'web'),
('inventory.edit', 'web'),
('inventory.delete', 'web'),
-- إدارة الإنتاج
('production.view', 'web'),
('production.manage', 'web'),
('production.supervise', 'web'),
-- إدارة البوتيك
('boutique.view', 'web'),
('boutique.manage', 'web'),
('boutique.sales', 'web'),
-- إدارة التقارير
('reports.view', 'web'),
('reports.generate', 'web'),
('reports.export', 'web'),
-- إدارة النظام
('system.settings', 'web'),
('system.backup', 'web'),
('system.maintenance', 'web');

-- إدراج مراحل الإنتاج الأساسية
INSERT INTO `workflow_stages` (`name`, `description`, `sequence_order`, `estimated_minutes`, `is_active`) VALUES
('طلب جديد', 'استلام طلب جديد من العميل', 1, 15, 1),
('أخذ المقاسات', 'تسجيل مقاسات العميل', 2, 30, 1),
('التصميم', 'إعداد التصميم والنمط', 3, 60, 1),
('قص القماش', 'قص القماش حسب النمط', 4, 45, 1),
('الخياطة الأولية', 'بداية عملية الخياطة', 5, 120, 1),
('التجميع', 'تجميع أجزاء القطعة', 6, 90, 1),
('الكي والتشطيب', 'كي القطعة وتشطيب التفاصيل', 7, 30, 1),
('مراقبة الجودة', 'فحص جودة المنتج النهائي', 8, 20, 1),
('التعبئة', 'تعبئة المنتج للتسليم', 9, 10, 1),
('جاهز للتسليم', 'المنتج جاهز لتسليم العميل', 10, 5, 1);

-- إدراج محطات العمل الأساسية
INSERT INTO `stations` (`name`, `type`, `location`, `capacity`, `status`) VALUES
('محطة التصميم 1', 'design', 'الطابق الأول - قسم التصميم', 2, 'active'),
('محطة القص 1', 'cutting', 'الطابق الأول - قسم القص', 1, 'active'),
('محطة القص 2', 'cutting', 'الطابق الأول - قسم القص', 1, 'active'),
('محطة الخياطة 1', 'sewing', 'الطابق الثاني - قسم الخياطة', 1, 'active'),
('محطة الخياطة 2', 'sewing', 'الطابق الثاني - قسم الخياطة', 1, 'active'),
('محطة الخياطة 3', 'sewing', 'الطابق الثاني - قسم الخياطة', 1, 'active'),
('محطة التشطيب 1', 'finishing', 'الطابق الثاني - قسم التشطيب', 2, 'active'),
('محطة مراقبة الجودة', 'quality', 'الطابق الثاني - قسم الجودة', 1, 'active'),
('محطة التعبئة', 'packaging', 'الطابق الأول - قسم التسليم', 2, 'active');

-- إدراج فئات المواد الأساسية
INSERT INTO `categories` (`name`, `description`, `is_active`) VALUES
('أقمشة', 'جميع أنواع الأقمشة والخامات', 1),
('خيوط', 'خيوط الخياطة بأنواعها', 1),
('أزرار وإكسسوارات', 'الأزرار والسحابات والإكسسوارات', 1),
('أدوات القياس', 'أدوات القياس والتفصيل', 1),
('منتجات جاهزة', 'المنتجات الجاهزة للبيع', 1);

-- إدراج بيانات أساسية للورشة
INSERT INTO `workshop_capacity` (`total_workstations`, `active_workstations`, `max_daily_orders`, `current_utilization`, `peak_season_capacity`, `off_season_capacity`, `overtime_capacity`, `quality_stations`) VALUES
(9, 9, 50, 75.00, 80, 40, 100, 1);

-- رسالة نجاح
SELECT 'تم إنشاء قاعدة البيانات وجميع الجداول بنجاح! Database created successfully with all tables!' as 'نتيجة العملية / Operation Result';
