let previousResults = {};

function getEvents(changes, event, options) {
  let events = [];
  if (!previousResults[event]) {
    previousResults[event] = {
      timing: 0,
      lastEvents: [],
    };
  }

  for (let timing in changes) {
    if (timing >= previousResults[event].timing) {
      for (let changeIndex in changes[timing]) {
        let change = changes[timing][changeIndex];
        if (!previousResults[event].lastEvents.includes(change)) {
          previousResults[event].lastEvents.push(change);
          events.push({
            event,
            timing,
            color: options.color,
          });
        }
      }
    }
  }

  return events;
}

onmessage = ({ data }) => {
  let session = data.session;

  postMessage({
    events: getEvents(session.dom_changes, "dom_changes", {
      color: "blue",
    })
      .concat(
        getEvents(session.mouse_clicks, "mouse_clicks", {
          color: "red",
        }),
      )
      .concat(
        getEvents(session.scroll_events, "scroll_events", {
          color: "purple",
        }),
      )
      .concat(
        getEvents(session.mouse_movements, "mouse_movements", {
          color: "gray",
        }),
      )
      .concat(
        getEvents(session.network_requests, "network_requests", {
          color: "orange",
        }),
      )
      .concat(
        getEvents(session.console_messages, "console_messages", {
          color: "pink",
        }),
      )
      .concat(
        getEvents(session.window_size_changes, "window_size_changes", {
          color: "purple",
        }),
      ),
  });
};
