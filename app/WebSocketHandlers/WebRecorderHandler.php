<?php

namespace App\WebSocketHandlers;

use Illuminate\Support\Str;
use Ratchet\ConnectionInterface;
use Vinkla\Hashids\Facades\Hashids;
use Ratchet\RFC6455\Messaging\MessageInterface;
use BeyondCode\LaravelWebSockets\WebSockets\WebSocketHandler;

class WebRecorderHandler extends WebSocketHandler
{
    public function onOpen(ConnectionInterface $connection)
    {
        $this
            ->verifyAppKey($connection)
            ->generateSocketId($connection)
            ->establishConnection($connection);

        $ipAddress = $connection->remoteAddress;
        $userAgent = $connection->httpRequest->getHeader('User-Agent');

        $connection->send(json_encode([
                'event' => 'auth',
                'data' => json_encode([
                  'test' => 123
                ]),
            ]));
    }

    public function onMessage(ConnectionInterface $connection, MessageInterface $message)
    {
        parent::onMessage($connection, $message);
    }

    private function getId($messagePayload)
    {
        return Hashids::decode(Str::after($messagePayload->channel, '.'))[0];
    }
}
