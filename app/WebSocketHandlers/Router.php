<?php

namespace App\WebSocketHandlers;

use App\WebSocketHandlers\WebRecorderHandler;

class Router extends \BeyondCode\LaravelWebSockets\Server\Router
{
    public function __construct()
      {
          parent::__construct();
          $this->webSocket('/web-recorder', WebRecorderHandler::class);
     }
}
