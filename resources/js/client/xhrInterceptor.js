(function() {
  let origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    console.log("request started!", this, arguments);
    this.addEventListener("load", function() {
      console.log("request completed!");
      console.info(this);
      console.log(this.responseText);
    });

    this.addEventListener("error", function() {
      console.log("request error!");
      console.log(this);
    });

    origOpen.apply(this, arguments);
  };
})();

(function() {
  let originalFetch = fetch;
  fetch = function() {
    console.info("FETCH STARTED");
    return new Promise((resolve, reject) => {
      originalFetch
        .apply(this, arguments)
        .then(function(data) {
          console.info(data);
          resolve(data);
        })
        .catch((error) => {
          console.info("REQUEST FAILED");
          reject(error);
        });
    });
  };
})();
