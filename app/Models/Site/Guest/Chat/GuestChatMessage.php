<?php

namespace App\Models\Site\Guest\Chat;

use Illuminate\Database\Eloquent\Model;

class GuestChatMessage extends Model
{
    protected $guarded = ['id'];

    protected $hidden = [
        'id'
    ];

    public function chat()
    {
        return $this->belongsTo(GuestChat::class);
    }
}
