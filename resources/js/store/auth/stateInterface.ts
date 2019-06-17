export interface AuthState {
  guards: {
    user: object;
  };
  authAreaData: {
    email: string;
    password: string;
  };
}
