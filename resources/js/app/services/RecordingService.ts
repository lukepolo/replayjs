import { injectable, inject } from "inversify";

@injectable()
export default class RecordingService {
  protected httpService;

  constructor(@inject("HttpService") httpService) {
    this.httpService = httpService;
  }

  get(siteId) {
    return this.httpService.get(`/api/sites/${siteId}/recordings`);
  }

  show(siteId, recordingId) {
    return this.httpService.get(
      `/api/sites/${siteId}/recordings/${recordingId}`,
    );
  }
}
