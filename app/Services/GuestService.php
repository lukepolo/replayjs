<?php

namespace App\Services;

use App\Models\Site;
use App\Models\Guest;

class GuestService
{
    private $site;

    /**
     * GuestService constructor.
     * @param Site $site
     */
    public function __construct(Site $site)
    {
        $this->site = $site;
    }

    public function getGuest($apiKey, $ipAddress, $userAgent) : Guest
    {
        return Guest::where('updated_at', '>', \Carbon\Carbon::now()->sub('1', 'hour'))->firstOrCreate([
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'site_id' => $this->site->decode($apiKey)->id,
        ]);
    }
}
