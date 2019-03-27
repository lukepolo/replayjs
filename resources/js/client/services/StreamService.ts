import AuthService from "./AuthService";
import MirrorClient from "../MirrorClient";
import WebSocketService from "./WebSocketService";
import CaptureClicks from "../events/CaptureClicks";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import CaptureScrollEvents from "../events/CaptureScrollEvents";
import CaptureWindowResize from "../events/CaptureWindowResize";
import CaptureSessionDetails from "../events/CaptureSessionDetails";
import CaptureMouseMovements from "../events/CaptureMouseMovements";
import CaptureConsoleMessages from "../events/CaptureConsoleMessages";
import CaptureNetworkRequests from "../events/CaptureNetworkRequests";

interface OptionsInterface {
  baseHref?: string;
}

export default class StreamService {
  protected authService: AuthService;
  protected mirrorClient: MirrorClient;
  protected captureClicks: CaptureClicks;
  protected channel: NullPresenceChannel;
  protected webSocketService: WebSocketService;
  protected initialTiming;
  protected captureScrollEvents: CaptureScrollEvents;
  protected captureWindowResize: CaptureWindowResize;
  protected captureMouseMovements: CaptureMouseMovements;
  protected captureSessionDetails: CaptureSessionDetails;
  protected captureConsoleMessages: CaptureConsoleMessages;
  protected captureNetworkRequests: CaptureNetworkRequests;

  constructor(authService: AuthService, webSocketService: WebSocketService) {
    this.authService = authService;
    this.webSocketService = webSocketService;
  }

  public connect(options: OptionsInterface = {}) {
    this.initialTiming = new Date().getTime();
    if (this.authService.isAuthed()) {
      this.boot(options);
      return this.webSocketService.connect().then((channel) => {
        this.channel = channel
          .join(`stream.${this.authService.getSession()}`)
          .here(() => {
            this.mirrorClient.connect(this.channel);
            this.captureClicks.setup(this.channel);
            this.captureScrollEvents.setup(this.channel);
            this.captureWindowResize.setup(this.channel);
            this.captureMouseMovements.setup(this.channel);
            this.captureConsoleMessages.setup(this.channel);
            this.captureNetworkRequests.setup(this.channel);
            this.captureSessionDetails.sendDetails(this.channel);
          });
      });
    }
    throw Error("There was an error connecting you to the client.");
  }

  protected disconnect() {
    this.mirrorClient.disconnect();
    this.captureClicks.teardown();
    this.captureScrollEvents.teardown();
    this.captureWindowResize.teardown();
    this.captureMouseMovements.teardown();
    this.captureConsoleMessages.teardown();
    this.captureNetworkRequests.teardown();
  }

  protected boot(options: OptionsInterface = {}) {
    this.captureSessionDetails = new CaptureSessionDetails();
    this.mirrorClient = new MirrorClient(
      options.baseHref || window.location.origin,
      this.initialTiming,
    );

    this.captureClicks = new CaptureClicks(this.initialTiming);
    this.captureScrollEvents = new CaptureScrollEvents(this.initialTiming);
    this.captureWindowResize = new CaptureWindowResize(this.initialTiming);
    this.captureMouseMovements = new CaptureMouseMovements(this.initialTiming);
    this.captureConsoleMessages = new CaptureConsoleMessages(
      this.initialTiming,
    );
    this.captureNetworkRequests = new CaptureNetworkRequests(
      this.initialTiming,
    );
  }
}
