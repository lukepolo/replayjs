<?php

namespace App\Http\Controllers;

use Predis\Client;
use App\Models\Recording;
use Illuminate\Http\Request;
use Predis\Collection\Iterator;
use Illuminate\Support\Facades\Cache;

class RecordingController extends Controller
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
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        return response()->json(Recording::all());
    }

    /**
     * @param Request $request
     * @param $recordingId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $recordingId)
    {
        $recording = Recording::findOrFail($recordingId);

        $recording->dom_changes = $this->getFromCache($recording->session, 'dom_changes');
        $recording->mouse_clicks = $this->getFromCache($recording->session, 'mouse_clicks');
        $recording->xhr_requests = $this->getFromCache($recording->session, 'xhr_requests');
        $recording->window_size_changes = $this->getFromCache($recording->session, 'window_size_changes');
        $recording->scroll_events = $this->getFromCache($recording->session, 'scroll_events');
        $recording->mouse_movements = $this->getFromCache($recording->session, 'mouse_movements');

        return response()->json($recording);
    }

    private function getFromCache($session, $cache)
    {
        $data = [];
        $sha = sha1(Cache::tags([$session, $cache])->getTags()->getNamespace());
        foreach (new Iterator\Keyspace($this->redis->client(), "replayjs_cache:$sha:*") as $key) {
            $data[str_replace("replayjs_cache:$sha:", '', $key)] =unserialize($this->redis->get($key));
        }
        return $data;
    }
}
