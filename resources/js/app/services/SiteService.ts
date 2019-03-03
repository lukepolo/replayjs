import { injectable, inject } from "inversify";

@injectable()
export default class SiteService {
  protected httpService;

  constructor(@inject("HttpService") httpService) {
    this.httpService = httpService;
  }

  get() {
    return this.httpService.get(`/api/sites`);
  }

  show(siteId) {
    return this.httpService.get(`/api/sites/${siteId}`);
  }

  store(data) {
    return this.httpService.post(`/api/site`, data);
  }
}
