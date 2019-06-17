import { injectable, inject } from "inversify";
import VarieAuthService from "varie-auth-plugin/lib/AuthService";
import ConfigInterface from "varie/lib/config/ConfigInterface";
import HttpServiceInterface from "varie/lib/http/HttpServiceInterface";
import StorageServiceInterface from "varie/lib/storage/StorageServiceInterface";

@injectable()
export default class AuthService extends VarieAuthService {
  protected storageService: StorageServiceInterface;

  constructor(
    @inject("app") app,
    @inject("ConfigService") configService: ConfigInterface,
    @inject("HttpService") httpService: HttpServiceInterface,
    @inject("StorageService") storageService: StorageServiceInterface,
  ) {
    super(app, configService, httpService);
    this.app = app;
    this.httpService = httpService;
    this.configService = configService;
    this.storageService = storageService;
  }
  /*
  |--------------------------------------------------------------------------
  | You can customize how each method works for your application
  |--------------------------------------------------------------------------
  |
  | We have setup some defaults that probably wont match what you need,
  | feel free to "overload" them.
  |
  */

  public getJwt() {
    return JSON.parse(this.storageService.get(`${this.getStoragePath()}.user`))
      .access_token;
  }
}
