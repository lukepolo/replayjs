export default class HttpService {
  public get(url) {
    return this.makeRequest("get", url);
  }

  public post(url, data): any {
    return this.makeRequest("post", url, data);
  }

  private makeRequest(method, url, data = null) {
    return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader("Content-type", "application/json");

      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          return resolve(JSON.parse(xhr.response));
        }
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      };

      xhr.onerror = function() {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      };

      xhr.send(JSON.stringify(data));
    });
  }
}
