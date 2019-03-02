import { AuthState } from "./stateInterface";

export default function(authService) {
  return {
    user: (state: AuthState) => (guard) => {
      return state.guards[guard || authService.getDefaultGuard()];
    },
  };
}
