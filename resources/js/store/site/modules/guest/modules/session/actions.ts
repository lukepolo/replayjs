import { ActionContext } from "vuex";
import RootState from "@store/rootState";
import { SiteGuestSessionState } from "./stateInterface";
import SiteGuestSessionService from "@app/services/site/guest/session/SiteGuestSessionService";

export default function(siteGuestSessionService: SiteGuestSessionService) {
  return {
    get: (
      context: ActionContext<SiteGuestSessionState, RootState>,
      { siteId, guestId },
    ) => {
      return siteGuestSessionService.get(siteId, guestId).then(({ data }) => {
        context.commit("SET_SESSIONS", data);
      });
    },
    show: (
      context: ActionContext<SiteGuestSessionState, RootState>,
      { siteId, guestId, sessionId },
    ) => {
      return siteGuestSessionService
        .show(siteId, guestId, sessionId)
        .then(({ data }) => {
          context.commit("SET_SESSION", data);
        });
    },
    addEvent(
      context: ActionContext<SiteGuestSessionState, RootState>,
      { event, changes },
    ) {
      // context.commit("ADD_EVENT", { event, changes })
    },
  };
}
