<?php

namespace App\WebSocketHandlers;

use App\Jobs\RecordClick;
use App\Jobs\RecordScroll;
use Illuminate\Support\Str;
use App\Jobs\RecordDomChanges;
use App\Jobs\RecordWindowSize;
use App\Jobs\RecordChatMessage;
use Ratchet\ConnectionInterface;
use App\Jobs\RecordMouseMovement;
use App\Jobs\RecordConsoleMessage;
use App\Jobs\RecordNetworkRequest;
use App\Jobs\RecordSessionDetails;
use Vinkla\Hashids\Facades\Hashids;
use App\Jobs\MarkChatMessageAsRead;
use App\Jobs\CacheWebRecorderAssets;
use App\Jobs\RecordTabVisibilityChange;
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
                   dispatch(new RecordDomChanges($this->getStreamSession($messagePayload), $messagePayload->data));
               }
               break;
            case 'changes':
                dispatch(new RecordDomChanges($this->getStreamSession($messagePayload), $messagePayload->data));
            break;
            case 'click':
                dispatch(new RecordClick($this->getStreamSession($messagePayload), $messagePayload->data));
                break;
            case 'scroll':
                dispatch(new RecordScroll($this->getStreamSession($messagePayload), $messagePayload->data));
                break;
            case 'window-size':
                dispatch(new RecordWindowSize($this->getStreamSession($messagePayload), $messagePayload->data));
                break;
            case 'mouse-movement':
                dispatch(new RecordMouseMovement($this->getStreamSession($messagePayload), $messagePayload->data));
                break;
            case 'tab-visibility':
                dispatch(new RecordTabVisibilityChange($this->getStreamSession($messagePayload), $messagePayload->data));
                break;
            case 'network-request':
                dispatch(new RecordNetworkRequest($this->getStreamSession($messagePayload), $messagePayload->data));
                break;
            case 'console-message':
                    dispatch(new RecordConsoleMessage($this->getStreamSession($messagePayload), $messagePayload->data));
                break;
            case 'session-details':
                dispatch(new RecordSessionDetails($this->getStreamSession($messagePayload), $messagePayload->data));
                break;
            case 'chat-message':
                dispatch(new RecordChatMessage($this->getStreamSession($messagePayload), $messagePayload->data));
                break;
            case 'mark-chat-message-as-read':
                dispatch(new MarkChatMessageAsRead($this->getStreamSession($messagePayload), $messagePayload->data));
                break;
            default:
                dump($messagePayload->event);
        }
        parent::onMessage($connection, $message);
    }

    private function getStreamSession($messagePayload)
    {
        return Hashids::decode(Str::after($messagePayload->channel, '.'))[0];
    }
}
