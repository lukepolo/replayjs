# ReplayJS

ReplayJS is an Open Source Project to help support your clients with full session replays.

## Features

- Session Recording
  - JS Errors - TODO
  - Scrolling
  - Mouse Clicks
  - Mouse Movements
  - Network Traffic
  - Console Messages
  - Window Size Changes
  - Session / User Details
  - Filter Private Data - TODO
- Live Session Playback
- Co-Browsing - TODO
  - Drawling
  - Mouse Pointing
- Chat Support - TODO
  - Slack / Discord / Email Notifications
- Notifications - TODO
  - Network Errors
  - Console Errors
- Session Analytics - TODO
- Integrations - TODO

## Installation

1. Copy .env_example
   - `bash cp .env_example .env`
2. Composer install
   - `bash composer install`
3. Update .env
   - `bash php artisan key:generate`
4. NVM
   This allows you to change node / npm versions on the fly :
   - [Installing NVM](https://github.com/creationix/nvm)
   - Set your default node version
   - `bash nvm alias default 10.15.3`
5. Installing Node Modules
   - `bash nvm use`
   - `bash npm ci`
6. Building UI
   - `bash npm run dev`
7. Run Web Socket Server
   - `bash npm run websocket-server`
8. Start Workers
   - `bash php artisan horizon`

## Valet SPA Driver

-- TODO - get from dotfiles

## Fonts and CORS

By default fonts are no able to be cross site. To allow this we need to update our nginx config to allow CORS for fonts.

### Valet

Modify your nginx file (`/usr/local/etc/nginx/valet/valet.conf`) , to add a new CORS rule
inside of the `41c270e4-5535-4daa-b23e-c269744c2f4` location.

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

### Homestead

// TODO

## Storing Assets from other local sites

To allow PHP to know how to get assets from other local sites you need to add them to your host file (/etc/hosts).

### Valet

```bash
    ...

    127.0.0.1       localhost
    172.16.222.10   localdev

    127.0.0.1 varie-docs.test

    127.0.0.1 codepier.test
    127.0.0.1 app.codepier.test

    ...
```

### Homestaed

// TODO

## Common Problems

### Clashing Recordings / Sessions

When you refresh your database you will may leave left over recordings in redis.
You should clear your cache whenever you refresh your database.

`bash php artisan cache:clear`

## Built With

ReplayJS is built with Open Source technologies such as :

- [VarieJS](https://varie.io)
- [Laravel](https://laravel.com/)

## Other Credits

- [Mutation Summary](https://github.com/rafaelw/mutation-summary)
