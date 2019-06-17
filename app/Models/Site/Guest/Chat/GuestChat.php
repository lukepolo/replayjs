<?php

namespace App\Models\Site\Guest\Chat;

use App\Models\Traits\Hashable;
use App\Models\Site\Guest\Guest;
use Illuminate\Database\Eloquent\Model;
use App\Models\Site\Guest\Session\GuestSession;

class GuestChat extends Model
{
    use Hashable;

    protected $guarded = ['id'];

    protected $hidden = [
        'id',
         'guest_id',
    ];

    protected $appends = [
       'guest'
    ];

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function session()
    {
        return $this->belongsTo(GuestSession::class);
    }

    public function messages()
    {
        return $this->hasMany(GuestChatMessage::class);
    }

    public function getGuestAttribute()
    {
        return $this->encode();
    }
}
