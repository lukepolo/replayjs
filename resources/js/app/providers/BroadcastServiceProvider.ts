import BroadcastService from "@app/services/BroadcastService";
import ServiceProvider from "varie/lib/support/ServiceProvider";

/*
|--------------------------------------------------------------------------
| App Service Provider
|--------------------------------------------------------------------------
| You can bind various items to the app here, or can create other
| custom providers that bind the container
|
*/
export default class BroadcastServiceProvider extends ServiceProvider {
  public boot() {
    this.app.make("BroadcastService");
  }

  public register() {
    this.app.singleton("BroadcastService", BroadcastService);
  }
}
