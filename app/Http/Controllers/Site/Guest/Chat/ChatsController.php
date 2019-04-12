<?php

namespace App\Http\Controllers\Site\Guest\Chat;

use Illuminate\Http\Request;
use App\Services\GuestService;
use App\Http\Controllers\Controller;
use App\Models\Site\Guest\Chat\GuestChat;
use App\Models\Site\Guest\Guest;

class ChatsController extends Controller
{
    private $guestService;

    /**
     * GuestController constructor.
     * @param GuestService $guestService
     */
    public function __construct(GuestService $guestService)
    {
        $this->guestService = $guestService;
    }

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return array
     */
    public function index(Request $request, $siteId, $guestHash)
    {
        return GuestChat::with('messages.user')->findOrFail((new Guest())->decode($guestHash));
    }
}
