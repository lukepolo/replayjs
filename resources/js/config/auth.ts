export default {
  authOnBoot: true,
  defaults: {
    guard: "user",
    storagePath: "auth",
  },
  guards: {
    user: {
      driver: "JwtDriver", // or CookieDriver
      refreshToken: true,
      loginAfterReset: true,
      loginAfterRegister: true,
      endpoints: {
        user: "/api/me",
        login: "/api/login",
        logout: "/api/logout",
        refresh: "/api/refresh",
        register: "/api/register",
        resetPassword: "/api/reset-password",
        forgotPassword: "/api/forgot-password",
      },
      token: {
        expiresIn: "expires_in",
        accessToken: "access_token",
        tokenTypeName: "token_type",
      },
    },
  },
};
