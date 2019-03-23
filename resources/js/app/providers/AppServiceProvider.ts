import { ServiceProvider } from "varie";
import SiteService from "@app/services/site/SiteService";
import GuestService from "@app/services/site/guest/SiteGuestService";
import SiteGuestSessionService from "@app/services/site/guest/session/SiteGuestSessionService";

/*
|--------------------------------------------------------------------------
| App Service Provider
|--------------------------------------------------------------------------
| You can bind various items to the app here, or can create other
| custom providers that bind the container
|
*/
export default class AppProviderServiceProvider extends ServiceProvider {
  public async boot() {
    // ...
  }

  public async register() {
    this.app.bind("SiteService", SiteService);
    this.app.bind("SiteGuestService", GuestService);
    this.app.bind("SiteGuestSessionService", SiteGuestSessionService);
  }
}
