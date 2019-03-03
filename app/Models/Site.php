<?php

namespace App\Models;

use App\Models\User\User;
use App\Models\Traits\ConnectedToUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Site extends Model
{
    use SoftDeletes, ConnectedToUser;

    protected $guarded = ['id'];

    protected $casts = [
        'recording_options' => 'json',
        'data_collection_options' => 'json',
        'notification_settings' => 'json',
        'blocked_ips' => 'json',
    ];

    protected $with = [
        'user'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function recordings()
    {
        return $this->hasMany(SiteRecording::class);
    }
}
