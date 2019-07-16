import playerTimingConverter from "@app/helpers/playerTimingConverter";
import playerEventTickTypes from "@app/constants/playerEventTickTypes";

let events = {};
let startingTime;

function addEvent(type, timing) {
  if (!events[type]) {
    events[type] = [];
  }
  events[type].push(playerTimingConverter(startingTime, timing));
}

onmessage = ({ data }) => {
  let eventData = data.data;

  switch (data.event) {
    case "addEvent":
      if (playerEventTickTypes.indexOf(eventData.type) > -1) {
        this.addEvent(eventData.type, eventData.timing);
      }
      break;
    case "addEvents":
      startingTime = eventData.startingTime;
      playerEventTickTypes.forEach((type) => {
        for (let timing in eventData.session[type]) {
          addEvent(type, timing);
        }
      });
      break;
  }
  postMessage(events);
};
