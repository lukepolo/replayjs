<?php

namespace App\Models\Traits;

use Vinkla\Hashids\Facades\Hashids;

// TODO - rename file
trait Hashable
{
    public function encode()
    {
        return Hashids::connection($this->hashConnection ?: config('hashids.default'))->encode($this->id);
    }

    public function decode($hash)
    {
        return Hashids::connection($this->hashConnection ?: config('hashids.default'))->decode($hash)[0];
    }
}
