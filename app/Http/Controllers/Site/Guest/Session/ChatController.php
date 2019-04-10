<?php

namespace App\Http\Controllers\Site\Guest\Session;

use Illuminate\Http\Request;
use App\Services\GuestService;
use App\Http\Controllers\Controller;

class ChatController extends Controller
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

        // TODO - return old chat
        return [];
    }
}
