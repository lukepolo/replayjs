export default {
  /*
  |--------------------------------------------------------------------------
  | Authentication when booting application
  |--------------------------------------------------------------------------
  |
  | While the application is booted, we can get the user before rendering the frontend.
  |
  */
  authOnBoot: true,

  /*
  |--------------------------------------------------------------------------
  | Authentication Guards
  |--------------------------------------------------------------------------
  |
  | Guards allow you to customize the workflow of each authentication strategies.
  |
  */
  defaults: {
    guard: "user",
  },
  guards: {
    user: {
      /*
      |--------------------------------------------------------------------------
      | Drivers
      |--------------------------------------------------------------------------
      |
      | Each driver has there advantages and disadvantages.
      |
      | There are multiple drivers that Varie provides out of the box, both require additional backend configurations.
      | Please be caution of each driver as they both require extra steps to be secure.
      |
      | JWT Storage Driver
      |
      | This driver is useful when your in a mobile app / contained environment that does not allow other
      | sessions to access the local storage.
      |
      | Cookie Driver
      |
      | This is the preferred web driver that uses cookie based authentication.
      | This driver assumes you only support browsers that can use the `same site attribute` on a cookie.
      | https://caniuse.com/#feat=same-site-cookie-attribute
      |
      |
      | Read more about drivers :
      | https://varie.io/docs/latest/authentication#drivers
      |
      */
      driver: "CookieDriver",

      /*
      |--------------------------------------------------------------------------
      | Login Behavior
      |--------------------------------------------------------------------------
      |
      | After registration / resetting their password, should they be forced
      | to re-login with that same password.
      |
      */
      loginAfterReset: true,
      loginAfterRegister: true,

      /*
      |--------------------------------------------------------------------------
      | API Endpoints
      |--------------------------------------------------------------------------
      |
      | These are the necessary endpoints to make Varie authentication work.
      |
      */
      endpoints: {
        user: "/api/me",
        login: "/api/login",
        logout: "/api/logout",
        refresh: "/api/refresh",
        register: "/api/register",
        resetPassword: "/api/reset-password",
        forgotPassword: "/api/forgot-password",
      },

      /*
      |--------------------------------------------------------------------------
      | Strategy Configs
      |--------------------------------------------------------------------------
      |
      */
      cookie: {
        /*
        |--------------------------------------------------------------------------
        | Name
        |--------------------------------------------------------------------------
        |
        | When using the Cookie Driver there are a couple of ways handling it with a spa.
        | You may set a cookie to determine if you are still logged in. If you supply
        | the config with a name it will look for it, only when it is filled will it
        | attempt to get your user.
        |
        */
        name: "token",
      },
      token: {
        /*
        |--------------------------------------------------------------------------
        |  Token Information
        |--------------------------------------------------------------------------
        |
        | The storage path is where we set it into the locale storage. We prefix
        | each storage with the guards names.
        |
        */
        storagePath: "auth",

        /*
        |--------------------------------------------------------------------------
        |  Token Information
        |--------------------------------------------------------------------------
        |
        | When logging in your response will contain necessary information that
        | Varie needs to handle your authentication. Let Varie know where to
        | pull the information from the response.
        |
        | Expires In: should supply the number of seconds it will expire in
        |
        | Access Token: Is what should be sent back into the headers of all requests.
        |
        | Token Type Name: Should be the Authorize token type for the header request.
        |
        */
        expiresIn: "expires_in",
        accessToken: "access_token",
        tokenTypeName: "token_type",

        /*
        |--------------------------------------------------------------------------
        | Refresh Token (optional)
        |--------------------------------------------------------------------------
        |
        | This field is optional, when supplied Varie will automatically
        | try to refresh your token with the supplied field.
        |
        */
        refreshToken: "refresh_token",
      },
    },
  },
};
