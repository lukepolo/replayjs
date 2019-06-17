import state from "./state";
import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import { injectable, inject } from "inversify";
import AuthService from "@app/services/AuthService";
import StoreModule from "varie/lib/state/StoreModule";

@injectable()
export default class AuthStore extends StoreModule {
  constructor(@inject("AuthService") authService: AuthService) {
    super();
    this.setName("auth")
      .addState(state)
      .addActions(actions(authService))
      .addMutations(mutations())
      .addGetters(getters(authService));
  }
}
