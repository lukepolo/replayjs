const types = {
  dom_changes: {
    color: "gray",
  },
  mouse_clicks: {
    color: "orange",
  },
  scroll_events: {
    color: "purple",
  },
  network_requests: {
    color: "green",
  },
  console_messages: {
    color: "red",
  },
  window_size_changes: {
    color: "blue",
  },
  mouse_movements: {
    color: "gray",
  },
  tab_visibility: {
    color: "black",
  },
};

function addEvents(events) {
  postMessage(events);
}

function mapData(eventData) {
  return {
    type: eventData.type,
    timing: eventData.timing,
    color: types[eventData.type].color,
  };
}

onmessage = ({ data }) => {
  let eventData = data.data;
  switch (data.event) {
    case "addEvent":
      addEvents(mapData(eventData));
      break;
    case "addEvents":
      let events = [];
      Object.keys(types).forEach((type) => {
        for (let timing in eventData.session[type]) {
          events.push(
            mapData({
              type,
              timing,
            }),
          );
        }
      });
      addEvents(events);
      break;
  }
};
