<?php

namespace App\Models\Site\Guest;

use App\Models\Site\Site;
use Tymon\JWTAuth\Contracts\JWTSubject;
use App\Models\Site\Guest\Session\GuestSession;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Guest extends Authenticatable implements JWTSubject
{
    protected $guarded = [];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function sessions()
    {
        return $this->hasMany(GuestSession::class);
    }

    public function chat()
    {
        return $this->hasOne(GuestChat::class);
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }
}
