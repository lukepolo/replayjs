import { injectable, inject } from "inversify";

@injectable()
export default class RecordingService {
  protected httpService;

  constructor(@inject("HttpService") httpService) {
    this.httpService = httpService;
  }

  get() {
    return this.httpService.get(`api/recordings`);
  }

  show(recordingId) {
    return this.httpService.get(`api/recordings/${recordingId}`);
  }
}
