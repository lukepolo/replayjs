<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recording extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'custom_data' => 'json',
    ];
}
