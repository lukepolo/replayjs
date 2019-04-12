<?php

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('stream.{session}', function ($user) {
    return [
        'guest' => $user->isGuest || false,
        'name' => "{$user->name}",
    ];
});

Broadcast::channel('chat.{guest}', function ($user) {
    return [
        'guest' => $user->isGuest || false,
        'name' => "{$user->name}",
    ];
});

