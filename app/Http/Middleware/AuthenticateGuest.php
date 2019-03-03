<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Site;
use App\Models\User\User;
use Vinkla\Hashids\Facades\Hashids;

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
        $site = Site::where(
            'id',
            Hashids::decode(
                str_replace('Bearer ', '', $request->headers->get('Authorization'))
            )
        )->first();

        if ($site && $site->domain === parse_url($request->headers->get('origin'))['host']) {
            $user = factory(User::class)->create();
            \Auth::login($user);
        }
        return $next($request);
    }
}
