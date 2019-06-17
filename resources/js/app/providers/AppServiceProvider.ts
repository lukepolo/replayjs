import { ServiceProvider } from "varie";
import SiteService from "@app/services/site/SiteService";
import GuestService from "@app/services/site/guest/SiteGuestService";
import SiteGuestSessionService from "@app/services/site/guest/session/SiteGuestSessionService";
import SiteGuestChatService from "@app/services/site/guest/chat/SiteGuestChatService";

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
    // @ts-ignore
    String.prototype.lpad = function(padString, length) {
      let str = this;
      while (str.length < length) str = padString + str;
      return str;
    };

    this.app.bind("SiteService", SiteService);
    this.app.bind("SiteGuestService", GuestService);
    this.app.bind("SiteGuestChatService", SiteGuestChatService);
    this.app.bind("SiteGuestSessionService", SiteGuestSessionService);
  }
}
