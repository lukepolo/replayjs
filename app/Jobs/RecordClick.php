<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class RecordClick implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $data;
    private $identity;

    /**
     * Create a new job instance.
     *
     * @param $identity
     * @param $data
     */
    public function __construct($identity, $data)
    {
        $this->data = $data;
        $this->identity = $identity;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        Cache::lock($this->identity)->get(function () {
            Cache::tags([$this->identity, 'mouse_clicks'])->put(hrtime(true), $this->data);
        });
    }
}
