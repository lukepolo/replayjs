import { injectable, inject } from "inversify";

@injectable()
export default class SiteGuestService {
  protected httpService;

  constructor(@inject("HttpService") httpService) {
    this.httpService = httpService;
  }

  get(siteId) {
    return this.httpService.get(`/api/sites/${siteId}/guests`);
  }

  show(siteId, guestId) {
    return this.httpService.get(`/api/sites/${siteId}/guests/${guestId}`);
  }

  store(data) {
    return this.httpService.post(`/api/sites`, data);
  }
}
