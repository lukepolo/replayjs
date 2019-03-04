<?php

namespace App\WebSocketHandlers;

use App\Jobs\RecordClick;
use App\Jobs\RecordScroll;
use App\Jobs\RecordDomChanges;
use App\Jobs\RecordWindowSize;
use Ratchet\ConnectionInterface;
use App\Jobs\RecordMouseMovement;
use App\Jobs\RecordConsoleMessage;
use App\Jobs\RecordNetworkRequest;
use App\Jobs\RecordSessionDetails;
use App\Jobs\CacheWebRecorderAssets;
use Ratchet\RFC6455\Messaging\MessageInterface;
use BeyondCode\LaravelWebSockets\WebSockets\WebSocketHandler;

class WebRecorderHandler extends WebSocketHandler
{
    public function onMessage(ConnectionInterface $connection, MessageInterface $message)
    {
        $messagePayload = json_decode($message->getPayload());

        switch (str_replace('client-', '', $messagePayload->event)) {
             case 'initialize':
               dispatch(new CacheWebRecorderAssets($messagePayload->data));
               dump($messagePayload->data->joiningEvent);
               dump($messagePayload->data->joiningEvent);
               dump($messagePayload->data->joiningEvent);
               dump($messagePayload->data->joiningEvent);
               dump($messagePayload->data->joiningEvent);
               if(!$messagePayload->data->joiningEvent) {
                dispatch(new RecordDomChanges($connection->socketId, $messagePayload->data));
               }
               break;
            case 'changes':
                dispatch(new RecordDomChanges($connection->socketId, $messagePayload->data));
            break;
            case 'click':
                dispatch(new RecordClick($connection->socketId, $messagePayload->data));
                break;
            case 'scroll':
                dispatch(new RecordScroll($connection->socketId, $messagePayload->data));
                break;
            case 'window-size':
                dispatch(new RecordWindowSize($connection->socketId, $messagePayload->data));
                break;
            case 'mouse-movement':
                dispatch(new RecordMouseMovement($connection->socketId, $messagePayload->data));
                break;
            case 'network-request':
                dispatch(new RecordNetworkRequest($connection->socketId, $messagePayload->data));
                break;
             case 'console-message':
                    dispatch(new RecordConsoleMessage($connection->socketId, $messagePayload->data));
                break;
            case 'session-details':
                // TODO - get IP / User Agent
                $apiKey = $messagePayload->data->apiKey;
                dispatch(new RecordSessionDetails($apiKey, $connection->socketId, $messagePayload->data));
                break;

            default:
                dump($messagePayload->event);
        }

        parent::onMessage($connection, $message);
    }
}
