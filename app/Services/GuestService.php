<?php

namespace App\Services;

use Carbon\Carbon;
use Predis\Client;
use App\Models\Site\Site;
use Predis\Collection\Iterator;
use App\Models\Site\Guest\Guest;
use Illuminate\Support\Facades\Cache;
use App\Models\Site\Guest\Session\GuestSession;

class GuestService
{
    private $redis;
    private $siteModel;
    private $guestSessionModel;

    /**
     * GuestService constructor.
     * @param Site $siteModel
     * @param GuestSession $guestSessionModel
     */
    public function __construct(Site $siteModel, GuestSession $guestSessionModel)
    {
        $this->siteModel = $siteModel;
        $this->guestSessionModel = $guestSessionModel;
        /** @var Client $redis */
        $this->redis = Cache::getRedis();
        $this->redis->select(1);
    }

    public function getGuest($apiKeyHash, $ipAddress) : Guest
    {
        $guest = Guest::firstOrCreate([
             'ip_address' => $ipAddress,
             'site_id' => $this->siteModel->decode($apiKeyHash)->id,
        ]);
        $guest->isGuest = true;
        return $guest;
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

    public function getSessionRecording($sessionHash)
    {
        $session = $this->guestSessionModel->decode($sessionHash);

        $domChanges = $this->getFromCache($session->id, 'dom_changes');

        $session->root = $domChanges->shift();
        $session->dom_changes = $domChanges->groupBy('timing');
        $session->mouse_clicks = $this->getFromCache($session->id, 'mouse_clicks')->groupBy('timing');
        $session->network_requests = $this->getFromCache($session->id, 'network_requests')->groupBy('timing');
        $session->console_messages = $this->getFromCache($session->id, 'console_messages')->groupBy('timing');

        $windowSizes = $this->getFromCache($session->id, 'window_size_changes');
        $session->window_size = $windowSizes->shift();
        $session->window_size_changes = $windowSizes->groupBy('timing');
        $session->scroll_events = $this->getFromCache($session->id, 'scroll_events')->groupBy('timing');

        $session->mouse_movements = $this->getFromCache($session->id, 'mouse_movements')->collapse()->groupBy('timing');

        $session->start_timing = min(
            array_filter(
                [
             $session->dom_changes->keys()->first(),
                $session->mouse_clicks->keys()->first(),
                $session->network_requests->keys()->first(),
                $session->console_messages->keys()->first(),
                $session->window_size_changes->keys()->first(),
                $session->scroll_events->keys()->first()
                ]

            )
        );

        $session->end_timing = max(
            array_filter([
           $session->dom_changes->keys()->last(),
                      $session->mouse_clicks->keys()->last(),
                      $session->network_requests->keys()->last(),
                      $session->console_messages->keys()->last(),
                      $session->window_size_changes->keys()->last(),
                      $session->scroll_events->keys()->last(),
                      ])
        );

        return $session;
    }

    private function getFromCache($session, $cache)
    {
        $data = [];
        $sha = sha1(Cache::tags([$session, $cache])->getTags()->getNamespace());
        foreach (new Iterator\Keyspace($this->redis->client(), "replayjs_cache:$sha:*") as $key) {
            $data[] =unserialize($this->redis->get($key));
        }
        return collect($data)->sortBy('timing');
    }
}
