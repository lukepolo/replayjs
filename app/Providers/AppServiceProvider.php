<?php

namespace App\Providers;

use App\Services\AssetService;
use App\Services\GuestService;
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
        $this->app->bind(GuestService::class, GuestService::class);

        $this->app->singleton('websockets.router', function () {
            return new Router();
        });

        if ($this->app->environment() !== 'production') {
            $this->app->register(\Barryvdh\LaravelIdeHelper\IdeHelperServiceProvider::class);
        }
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
