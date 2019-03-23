import state from "./state";
import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import StoreModule from "varie/lib/state/StoreModule";
import { injectable, inject, unmanaged } from "inversify";

@injectable()
export default class SiteGuestSessionStore extends StoreModule {
  constructor(@inject("SiteGuestSessionService") siteGuestSessionService) {
    super();
    this.setName("session")
      .addState(state)
      .addActions(actions(siteGuestSessionService))
      .addMutations(mutations)
      .addGetters(getters);
  }
}
