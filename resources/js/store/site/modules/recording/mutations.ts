import { RecordingState } from "./stateInterface";

export default function() {
  return {
    SET_RECORDING: (state: RecordingState, data) => {
      state.recording = data;
    },
    SET_RECORDINGS: (state: RecordingState, data) => {
      state.recordings = data;
    },
  };
}
