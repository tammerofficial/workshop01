<?php

return [
    'base_url' => env('WOOCOMMERCE_BASE_URL', 'https://your-woocommerce-site.com'),
    'consumer_key' => env('WOOCOMMERCE_CONSUMER_KEY', ''),
    'consumer_secret' => env('WOOCOMMERCE_CONSUMER_SECRET', ''),
    'version' => env('WOOCOMMERCE_API_VERSION', 'v3'),
    'timeout' => env('WOOCOMMERCE_TIMEOUT', 30),
];
