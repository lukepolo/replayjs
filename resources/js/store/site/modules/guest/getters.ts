import { SiteGuestState } from "./stateInterface";

export default function() {
  return {
    SAMPLE_GETTER: (state: SiteGuestState) => {
      return state;
    },
  };
}
