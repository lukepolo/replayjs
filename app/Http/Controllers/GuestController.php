<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GuestService;

class GuestController extends Controller
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
        $guest = $this->guestService->getGuest(
            $request->get('api_key'),
            $request->ip(),
            $request->userAgent()
        );

        return [
            "session" => $guest->encode(),
            "expires" => \Carbon\Carbon::now()->add('1', 'hour'),
        ];
    }
}
