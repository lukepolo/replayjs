<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Broadcast;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Broadcast::routes([
            'prefix' => 'api',
            'middleware' => [
                'bindings',
                \App\Http\Middleware\AuthenticateGuest::class,
                \Barryvdh\Cors\HandleCors::class,
            ]
        ]);

        require base_path('routes/channels.php');
    }
}
