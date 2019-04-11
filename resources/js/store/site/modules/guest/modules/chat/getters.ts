import { SiteGuestSessionState } from "./stateInterface";

export default function() {
  return {
    SAMPLE_GETTER: (state: SiteGuestSessionState) => {
      return state;
    },
  };
}
