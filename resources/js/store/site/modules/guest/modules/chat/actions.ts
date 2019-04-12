import { ActionContext } from "vuex";
import RootState from "@store/rootState";
import { SiteGuestSessionState } from "./stateInterface";
import SiteGuestChatService from "@app/services/site/guest/chat/SiteGuestChatService";

export default function(siteGuestChatService: SiteGuestChatService) {
  return {
    get: (
      context: ActionContext<SiteGuestSessionState, RootState>,
      { siteId, guestId },
    ) => {
      return siteGuestChatService.get(siteId, guestId).then(({ data }) => {
        return data;
      });
    },
  };
}
