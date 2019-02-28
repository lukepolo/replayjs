<?php

namespace App\WebSocketHandlers;

use App\Jobs\RecordDomChanges;
use App\Jobs\RecordInitialDom;
use Ratchet\ConnectionInterface;
use App\Jobs\CacheWebRecorderAssets;
use Ratchet\RFC6455\Messaging\MessageInterface;
use BeyondCode\LaravelWebSockets\WebSockets\WebSocketHandler;

class WebRecorderHandler extends WebSocketHandler
{
    public function onMessage(ConnectionInterface $connection, MessageInterface $message)
    {
        $messagePayload = json_decode($message->getPayload());
        switch ($messagePayload->event) {
            case 'client-changes':
            case 'client-initialize':
                dispatch(new RecordDomChanges($connection->socketId, $messagePayload->data));
                dispatch(new CacheWebRecorderAssets($messagePayload->data));
                break;
            default:
                dump($messagePayload->event);
        }
        parent::onMessage($connection, $message);
    }
}
