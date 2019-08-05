import AuthStore from "@store/auth/AuthStore";
import AuthService from "@app/services/AuthService";
import ConfigInterface from "varie/lib/config/ConfigInterface";
import AxiosHttpService from "varie/lib/http/AxiosHttpService";
import JwtDriver from "varie-auth-plugin/lib/drivers/JwtDriver";
import ServiceProvider from "varie/lib/support/ServiceProvider";
import AuthMiddleware from "varie-auth-plugin/lib/AuthMiddleware";
import StateServiceInterface from "varie/lib/state/StateServiceInterface";

export default class AuthServiceProvider extends ServiceProvider {
  public async boot() {
    let authService = this.app.make<AuthService>("AuthService");
    let $httpService = this.app.make<AxiosHttpService>("HttpService");
    let configService = this.app.make<ConfigInterface>("ConfigService");
    let stateService = this.app.make<StateServiceInterface>("StateService");

    $httpService.registerMiddleware(AuthMiddleware);
    stateService.registerStore(AuthStore);

    if (configService.get("auth.authOnBoot")) {
      await authService.isLoggedIn();
    }
  }

  public async register() {
    this.app.singleton("JwtDriver", JwtDriver);
    this.app.bind("AuthService", AuthService);
  }
}
