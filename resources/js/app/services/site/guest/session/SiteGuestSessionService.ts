import { injectable, inject } from "inversify";

@injectable()
export default class SiteGuestSessionService {
  protected httpService;

  constructor(@inject("HttpService") httpService) {
    this.httpService = httpService;
  }

  get(siteId, guestId) {
    return this.httpService.get(
      `/api/sites/${siteId}/guests/${guestId}/sessions`,
    );
  }

  show(siteId, recordingId) {
    return this.httpService.get(`/api/sites/${siteId}/sessions/${recordingId}`);
  }
}
