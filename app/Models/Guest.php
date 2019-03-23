<?php

namespace App\Models;

use App\Models\Traits\Hashable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Guest extends Authenticatable implements JWTSubject
{
    use Hashable;

    protected $guarded = ['id'];

    public function site()
    {
        return $this->belongsTo(Site::class);
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
