<?php

namespace App\WebSocketHandlers;

use App\Jobs\RecordClick;
use App\Jobs\RecordScroll;
use App\Jobs\RecordDomChanges;
use App\Jobs\RecordWindowSize;
use App\Jobs\RecordXhrRequest;
use Ratchet\ConnectionInterface;
use App\Jobs\RecordMouseMovement;
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
            case 'client-click':
                dispatch(new RecordClick($connection->socketId, $messagePayload->data));
                break;
            case 'client-scroll':
                dispatch(new RecordScroll($connection->socketId, $messagePayload->data));
                break;
            case 'client-window-size':
                dispatch(new RecordWindowSize($connection->socketId, $messagePayload->data));
                break;
            case 'mouse-movement':
                dispatch(new RecordMouseMovement($connection->socketId, $messagePayload->data));
                break;
            case 'xhr-request':
                dispatch(new RecordXhrRequest($connection->socketId, $messagePayload->data));
                break;
            default:
                dump($messagePayload->event);
        }
        parent::onMessage($connection, $message);
    }
}
