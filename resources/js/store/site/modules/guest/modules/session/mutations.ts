import { SiteGuestSessionState } from "./stateInterface";

export default function() {
  return {
    SET_SESSION: (state: SiteGuestSessionState, session) => {
      state.session = session;
    },
    SET_SESSIONS: (state: SiteGuestSessionState, sessions) => {
      state.sessions = sessions;
    },
    ADD_EVENT: (state: SiteGuestSessionState, { event, changes }) => {
      console.info("ADDING EVENT");
      if (!state.session[event][changes.timing]) {
        state.session[event][changes.timing] = [];
      }
      state.session[event][changes.timing].push(changes);
      state.session = Object.assign({}, state.session);
    },
  };
}
