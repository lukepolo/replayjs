<?php

namespace App\Http\Controllers\Site\Guest\Session;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Site\Guest\Session\GuestSession;

class SessionsController extends Controller
{

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
}
