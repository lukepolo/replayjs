import state from "./state";
import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import StoreModule from "varie/lib/state/StoreModule";
import { injectable, inject, unmanaged } from "inversify";

@injectable()
export default class SiteGuestChatStore extends StoreModule {
  constructor(@inject("SiteGuestChatService") siteGuestChatService) {
    super();
    this.setName("chat")
      .addState(state)
      .addActions(actions(siteGuestChatService))
      .addMutations(mutations)
      .addGetters(getters);
  }
}
