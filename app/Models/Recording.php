<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recording extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'custom_data' => 'json',
        'dom_changes' => 'json',
        'xhr_requests' => 'json',
        'mouse_clicks' => 'json',
        'scroll_events' => 'json',
        'mouse_movements' => 'json',
        'window_size_changes' => 'json'
    ];
}
