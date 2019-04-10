<?php

namespace App\Models\Site\Guest\Chat;

use App\Models\Site\Guest;
use Illuminate\Database\Eloquent\Model;
use App\Models\Site\Guest\Session\GuestSession;
class GuestChat extends Model
{
    protected $guarded = ['id'];

    protected $hidden = [
        'id'
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
}
