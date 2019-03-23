import { SiteGuestSessionState } from "./stateInterface";

export default function() {
  return {
    SET_SESSIONS: (state: SiteGuestSessionState, sessions) => {
      state.sessions = sessions;
    },
  };
}
