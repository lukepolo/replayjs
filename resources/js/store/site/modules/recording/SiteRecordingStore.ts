import state from "./state";
import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import StoreModule from "varie/lib/state/StoreModule";
import { injectable, inject, unmanaged } from "inversify";

@injectable()
export default class SiteRecordingStore extends StoreModule {
  constructor(@inject("RecordingService") recordingService) {
    super();
    this.setName("recording")
      .addState(state)
      .addActions(actions(recordingService))
      .addMutations(mutations)
      .addGetters(getters);
  }
}
