<?php

namespace App\Jobs;

use Carbon\Carbon;
use App\Models\User\User;
use Illuminate\Bus\Queueable;
use App\Models\Site\Guest\Guest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\Site\Guest\Chat\GuestChat;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Models\Site\Guest\Chat\GuestChatMessage;

class RecordChatMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $data;
    private $userId;

    /**
     * Create a new job instance.
     *
     * @param $sessionId
     * @param $data
     */
    public function __construct($userId, $data)
    {
        $this->data = $data;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $guestChat = GuestChat::firstOrCreate([
            "resolved" => false,
            "guest_id" => $this->userId,
        ]);

       $guestChat->messages()->create([
            'message' => $this->data->message,
            'user_type' => $this->data->isAgent ? User::class : Guest::class,
            'created_at' => Carbon::createFromTimestamp($this->data->createdAt / 1000),
            'user' => $this->data->isAgent ? (new User())->decode($this->data->user->hash) : (new Guest())->decode($this->data->user->hash)
       ]);
    }
}
