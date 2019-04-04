onmessage = ({ data }) => {
  data.events.map((event) => {
    event.position = `${((event.timing - data.startingPosition) /
      (data.endingPosition - data.startingPosition)) *
      100}`;
    return event;
  });

  postMessage({
    events: data.events,
  });
};
