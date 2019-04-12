<?php

namespace App\Providers;

use App\Services\AssetService;
use App\Services\GuestService;
use App\WebSocketHandlers\Router;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\Console\Output\ConsoleOutput;
use BeyondCode\LaravelWebSockets\Facades\WebSocketsRouter;
use BeyondCode\LaravelWebSockets\Server\Logger\WebsocketsLogger;

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

        // TODO - NOT SURE WHY THIS WORKS
        // https://github.com/beyondcode/laravel-websockets/issues/21
        app()->singleton(WebsocketsLogger::class, function () {
            return (new WebsocketsLogger(new ConsoleOutput()))->enable(true);
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
        WebSocketsRouter::webSocket('/app/{apiKey}/{appKey}', \App\WebSocketHandlers\WebRecorderHandler::class);
    }
}
