import { RecordingState } from "./stateInterface";

export default function() {
  return {
    SAMPLE_GETTER: (state: RecordingState) => {
      return state;
    },
  };
}
