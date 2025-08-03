<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Loyalty System Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the loyalty points system integrated with workshop
    |
    */

    'points_per_kwd' => (float) env('LOYALTY_POINTS_PER_KWD', 1.0),
    'points_expiry_months' => (int) env('LOYALTY_POINTS_EXPIRY_MONTHS', 12),
    'points_to_currency_rate' => (int) env('LOYALTY_POINTS_TO_CURRENCY_RATE', 100), // 100 points = 1 KWD
    'default_currency' => env('LOYALTY_DEFAULT_CURRENCY', 'KWD'),

    /*
    |--------------------------------------------------------------------------
    | Tier System
    |--------------------------------------------------------------------------
    |
    | Configuration for customer tier levels
    |
    */

    'tiers' => [
        'bronze' => [
            'name' => 'برونزي',
            'name_en' => 'Bronze',
            'minimum_points' => 0,
            'multiplier' => 1.0,
            'color' => '#CD7F32',
            'benefits' => [
                'نقاط أساسية على كل عملية شراء',
                'خصومات موسمية',
            ]
        ],
        'silver' => [
            'name' => 'فضي',
            'name_en' => 'Silver',
            'minimum_points' => 1000,
            'multiplier' => 1.25,
            'color' => '#C0C0C0',
            'benefits' => [
                'مضاعف نقاط x1.25',
                'خصم 5% إضافي',
                'أولوية في الخدمة',
            ]
        ],
        'gold' => [
            'name' => 'ذهبي',
            'name_en' => 'Gold',
            'minimum_points' => 5000,
            'multiplier' => 1.5,
            'color' => '#FFD700',
            'benefits' => [
                'مضاعف نقاط x1.5',
                'خصم 10% إضافي',
                'شحن مجاني',
                'استشارة مجانية',
            ]
        ],
        'vip' => [
            'name' => 'VIP',
            'name_en' => 'VIP',
            'minimum_points' => 10000,
            'multiplier' => 2.0,
            'color' => '#9B59B6',
            'benefits' => [
                'مضاعف نقاط x2.0',
                'خصم 15% إضافي',
                'خدمة VIP مخصصة',
                'عروض حصرية',
                'استشارة تصميم مجانية',
            ]
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Point Earning Rules
    |--------------------------------------------------------------------------
    |
    | Rules for earning points from different activities
    |
    */

    'earning_rules' => [
        'workshop_order' => [
            'enabled' => true,
            'base_rate' => 1.0, // points per KWD
            'minimum_amount' => 1.0, // minimum order amount to earn points
            'maximum_points' => null, // no limit
        ],
        'sale' => [
            'enabled' => true,
            'base_rate' => 1.0,
            'minimum_amount' => 1.0,
            'maximum_points' => null,
        ],
        'referral' => [
            'enabled' => true,
            'points' => 500, // points for successful referral
        ],
        'birthday' => [
            'enabled' => true,
            'points' => 100, // birthday bonus
        ],
        'signup' => [
            'enabled' => true,
            'points' => 50, // welcome bonus
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Point Redemption Rules
    |--------------------------------------------------------------------------
    |
    | Rules for redeeming points
    |
    */

    'redemption_rules' => [
        'minimum_points' => 100, // minimum points to redeem
        'maximum_percentage' => 50, // maximum percentage of order that can be paid with points
        'conversion_rate' => 100, // 100 points = 1 KWD
    ],

    /*
    |--------------------------------------------------------------------------
    | Apple Wallet Integration
    |--------------------------------------------------------------------------
    |
    | Settings for Apple Wallet pass generation
    |
    */

    'apple_wallet' => [
        'enabled' => env('LOYALTY_APPLE_WALLET_ENABLED', true),
        'team_id' => env('APPLE_WALLET_TEAM_ID'),
        'pass_type_id' => env('APPLE_WALLET_PASS_TYPE_ID', 'pass.com.workshop.loyalty'),
        'organization_name' => env('APPLE_WALLET_ORGANIZATION_NAME', 'Workshop Loyalty'),
        'pass_description' => 'بطاقة ولاء الورشة',
        'web_service_url' => env('APP_URL') . '/api/loyalty/apple-wallet',
        'logo_text' => 'ولاء الورشة',
        'colors' => [
            'background' => '#1a1a1a',
            'foreground' => '#ffffff',
            'label' => '#cccccc',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    |
    | Notification settings for loyalty events
    |
    */

    'notifications' => [
        'points_earned' => [
            'enabled' => true,
            'channels' => ['mail', 'database'],
        ],
        'tier_upgrade' => [
            'enabled' => true,
            'channels' => ['mail', 'database', 'push'],
        ],
        'points_expiry_warning' => [
            'enabled' => true,
            'channels' => ['mail', 'database'],
            'days_before' => 30,
        ],
        'points_expired' => [
            'enabled' => true,
            'channels' => ['mail', 'database'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | System Settings
    |--------------------------------------------------------------------------
    |
    | General system settings
    |
    */

    'system' => [
        'auto_create_loyalty_account' => true, // automatically create loyalty account for new clients
        'auto_process_orders' => true, // automatically process loyalty points for completed orders
        'auto_expire_points' => true, // automatically expire points
        'backup_transactions' => true, // backup transaction data
        'sync_with_external_system' => env('LOYALTY_SYNC_EXTERNAL', false),
        'external_system_url' => env('LOYALTY_EXTERNAL_URL'),
        'external_system_key' => env('LOYALTY_EXTERNAL_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Workshop Settings
    |--------------------------------------------------------------------------
    |
    | Workshop-specific configuration for the loyalty system
    |
    */

    'workshop' => [
        'name' => env('WORKSHOP_NAME', 'ورشة الخياطة'),
        'phone' => env('WORKSHOP_PHONE', '+965 1234 5678'),
        'email' => env('WORKSHOP_EMAIL', 'info@workshop.com'),
        'address' => env('WORKSHOP_ADDRESS', 'الكويت'),
        'logo_path' => env('WORKSHOP_LOGO_PATH', 'workshop-logo.png'),
        'website' => env('APP_URL'),
        'social_media' => [
            'instagram' => env('WORKSHOP_INSTAGRAM'),
            'twitter' => env('WORKSHOP_TWITTER'),
            'facebook' => env('WORKSHOP_FACEBOOK'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Messages
    |--------------------------------------------------------------------------
    |
    | Default messages for various loyalty activities
    |
    */

    'messages' => [
        'welcome' => 'مرحباً بك في برنامج ولاء الورشة! حصلت على :points نقطة ترحيب.',
        'points_earned' => 'تم إضافة :points نقطة إلى حسابك من :source',
        'points_redeemed' => 'تم استخدام :points نقطة في عملية الشراء',
        'tier_upgraded' => 'تهانينا! تم ترقية مستواك إلى :tier',
        'points_expiring' => 'تنبيه: ستنتهي صلاحية :points نقطة خلال :days أيام',
        'points_expired' => 'انتهت صلاحية :points نقطة من حسابك',
    ],
];