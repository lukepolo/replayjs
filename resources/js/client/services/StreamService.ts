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

export default class StreamService {
  protected mirrorClient: MirrorClient;
  protected captureClicks: CaptureClicks;
  protected channel: NullPresenceChannel;
  protected webSocketService: WebSocketService;
  protected initialTiming = new Date().getTime();
  protected captureScrollEvents: CaptureScrollEvents;
  protected captureWindowResize: CaptureWindowResize;
  protected captureMouseMovements: CaptureMouseMovements;
  protected captureSessionDetails: CaptureSessionDetails;
  protected captureConsoleMessages: CaptureConsoleMessages;
  protected captureNetworkRequests: CaptureNetworkRequests;

  constructor(socketConnection) {
    this.webSocketService = socketConnection;
  }

  public connect(
    options: {
      baseHref?: string;
    } = {},
  ) {
    this.webSocketService.connect().then((channel) => {
      this.channel = channel
        .join(`chat`) // TODO
        .here(() => {
          // Gets ran immediately after connecting
          this.mirrorClient.connect(this.channel);
          this.captureClicks.setup(this.channel);
          this.captureScrollEvents.setup(this.channel);
          this.captureWindowResize.setup(this.channel);
          this.captureMouseMovements.setup(this.channel);
          this.captureConsoleMessages.setup(this.channel);
          this.captureNetworkRequests.setup(this.channel);
          this.captureSessionDetails.sendDetails(this.channel);
        })
        .joining(() => {
          // When someone joins, we want setup the mirror again
          this.mirrorClient.connect(this.channel, true);
        });

      this.captureSessionDetails = new CaptureSessionDetails();
      this.mirrorClient = new MirrorClient(
        options.baseHref || window.location.origin,
        this.initialTiming,
      );

      this.captureClicks = new CaptureClicks(this.initialTiming);
      this.captureScrollEvents = new CaptureScrollEvents(this.initialTiming);
      this.captureWindowResize = new CaptureWindowResize(this.initialTiming);
      this.captureMouseMovements = new CaptureMouseMovements(
        this.initialTiming,
      );
      this.captureConsoleMessages = new CaptureConsoleMessages(
        this.initialTiming,
      );
      this.captureNetworkRequests = new CaptureNetworkRequests(
        this.initialTiming,
      );
    });
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
}
