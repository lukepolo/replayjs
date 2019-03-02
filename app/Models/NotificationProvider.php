<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationProvider extends Model
{
    protected $guarded = ['id'];

    public function notificationProvider()
    {
        return $this->belongsTo(self::class);
    }
}
