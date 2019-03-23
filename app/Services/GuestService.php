<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\Site\Site;
use App\Models\Site\Guest\Guest;
use App\Models\Site\Guest\Session\GuestSession;

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

    public function getGuest($apiKey, $ipAddress) : Guest
    {
        return Guest::firstOrCreate([
            'ip_address' => $ipAddress,
            'site_id' => $this->site->decode($apiKey)->id,
        ]);
    }

    public function getSession($apiKey, $ipAddress, $userAgent)
    {
        $guest = $this->getGuest($apiKey, $ipAddress);
        $session = GuestSession::where('updated_at', '>', Carbon::now()->sub('1', 'hour'))
            ->firstOrNew([
                'guest_id' => $guest->id,
                'user_agent' => $userAgent
            ]);
        $session->touch();
        return $session;
    }
}
