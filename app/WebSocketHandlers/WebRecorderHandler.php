<?php

namespace App\WebSocketHandlers;

use Ratchet\ConnectionInterface;
use Ratchet\RFC6455\Messaging\MessageInterface;

class WebRecorderHandler extends \BeyondCode\LaravelWebSockets\WebSockets\WebSocketHandler
{
    public function onMessage(ConnectionInterface $connection, MessageInterface $message)
    {

    }
}
