<?php

namespace App\Providers;

use App\Services\JwtCookieGuard;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Tymon\JWTAuth\JWT;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
       // 'App\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        // add custom guard
        $this->app['auth']->extend('jwt-cookie', function ($app, $name, array $config) {
            $guard = new JwtCookieGuard(
                $app['tymon.jwt'],
                $app['auth']->createUserProvider($config['provider']),
                $app['request']
            );
            $app->refresh('request', $guard, 'setRequest');
            return $guard;
        });

        $this->registerPolicies();

        //
    }
}
