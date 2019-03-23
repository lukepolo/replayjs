import HttpService from "./../services/HttpService";

export default class AuthService {
  private identity;
  protected apiKey: string;
  protected httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  public async identify(apiKey) {
    this.apiKey = apiKey;
    this.identity = await this.httpService.post(
      `${__ENV_VARIABLES__.app.APP_URL}/api/identify`,
      {
        api_key: this.getApiKey(),
      },
    );
    // TODO - session refresh needed?
  }

  public getApiKey() {
    return this.apiKey;
  }

  public getSession() {
    if (this.identity) {
      return this.identity.session;
    }
  }

  public isAuthed() {
    return !!this.identity;
  }
}
