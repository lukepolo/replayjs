<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class RecordConsoleMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $data;
    private $socketId;

    /**
     * Create a new job instance.
     *
     * @param $socketId
     * @param $data
     */
    public function __construct($socketId, $data)
    {
        $this->data = $data;
        $this->socketId = $socketId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        Cache::lock($this->socketId)->get(function () {
            Cache::tags([$this->socketId, 'console_messages'])->put(hrtime(true), $this->data);
        });
    }
}
