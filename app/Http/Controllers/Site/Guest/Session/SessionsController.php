<?php

namespace App\Http\Controllers\Site\Guest\Session;

use Illuminate\Http\Request;
use App\Services\GuestService;
use App\Http\Controllers\Controller;
use App\Models\Site\Guest\Session\GuestSession;

class SessionsController extends Controller
{
    private $guestService;

    /**
     * SessionsController constructor.
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
    public function index(Request $request, $siteId, $guestId)
    {
        return GuestSession::where('guest_id', $guestId)->get();
    }

    public function show(Request $request, $siteId, $guestId, $sessionHash)
    {
        // TODO - security
        return $this->guestService->getSessionRecording($sessionHash);
    }
}
