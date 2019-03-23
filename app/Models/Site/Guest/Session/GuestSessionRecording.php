<?php

namespace App\Models\Site\Guest\Session;

use App\Models\Site\Site;
use App\Models\Traits\ConnectedToUser;
use Illuminate\Database\Eloquent\Model;

class GuestSessionRecording extends Model
{
    use ConnectedToUser;

    public static $userModel = 'site';

    protected $guarded = ['id'];

    protected $casts = [
        'custom_data' => 'json',
    ];

    protected $with = [
        'site.user'
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }
}
