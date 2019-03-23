import { SiteGuestState } from "./stateInterface";

export default function() {
  return {
    SET_GUEST: (state: SiteGuestState, guest) => {
      state.guest = guest;
    },
    SET_GUESTS: (state: SiteGuestState, guests) => {
      state.guests = guests;
    },
  };
}
