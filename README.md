# !!! STILL IN EARLY DEVELOPMENT !!!

# ReplayJS

ReplayJS is an Open Source Project to help support your clients with full session replays.

## Planned Features

- Session Recording
  - [x] Input Events
  - [x] Scrolling
  - [x] Mouse Clicks
  - [x] Mouse Movements
  - [x] Network Traffic
  - [x] Window Size Changes
  - [x] Tab Visibility
  - [x] Session / User Details
  - [x] Live Session Playback
  - [ ] Hovering Events
  - [ ] Console Messages
  - [ ] JS Errors
  - [ ] IFrame Support
  - [ ] Shadow Dom Support
  - [ ] Session Share
  - Privacy
    - [ ] Exclude Elements
    - [ ] Blacklist / Whitelist
    - [ ] XHR stripping
- Co-Browsing
  - [ ] Drawling
  - [ ] Mouse Pointing
- [ ] Screen Share
- [ ] Live Chat
- Notifications
  - [ ] Slack
  - [ ] Discord
  - [ ] Email Notifications
- [ ] Page Metrics
- [ ] Session Events
- [ ] Basic Analytics
- [ ] Integration Plugin System

## Issues

There are some issues that need to be solved. Issues when you have two
sessions opened at the same time.

Currently how it works is we take their IP address, and their user agent and get
there session based on the last activity. A new session is generated if there is
not another session active within the last hour.

This causes problems as they could open two windows at the same site.
We may need to generate another token , or store that information somewhere in the
browser (which a person could change, so we have to be careful).

There is no 100% way to guarantee chat will be safe! We dont really know if that user
is the same user as before.

## Installation

1. Copy .env_example
   - `cp .env_example .env`
2. Composer install
   - `composer install`
3. Update .env
   - `php artisan key:generate`
4. Migrate
   - `php artisan migrate -- seed`
5. NVM
   This allows you to change node / npm versions on the fly :
   - [Installing NVM](https://github.com/creationix/nvm)
   - Set your default node version
   - `nvm alias default 10.15.3`
6. Ins``talling Node Modules
   - `nvm use`
   - `npm ci`
7. Building UI
   - `npm run dev`

## Running The application

1. Run Web Socket Server
   - `npm run websocket-server`
2. Start Workers
   - `php artisan horizon`

## Fonts and CORS

By default fonts are no able to be cross site. To allow this we need to update our nginx config to allow CORS for fonts.

### Laravel Valet (https://laravel.com/docs/5.8/valet)

If your using Valet you can modify your nginx file (`/usr/local/etc/nginx/valet/valet.conf`) , to add a new CORS rule
inside of the `location` config, `41c270e4-5535-4daa-b23e-c269744c2f45`, this comes fromm `VALET_STATIC_PREFIX`.

```bash

    location /41c270e4-5535-4daa-b23e-c269744c2f45/ {
        internal;
        alias /;
        ### FONT CORS RULE
        location ~* \.(eot|otf|ttf|woff|woff2)$ {
            add_header Access-Control-Allow-Origin *;
        }
        try_files $uri $uri/;
    }

```

## Storing Assets from other local sites

To allow PHP to know how to get assets from other local sites you need to add them to your host file (/etc/hosts).

```bash
    ...

    127.0.0.1       localhost
    172.16.222.10   localdev

    127.0.0.1 varie-docs.test

    127.0.0.1 codepier.test
    127.0.0.1 app.codepier.test

    ...
```

## Common Problems

### Clashing Recordings / Sessions

When you refresh your database you will may leave left over recordings in redis.
You should clear your cache whenever you refresh your database.

`php artisan cache:clear`

## Built With

ReplayJS is built with Open Source technologies, highlighted packages are:

- [VarieJS](https://varie.io)
- [Laravel](https://laravel.com/)
- [Laravel Echo](https://laravel.com/docs/5.8/broadcasting)
- [Laravel Horizon](https://laravel.com/docs/master/horizon)
- [Laravel WebSockets](https://github.com/beyondcode/laravel-websockets)

## Other Credits

- [Mutation Summary](https://github.com/rafaelw/mutation-summary)
