import { SiteGuestSessionState } from "./stateInterface";

export default function() {
  return {
    SET_SESSION: (state: SiteGuestSessionState, session) => {
      state.session = session;
    },
    SET_SESSIONS: (state: SiteGuestSessionState, sessions) => {
      state.sessions = sessions;
    },
  };
}
