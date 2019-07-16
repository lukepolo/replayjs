import { playerEventTypes } from "@app/constants/playerEventTypes";

export default {
  [playerEventTypes.DomChange]: "orange",
  [playerEventTypes.MouseClick]: "orange",
  [playerEventTypes.NetworkRequest]: "green",
  [playerEventTypes.ConsoleMessage]: "red",
  [playerEventTypes.TabVisibility]: "black",
};
