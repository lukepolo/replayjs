<?php

namespace App\Models\Site\Guest\Session;

use App\Models\Traits\Hashable;
use App\Models\Site\Guest\Guest;
use Illuminate\Database\Eloquent\Model;
use App\Models\Site\Guest\Chat\GuestChat;

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

    public function chat() {
       return $this->guest(GuestChat::class);
    }

    public function getSessionAttribute()
    {
        return $this->encode($this->id);
    }
}
