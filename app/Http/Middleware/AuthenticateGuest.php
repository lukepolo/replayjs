<?php

namespace App\Http\Middleware;

use Closure;
use App\Services\GuestService;

class AuthenticateGuest
{
    private $guestService;

    /**
     * AuthenticateGuest constructor.
     * @param GuestService $guestService
     */
    public function __construct(GuestService $guestService)
    {
        $this->guestService = $guestService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (!\Auth::check()) {
            $guest = $this->guestService->getGuest(
                str_replace('Bearer ', '', $request->headers->get('Authorization')),
                $request->ip()
            );

            if (!empty($guest)) {
                $guest->load('site');
                if ($guest->site->domain === parse_url($request->headers->get('origin'))['host']) {
                    \Auth::login($guest);
                }
            }
        }
        return $next($request);
    }
}
