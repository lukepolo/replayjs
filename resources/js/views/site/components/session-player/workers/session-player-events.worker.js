import { playerEventTypes } from "@app/constants/playerEventTypes";
import playerTimingConverter from "@app/helpers/playerTimingConverter";

const types = {
  [playerEventTypes.DomChange]: {
    color: "red",
  },
  // [playerEventTypes.MouseClick]: {
  //   color: "orange",
  // },
  // [playerEventTypes.NetworkRequest]: {
  //   color: "green",
  // },
  // [playerEventTypes.ConsoleMessage]: {
  //   color: "red",
  // },
  // [playerEventTypes.TabVisibility]: {
  //   color: "black",
  // },
};

function addEvents(events) {
  postMessage(events);
}

function mapData(eventData, startingTime) {
  return {
    type: eventData.type,
    color: types[eventData.type].color,
    timing: playerTimingConverter(startingTime, eventData.timing),
  };
}

onmessage = ({ data }) => {
  let eventData = data.data;
  switch (data.event) {
    case "addEvent":
      if (types[eventData.type]) {
        addEvents(mapData(eventData, eventData.startingTime));
      }
      break;
    case "addEvents":
      let events = [];
      Object.keys(types).forEach((type) => {
        for (let timing in eventData.session[type]) {
          events.push(
            mapData(
              {
                type,
                timing,
              },
              eventData.startingTime,
            ),
          );
        }
      });
      addEvents(events);
      break;
  }
};
