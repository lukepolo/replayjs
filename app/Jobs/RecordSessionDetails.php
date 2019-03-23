<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Models\Site\Guest\Session\GuestSessionRecording;

class RecordSessionDetails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $data;
    private $apiKey;
    private $session;

    /**
     * Create a new job instance.
     *
     * @param $session
     * @param $data
     */
    public function __construct($session, $data)
    {
        $this->data = $data;
        $this->session = $session;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if (!empty($site)) {
            $recording = GuestSessionRecording::firstOrNew([
                'site_id' => $site->id,
                'guest_session_id' => $this->session,
            ]);

//            $recording->fill([
//                'user_agent' => $this->data->userAgent
//            ]);

            $recording->save();
        }
    }
}
