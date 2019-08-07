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
      | Drivers provide a workflow for authentication.
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
        register: "/api/register",
        resetPassword: "/api/reset-password",
        forgotPassword: "/api/forgot-password",
      },

      /*
      |--------------------------------------------------------------------------
      | Cookie Name
      |--------------------------------------------------------------------------
      |
      | Never expose the full JWT to Javascript!
      |
      | Instead separate into two cookies one with the signature (HTTP only)
      | and the header/payload. This can allow you to detect your user scopes and if your user is logged in.
      |
      |
      |
      */
      cookieName: "token",
    },
  },
};
