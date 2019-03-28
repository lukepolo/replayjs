# ReplayJS

## Installation

1. Copy .env_example
2. Composer Install
3. NVM
   This allows you to change node / npm versions on the fly :
   - [Installing NVM](https://github.com/creationix/nvm)
   - Set your default node version
   - `bash nvm alias default {VESRION}`
   - npm install --global yarn
4. Installing Node Modules
   - `bash nvm use`
   - `bash npm ci`
5. Look at package.json to see commands to build
   - `bash npm run dev`
6. Run Web Socket Server
   - `bash npm run websocket-server`
7. Start Workers

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

ex :

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
