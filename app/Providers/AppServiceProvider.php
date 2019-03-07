<?php

namespace App\Providers;

use App\Services\AssetService;
use App\WebSocketHandlers\Router;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(AssetService::class, AssetService::class);

        $this->app->singleton('websockets.router', function () {
            return new Router();
        });
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
    }
}
