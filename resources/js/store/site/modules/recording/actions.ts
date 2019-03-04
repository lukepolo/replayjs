import { ActionContext } from "vuex";
import RootState from "../../../rootState";
import { RecordingState } from "./stateInterface";
import RecordingService from "../../../../app/services/RecordingService";

export default function(recordingService: RecordingService) {
  return {
    get: (context: ActionContext<RecordingState, RootState>, siteId) => {
      return recordingService.get(siteId).then(({ data }) => {
        context.commit("SET_RECORDINGS", data);
      });
    },
    show: (
      context: ActionContext<RecordingState, RootState>,
      { site, recording },
    ) => {
      return recordingService.show(site, recording).then(({ data }) => {
        context.commit("SET_RECORDING", data);
      });
    },
  };
}