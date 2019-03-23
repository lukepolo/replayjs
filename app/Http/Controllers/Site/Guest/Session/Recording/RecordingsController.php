<?php

namespace App\Http\Controllers\Site\Guest\Session\Recording;


use Predis\Client;
use Illuminate\Http\Request;
use Predis\Collection\Iterator;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use App\Models\Site\Guest\Session\GuestSessionRecording;

class RecordingsController extends Controller
{
    private $redis;

    /**
     * RecordingController constructor.
     */
    public function __construct()
    {
        /** @var Client $redis */
        $this->redis = Cache::getRedis();
        $this->redis->select(1);
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, $siteId)
    {
        return GuestSessionRecording::where('site_id', $siteId)->get();
    }

    /**
     * @param Request $request
     * @param $recordingId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $siteId, $recordingId)
    {
        $recording = GuestSessionRecording::where('id', $recordingId)->where('site_id', $siteId)->first();

        $recording->dom_changes = $this->getFromCache($recording->session, 'dom_changes');
        $recording->mouse_clicks = $this->getFromCache($recording->session, 'mouse_clicks');
        $recording->network_requests = $this->getFromCache($recording->session, 'network_requests');
        $recording->window_size_changes = $this->getFromCache($recording->session, 'window_size_changes');
        $recording->scroll_events = $this->getFromCache($recording->session, 'scroll_events');
        $recording->mouse_movements = $this->getFromCache($recording->session, 'mouse_movements');

        return $recording;
    }

    private function getFromCache($session, $cache)
    {
        $data = [];
        $sha = sha1(Cache::tags([$session, $cache])->getTags()->getNamespace());
        foreach (new Iterator\Keyspace($this->redis->client(), "replayjs_cache:$sha:*") as $key) {
            $data[] =unserialize($this->redis->get($key));
        }
        return collect($data)->sortBy('timing')->values();
    }
}
