<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\WorkshopOrder;
use App\Models\Sale;
use App\Observers\WorkshopOrderObserver;
use App\Observers\SaleObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // تسجيل Observers لنظام الولاء
        WorkshopOrder::observe(WorkshopOrderObserver::class);
        Sale::observe(SaleObserver::class);
    }
}
