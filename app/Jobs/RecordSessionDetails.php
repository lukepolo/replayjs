<?php

namespace App\Jobs;

use App\Models\Site;
use App\Models\SiteRecording;
use Illuminate\Bus\Queueable;
use Vinkla\Hashids\Facades\Hashids;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class RecordSessionDetails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $data;
    private $apiKey;
    private $socketId;

    /**
     * Create a new job instance.
     *
     * @param $socketId
     * @param $data
     */
    public function __construct($apiKey, $socketId, $data)
    {
        $this->data = $data;
        $this->apiKey = $apiKey;
        $this->socketId = $socketId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $site = Site::where('id', Hashids::decode($this->apiKey))->first();
        if (!empty($site)) {
            $recording = SiteRecording::firstOrNew([
                'site_id' => $site->id,
                'session' => $this->socketId,
            ]);

            $recording->fill([

            ]);

            $recording->save();
        }
    }
}
