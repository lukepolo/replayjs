import AuthStore from "@store/auth/AuthStore";
import AuthService from "@app/services/AuthService";
import ConfigInterface from "varie/lib/config/ConfigInterface";
import ServiceProvider from "varie/lib/support/ServiceProvider";
import AuthMiddleware from "varie-auth-plugin/lib/AuthMiddleware";
import CookieDriver from "varie-auth-plugin/lib/drivers/CookieDriver";
import HttpServiceInterface from "varie/lib/http/HttpServiceInterface";
import StateServiceInterface from "varie/lib/state/StateServiceInterface";
import AuthServiceInterface from "varie-auth-plugin/lib/AuthServiceInterface";

export default class AuthServiceProvider extends ServiceProvider {
  public async boot() {
    let authService = this.app.make<AuthServiceInterface>("AuthService");
    let configService = this.app.make<ConfigInterface>("ConfigService");
    let $httpService = this.app.make<HttpServiceInterface>("HttpService");
    let stateService = this.app.make<StateServiceInterface>("StateService");

    // @ts-ignore - fix after new varie release
    $httpService.registerMiddleware(AuthMiddleware);
    stateService.registerStore(AuthStore);

    if (configService.get("auth.authOnBoot")) {
      await authService.isLoggedIn();
    }
  }

  public async register() {
    this.app.bind("AuthService", AuthService);
    this.app.singleton("CookieDriver", CookieDriver);
  }
}
