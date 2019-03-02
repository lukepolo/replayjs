import { AuthState } from "./stateInterface";

export default function() {
  return {
    SET_AUTH_USER: (state: AuthState, { user, guard = "user" }) => {
      state.guards[guard] = user;
    },
    REMOVE_AUTH: (state: AuthState, guard = "user") => {
      state.guards[guard] = null;
    },
    UPDATE_AUTH_AREA_DATA: (state: AuthState, data) => {
      state.authAreaData = Object.assign(state.authAreaData, data);
    },
    RESET_AUTH_AREA_DATA: (state: AuthState) => {
      state.authAreaData = Object.assign(state.authAreaData, {
        email: null,
        password: null,
      });
    },
  };
}
