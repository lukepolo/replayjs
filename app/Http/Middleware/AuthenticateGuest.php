<?php

namespace App\Http\Middleware;

use Auth;
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
        $guest = $request->session()->get('guest');

        if(empty($guest)) {
            $guestId = (int) str_replace('.', '', microtime(true));
            $guest = factory(User::class)->make([
                'id' => $guestId,
                'name' => 'guest-'.$guestId,
            ]);
            $request->session()->put('guest', $guest);
        }

        Auth::login($guest);

        return $next($request);
    }
}
