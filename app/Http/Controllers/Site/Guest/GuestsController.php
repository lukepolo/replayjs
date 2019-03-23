<?php

namespace App\Http\Controllers\Site\Guest;

use App\Models\Site\Guest\Guest;
use App\Http\Controllers\Controller;

class GuestsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param $siteId
     * @return Site
     */
    public function index($siteId)
    {
        return Guest::where('site_id', $siteId)->get();
    }

    /**
     * @param $siteId
     * @param $guestId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($siteId, $guestId)
    {
        return Guest::where('site_id', $siteId)->findOrFail($guestId);
    }
}
