<?php

namespace App\Http\Middleware;

use Closure;
use App\User;

class AuthenticateGuest
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $user = factory(User::class)->create();
        \Auth::login($user);
        return $next($request);
    }
}
