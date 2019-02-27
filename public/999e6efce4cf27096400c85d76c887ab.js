self.addEventListener("install", function (event) {
  console.info("[INSTALLED] ASSET SERVICE WORKER");
  event.waitUntil(self.skipWaiting()); // Activate worker immediately
});
self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim()); // Become available to all pages
});
self.addEventListener("fetch", function (event) {
  if (event.request.method === "GET") {
    console.info("TRYING TO GET : ".concat(event.request.url));
  } // event.respondWith(
  //   caches.open('shell').then((cache) => {
  //     return cache.match(event.request).then((response) => {
  //       if (response) {
  //         console.info('FROM CACHE', event.request.url);
  //       }
  //       return (
  //         response ||
  //         fetch(event.request)
  //         .then((networkResponse) => {
  //           console.info('FROM NETWORK', event.request.url);
  //           cache.put(event.request, networkResponse.clone());
  //           return networkResponse;
  //         })
  //         .catch(() => {
  //           console.info('FAILED FROM NETWORK', event.request.url);
  //         })
  //       );
  //     });
  //   })
  // );

});

self.onmessage = function (_ref) {
  var data = _ref.data;
  console.info(data);
};