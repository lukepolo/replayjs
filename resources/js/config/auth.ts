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
        user: "/auth/me",
        login: "/auth/login",
        logout: "/auth/logout",
        refresh: "/auth/refresh",
        register: "/auth/register",
        resetPassword: "/auth/reset-password",
        forgotPassword: "/auth/forgot-password",
      },
      token: {
        expiresIn: "expires_in",
        accessToken: "access_token",
        tokenTypeName: "token_type",
      },
    },
  },
};
