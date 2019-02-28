<?php

namespace App\WebSocketHandlers;

use Ratchet\ConnectionInterface;
use Ratchet\RFC6455\Messaging\MessageInterface;
use BeyondCode\LaravelWebSockets\WebSockets\WebSocketHandler;

class WebRecorderHandler extends WebSocketHandler
{
    public function onMessage(ConnectionInterface $connection, MessageInterface $message)
    {
        dump(json_parse($message-getPayload()));
        parent::onMessage($connection, $message);
    }
}
