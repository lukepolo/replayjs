import { SiteState } from "./stateInterface";

export default function() {
  return {
    SAMPLE_GETTER: (state: SiteState) => {
      return state;
    },
  };
}
