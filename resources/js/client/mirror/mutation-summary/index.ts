if (MutationObserver === undefined) {
  console.error("DOM Mutation Observers are required.");
  console.error(
    "https://developer.mozilla.org/en-US/docs/DOM/MutationObserver",
  );
  throw Error("DOM Mutation Observers are required");
}
