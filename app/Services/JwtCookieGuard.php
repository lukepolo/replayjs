<?php

namespace App\Services;

use Tymon\JWTAuth\JWTGuard;
use Illuminate\Contracts\Auth\Authenticatable;

class JwtCookieGuard extends JWTGuard
{
    /**
     * Get the currently authenticated user.
     *
     * @return Authenticatable|null
     */
    public function user()
    {
        if ($this->user !== null) {
            return $this->user;
        }

        if ($this->request->hasCookie('token') && $this->request->hasCookie('token')) {
            $this->jwt->setToken($this->request->cookie('token').'.'.$this->request->cookie('signature'));
            if (
                ($payload = $this->jwt->check(true)) &&
                $this->validateSubject()
            ) {
                return $this->user = $this->provider->retrieveById($payload['sub']);
            }
        }

        return parent::user();
    }
}
