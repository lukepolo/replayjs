import { ActionContext } from "vuex";
import RootState from "../rootState";
import { RecordingState } from "./stateInterface";
import RecordingService from "@app/services/RecordingService";

export default function(recordingService: RecordingService) {
  return {
    get: (context: ActionContext<RecordingState, RootState>, data) => {
      return recordingService.get().then(({ data }) => {
        context.commit("SET_RECORDINGS", data);
      });
    },
    show: (context: ActionContext<RecordingState, RootState>, recordingId) => {
      return recordingService.show(recordingId).then(({ data }) => {
        context.commit("SET_RECORDING", data);
      });
    },
  };
}
