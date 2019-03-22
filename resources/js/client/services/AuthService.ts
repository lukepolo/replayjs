import HttpService from "./../services/HttpService";

export default class AuthService {
  protected httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  public identify(apiKey) {
    return this.httpService.post(
      `${__ENV_VARIABLES__.app.APP_URL}/api/identify`,
      {
        api_key: apiKey,
      },
    );
  }
}
