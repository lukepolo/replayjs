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
        $message->user = ['name' => 'TEMP'];
        $message->message = $request->message;
        $message->time = \Carbon\Carbon::now();

        broadcast(new NewChatMessage($message))->toOthers();

        return response()->json($message);
    }

    // TODO - temp
    public function auth(Request $request) {

     // $guest = $request->session()->get('guest');
        //  if(empty($guest)) {
            $guestId = (int) str_replace('.', '', microtime(true));
            $guest = factory(\App\User::class)->make([
                'id' => $guestId,
                'name' => 'guest-'.$guestId,
            ]);
            // $request->session()->put('guest', $guest);
        // }

        return json_encode(['channel_data' => [
            'user_id' => $guest->getAuthIdentifier(),
            'user_info' => $guest,
        ]]);

        return ['channel_data' => $guest];
    }


/**
 if (Str::startsWith($request->channel_name, ['private-', 'presence-']) &&
            ! $request->user()) {
            throw new AccessDeniedHttpException;
        }

        $channelName = Str::startsWith($request->channel_name, 'private-')
                            ? Str::replaceFirst('private-', '', $request->channel_name)
                            : Str::replaceFirst('presence-', '', $request->channel_name);

        return parent::verifyUserCanAccessChannel(
            $request, $channelName
        );
**/



}
