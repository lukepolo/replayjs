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
             'site_id' => Site::findOrFail((new Site())->decode($apiKeyHash))->id,
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
        ini_set('memory_limit', '512M');
        $session = GuestSession::findOrFail($this->guestSessionModel->decode($sessionHash));

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
        $session->focus_activity = $this->getFromCache($session->id, 'focus_activity')->groupBy('timing');
        $session->tab_visibility = $this->getFromCache($session->id, 'tab_visibility')->groupBy('timing');
        $session->mouse_movements = $this->getFromCache($session->id, 'mouse_movements')->groupBy('timing');

        return $session;
    }

    private function getFromCache($session, $cache)
    {
        $data = [];
        $sha = sha1(Cache::tags([$session, $cache])->getTags()->getNamespace());
        foreach (new Iterator\Keyspace($this->redis->client(), "replayjs_cache:$sha:*") as $key) {
            $data[] = unserialize($this->redis->get($key));
        }
        return collect($data)->sortBy('timing');
    }
}
