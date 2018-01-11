import Vue from "vue";
import Echo from "laravel-echo";
import ServiceProvider from "varie/lib/support/ServiceProvider";

/*
|--------------------------------------------------------------------------
| App Service Provider
|--------------------------------------------------------------------------
| You can bind various items to the app here, or can create other
| custom providers that bind the container
|
*/
export default class AppProvider extends ServiceProvider {
  public boot() {
    window.axios = require("axios");
    window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

    window.Pusher = require("pusher-js");

    // window.Pusher.log = msg => {
    //   console.log(msg);
    // };

    window.Echo = new Echo({
      broadcaster: 'socket.io',
      key: "934c66670cc35329e032c020d6a2bd67",
      authEndpoint: 'http://support-chat.test/broadcasting/auth',
      host: 'http://support-chat.test:6001',
    });
  }afk

  public register() {}
}
