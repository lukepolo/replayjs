<?php

namespace App\Http\Middleware;

use Closure;

class ExtendAuthCookieExpiration
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
        $response = $next($request);

        if ($request->cookie('token')) {
            $response->withCookie('token', $request->cookie('token'), auth()->factory()->getTTL(), null, null, null, false);
        }

        return $response;
    }
}
