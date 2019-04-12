<?php

namespace App\Http\Controllers\Site\Guest\Session;

use Illuminate\Http\Request;
use App\Services\GuestService;
use App\Http\Controllers\Controller;

class IdentifyController extends Controller
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
    public function index(Request $request)
    {
        $session = $this->guestService->getSession(
            $request->get('api_key'),
            $request->ip(),
            $request->userAgent()
        );

        return [
            "guest" => [
                "hash" => $session->guest->hash,
                "name" => $session->guest->name,
                "email" => $session->guest->email,
                "chat-messages" => $session->guest->chat->messages,
            ],
            "session" => $session->encode(),
            "expires" => \Carbon\Carbon::now()->add('1', 'hour'),
        ];
    }
}
