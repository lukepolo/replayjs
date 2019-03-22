import HttpService from "./../services/HttpService";

export default class AuthService {
  protected identity;
  protected httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  public async identify(apiKey) {
    return (this.identity = await this.httpService.post(
      `${__ENV_VARIABLES__.app.APP_URL}/api/identify`,
      {
        api_key: apiKey,
      },
    ));
  }

  public getIdentity() {
    return this.identity;
  }

  public isAuthed() {
    return !!this.identity;
  }
}
