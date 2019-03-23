<?php

namespace App\Models\Site;

use App\Models\User\User;
use App\Models\Traits\Hashable;
use App\Models\Traits\ConnectedToUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Site\Guest\Session\GuestSessionRecording;

class Site extends Model
{
    use SoftDeletes, ConnectedToUser, Hashable;

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

    protected $appends = [
        'api_key'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function recordings()
    {
        return $this->hasMany(GuestSessionRecording::class);
    }

    public function getApiKeyAttribute()
    {
        return $this->encode($this->id);
    }
}
