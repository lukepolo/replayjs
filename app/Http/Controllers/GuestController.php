<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\Guest;
use Illuminate\Http\Request;
use Vinkla\Hashids\Facades\Hashids;

class GuestController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $site = Site::where('id', Hashids::decode($request->get('api_key'))[0])->first();
        $guest = Guest::where('updated_at', '>', \Carbon\Carbon::now()->sub('1', 'hour'))->firstOrCreate([
          'site_id' => $site->id,
          'ip_address' => $request->ip(),
          'user_agent' => $request->userAgent()
        ]);

        return [
            "session" => Hashids::encode($guest->id),
            "expires" => \Carbon\Carbon::now()->add('1', 'hour'),
        ];
    }
}
