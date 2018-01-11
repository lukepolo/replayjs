<?php

namespace App\Http\Controllers;

use stdClass;
use Illuminate\Http\Request;
use App\Events\NewChatMessage;

class SupportController extends Controller
{
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $message = new stdClass;
        $message->user = $request->user();
        $message->message = $request->message;
        $message->time = \Carbon\Carbon::now();

        broadcast(new NewChatMessage($message))->toOthers();

        return response()->json($message);
    }
}
