<?php

namespace App\WebSocketHandlers;

use BeyondCode\LaravelWebSockets\HttpApi\Controllers\FetchUsersController;
use BeyondCode\LaravelWebSockets\HttpApi\Controllers\FetchChannelController;
use BeyondCode\LaravelWebSockets\HttpApi\Controllers\TriggerEventController;
use BeyondCode\LaravelWebSockets\HttpApi\Controllers\FetchChannelsController;

class Router extends \BeyondCode\LaravelWebSockets\Server\Router
{
    public function echo()
    {
        $this->get('/app/{appKey}', WebRecorderHandler::class);

        $this->post('/apps/{appId}/events', TriggerEventController::class);
        $this->get('/apps/{appId}/channels', FetchChannelsController::class);
        $this->get('/apps/{appId}/channels/{channelName}', FetchChannelController::class);
        $this->get('/apps/{appId}/channels/{channelName}/users', FetchUsersController::class);
    }
}
