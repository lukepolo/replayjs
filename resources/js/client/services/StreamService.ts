import MirrorClient from "../mirror/MirrorClient";
import WebSocketService from "./WebSocketService";
import CaptureClicks from "../events/CaptureClicks";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import CaptureScrollEvents from "../events/CaptureScrollEvents";
import CaptureWindowResize from "../events/CaptureWindowResize";
import CaptureSessionDetails from "../events/CaptureSessionDetails";
import CaptureMouseMovements from "../events/CaptureMouseMovements";
import CaptureConsoleMessages from "../events/CaptureConsoleMessages";
import CaptureNetworkRequests from "../events/CaptureNetworkRequests";
import CaptureShadowDomChanges from "../events/CaptureShadowDomChanges";
import StreamOptionsInterface from "../interfaces/StreamOptionsInterface";
import CaptureTabVisibilityEvents from "../events/CaptureTabVisibilityEvents";

export default class StreamService {
  protected mirrorClient: MirrorClient;
  protected captureClicks: CaptureClicks;
  protected channel: NullPresenceChannel;
  protected webSocketService: WebSocketService;
  protected captureScrollEvents: CaptureScrollEvents;
  protected captureWindowResize: CaptureWindowResize;
  protected captureMouseMovements: CaptureMouseMovements;
  protected captureSessionDetails: CaptureSessionDetails;
  protected captureConsoleMessages: CaptureConsoleMessages;
  protected captureNetworkRequests: CaptureNetworkRequests;
  protected captureShadowDomChanges: CaptureShadowDomChanges;
  protected captureTabVisibilityEvents: CaptureTabVisibilityEvents;

  constructor(webSocketService: WebSocketService) {
    this.webSocketService = webSocketService;
  }

  public connect(options: StreamOptionsInterface = {}) {
    this.boot(options);
    this.webSocketService.connect((channel) => {
      this.channel = channel
        .join(`stream.${this.webSocketService.getSession()}`)
        .here(() => {
          this.mirrorClient.setup(this.channel);
          this.captureClicks.setup(this.channel);
          this.captureScrollEvents.setup(this.channel);
          this.captureWindowResize.setup(this.channel);
          this.captureMouseMovements.setup(this.channel);
          // this.captureConsoleMessages.setup(this.channel);
          this.captureNetworkRequests.setup(this.channel);
          this.captureShadowDomChanges.setup(this.channel);
          this.captureTabVisibilityEvents.setup(this.channel);
          this.captureSessionDetails.sendDetails(this.channel);
        });
    });
  }

  protected disconnect() {
    this.mirrorClient.teardown();
    this.captureClicks.teardown();
    this.captureScrollEvents.teardown();
    this.captureWindowResize.teardown();
    this.captureMouseMovements.teardown();
    this.captureConsoleMessages.teardown();
    this.captureNetworkRequests.teardown();
  }

  protected boot(options: StreamOptionsInterface = {}) {
    this.captureSessionDetails = new CaptureSessionDetails();
    this.mirrorClient = new MirrorClient(
      options.baseHref || window.location.origin,
    );

    this.captureClicks = new CaptureClicks();
    this.captureScrollEvents = new CaptureScrollEvents();
    this.captureWindowResize = new CaptureWindowResize();
    this.captureMouseMovements = new CaptureMouseMovements();
    this.captureConsoleMessages = new CaptureConsoleMessages();
    this.captureNetworkRequests = new CaptureNetworkRequests();
    this.captureShadowDomChanges = new CaptureShadowDomChanges();
    this.captureTabVisibilityEvents = new CaptureTabVisibilityEvents();
  }
}
