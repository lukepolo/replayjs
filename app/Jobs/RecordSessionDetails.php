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
    private $identity;

    /**
     * Create a new job instance.
     *
     * @param $identity
     * @param $data
     */
    public function __construct($identity, $userAgent, $data)
    {
        $this->data = $data;
        $this->apiKey = $apiKey;
        $this->identity = $identity;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if (!empty($site)) {
            $recording = SiteRecording::firstOrNew([
                'site_id' => $site->id,
                'session' => $this->identity,
            ]);

            $recording->fill([
                'user_agent' => $this->data->userAgent
            ]);

            $recording->save();
        }
    }
}
