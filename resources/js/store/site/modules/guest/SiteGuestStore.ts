import state from "./state";
import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import StoreModule from "varie/lib/state/StoreModule";
import { injectable, inject, unmanaged } from "inversify";
import SiteGuestSessionStore from "@store/site/modules/guest/modules/session/SiteGuestSessionStore";

@injectable()
export default class SiteGuestStore extends StoreModule {
  constructor(@inject("SiteGuestService") siteGuestService) {
    super();
    this.setName("guest")
      .addState(state)
      .addActions(actions(siteGuestService))
      .addMutations(mutations)
      .addGetters(getters)
      .addModule(SiteGuestSessionStore);
  }
}
