<?php

namespace App\WebSocketHandlers;

use App\Jobs\RecordClick;
use App\Jobs\RecordScroll;
use Illuminate\Support\Str;
use App\Jobs\RecordDomChanges;
use App\Jobs\RecordWindowSize;
use App\Services\GuestService;
use App\Jobs\RecordChatMessage;
use Ratchet\ConnectionInterface;
use App\Jobs\RecordMouseMovement;
use App\Jobs\RecordConsoleMessage;
use App\Jobs\RecordNetworkRequest;
use App\Jobs\RecordSessionDetails;
use App\Jobs\MarkChatMessageAsRead;
use Vinkla\Hashids\Facades\Hashids;
use App\Jobs\CacheWebRecorderAssets;
use App\Jobs\RecordTabVisibilityChange;
use Ratchet\RFC6455\Messaging\MessageInterface;
use BeyondCode\LaravelWebSockets\QueryParameters;
use BeyondCode\LaravelWebSockets\WebSockets\WebSocketHandler;
use BeyondCode\LaravelWebSockets\WebSockets\Channels\ChannelManager;

class WebRecorderHandler extends WebSocketHandler
{
    private $guestService;

    public function __construct(ChannelManager $channelManager, GuestService $guestService)
    {
        $this->guestService = $guestService;
        $this->channelManager = $channelManager;
        parent::__construct($channelManager);
    }


    public function onOpen(ConnectionInterface $connection)
    {
        $this
            ->verifyAppKey($connection)
            ->generateSocketId($connection)
            ->establishConnection($connection);

        $apiKey = QueryParameters::create($connection->httpRequest)->get('apiKey');

        $ipAddress = $connection->remoteAddress;
        $userAgent = $connection->httpRequest->getHeader('User-Agent')[0];

        $connection->send(json_encode([
            'event' => 'auth',
            'data' => json_encode([
                'session' => $this->guestService->getSession($apiKey, $ipAddress, $userAgent)->hash,
            ]),
        ]));
    }

    public function onMessage(ConnectionInterface $connection, MessageInterface $message)
    {
        $messagePayload = json_decode($message->getPayload());

        switch (str_replace('client-', '', $messagePayload->event)) {
            case 'initialize':
                dispatch(new CacheWebRecorderAssets($messagePayload->data));
                if (!$messagePayload->data->joiningEvent) {
                    dispatch(new RecordDomChanges($this->getId($messagePayload), $messagePayload->data));
                }
                break;
            case 'changes':
                dispatch(new RecordDomChanges($this->getId($messagePayload), $messagePayload->data));
                break;
            case 'click':
                dispatch(new RecordClick($this->getId($messagePayload), $messagePayload->data));
                break;
            case 'scroll':
                dispatch(new RecordScroll($this->getId($messagePayload), $messagePayload->data));
                break;
            case 'window-size':
                dispatch(new RecordWindowSize($this->getId($messagePayload), $messagePayload->data));
                break;
            case 'mouse-movement':
                dispatch(new RecordMouseMovement($this->getId($messagePayload), $messagePayload->data));
                break;
            case 'tab-visibility':
                dispatch(new RecordTabVisibilityChange($this->getId($messagePayload), $messagePayload->data));
                break;
            case 'network-request':
                dispatch(new RecordNetworkRequest($this->getId($messagePayload), $messagePayload->data));
                break;
            case 'console-message':
                dispatch(new RecordConsoleMessage($this->getId($messagePayload), $messagePayload->data));
                break;
            case 'session-details':
                dispatch(new RecordSessionDetails($this->getId($messagePayload), $messagePayload->data));
                break;
            case 'chat-message':
                dispatch(new RecordChatMessage($this->getId($messagePayload), $messagePayload->data));
                break;
            case 'mark-chat-message-as-read':
                dispatch(new MarkChatMessageAsRead($this->getId($messagePayload), $messagePayload->data));
                break;
            default:
                dump($messagePayload->event);
        }


        parent::onMessage($connection, $message);
    }

    private function getId($messagePayload)
    {
        return Hashids::decode(Str::after($messagePayload->channel, '.'))[0];
    }
}
