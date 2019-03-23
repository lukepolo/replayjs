import state from "./state";
import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import StoreModule from "varie/lib/state/StoreModule";
import { injectable, inject, unmanaged } from "inversify";
import SiteGuestStore from "@store/site/modules/guest/SiteGuestStore";

@injectable()
export default class SiteStore extends StoreModule {
  constructor(@inject("SiteService") siteService) {
    super();
    this.setName("site")
      .addState(state)
      .addActions(actions(siteService))
      .addMutations(mutations)
      .addGetters(getters)
      .addModule(SiteGuestStore);
  }
}
