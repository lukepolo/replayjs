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
               if (!$messagePayload->data->joiningEvent) {
                   dispatch(new RecordDomChanges($messagePayload->data->identity, $messagePayload->data));
               }
               break;
            case 'changes':
                dispatch(new RecordDomChanges($messagePayload->data->identity, $messagePayload->data));
            break;
            case 'click':
                dispatch(new RecordClick($messagePayload->data->identity, $messagePayload->data));
                break;
            case 'scroll':
                dispatch(new RecordScroll($messagePayload->data->identity, $messagePayload->data));
                break;
            case 'window-size':
                dispatch(new RecordWindowSize($messagePayload->data->identity, $messagePayload->data));
                break;
            case 'mouse-movement':
                dispatch(new RecordMouseMovement($messagePayload->data->identity, $messagePayload->data));
                break;
            case 'network-request':
                dispatch(new RecordNetworkRequest($messagePayload->data->identity, $messagePayload->data));
                break;
             case 'console-message':
                    dispatch(new RecordConsoleMessage($messagePayload->data->identity, $messagePayload->data));
                break;
            case 'session-details':
                dispatch(new RecordSessionDetails($messagePayload->data->identity, $messagePayload->data));
                break;
            default:
                dump($messagePayload->event);
        }
       parent::onMessage($connection, $message);
    }
}
