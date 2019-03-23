<?php

namespace App\Models\Site\Guest\Session;

use App\Models\Site\Guest\Guest;
use App\Models\Traits\Hashable;
use Illuminate\Database\Eloquent\Model;

class GuestSession extends Model
{
    use Hashable;

    protected $guarded = ['id'];

    protected $hidden = [
        'id'
    ];

    protected $appends = [
        'session',
    ];

    public function guest()
    {
        return $this->guest(Guest::class);
    }

    public function getSessionAttribute()
    {
        return $this->encode($this->id);
    }

}
