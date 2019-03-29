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
};

function addEvent(event) {
  postMessage({
    type: event.type,
    timing: event.timing,
    color: types[event.type].color,
  });
}

onmessage = ({ data }) => {
  let eventData = data.data;
  switch (data.event) {
    case "addEvent":
      addEvent(eventData);
      break;
    case "addEvents":
      Object.keys(types).forEach((type) => {
        for (let timing in eventData.session[type]) {
          addEvent({
            type,
            timing: timing,
          });
        }
      });
      break;
  }
};
