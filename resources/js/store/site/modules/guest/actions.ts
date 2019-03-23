import { ActionContext } from "vuex";
import RootState from "@store/rootState";
import { SiteGuestState } from "./stateInterface";
import GuestService from "@app/services/site/guest/SiteGuestService";

export default function(siteGuestService: GuestService) {
  return {
    get: (context: ActionContext<SiteGuestState, RootState>, siteId) => {
      return siteGuestService.get(siteId).then(({ data }) => {
        context.commit("SET_GUESTS", data);
        return data;
      });
    },
    show: (
      context: ActionContext<SiteGuestState, RootState>,
      { siteId, guestId },
    ) => {
      return siteGuestService.show(siteId, guestId).then(({ data }) => {
        context.commit("SET_GUEST", data);
        return data;
      });
    },
  };
}
