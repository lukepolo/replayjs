import timing from "../helpers/timing";
import Recorder from "../recorder/Recorder";
import WebSocketService from "./WebSocketService";
import CaptureClicks from "../recorder/events/CaptureClicks";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import CaptureScrollEvents from "../recorder/events/CaptureScrollEvents";
import CaptureWindowResize from "../recorder/events/CaptureWindowResize";
import StreamOptionsInterface from "../interfaces/StreamOptionsInterface";
import InitializeDataInterface from "../interfaces/InitializeDataInterface";
import DomChangesDataInterface from "../interfaces/DomChangesDataInterface";
import CaptureMouseMovements from "../recorder/events/CaptureMouseMovements";
import CaptureSessionDetails from "../recorder/events/CaptureSessionDetails";
import CaptureConsoleMessages from "../recorder/events/CaptureConsoleMessages";
import CaptureNetworkRequests from "../recorder/events/CaptureNetworkRequests";
import CaptureTabVisibilityEvents from "../recorder/events/CaptureTabVisibilityEvents";

export default class RecordService {
  protected baseHref: string;
  protected recorder: Recorder;
  protected channel: NullPresenceChannel;
  protected webSocketService: WebSocketService;

  protected captureClicks: CaptureClicks;
  protected captureScrollEvents: CaptureScrollEvents;
  protected captureWindowResize: CaptureWindowResize;
  protected captureMouseMovements: CaptureMouseMovements;
  protected captureSessionDetails: CaptureSessionDetails;
  protected captureConsoleMessages: CaptureConsoleMessages;
  protected captureNetworkRequests: CaptureNetworkRequests;
  protected captureTabVisibilityEvents: CaptureTabVisibilityEvents;

  constructor(webSocketService: WebSocketService) {
    this.webSocketService = webSocketService;

    this.captureClicks = new CaptureClicks();
    this.captureScrollEvents = new CaptureScrollEvents();
    this.captureWindowResize = new CaptureWindowResize();
    this.captureSessionDetails = new CaptureSessionDetails();
    this.captureMouseMovements = new CaptureMouseMovements();
    this.captureConsoleMessages = new CaptureConsoleMessages();
    // this.captureNetworkRequests = new CaptureNetworkRequests();
    this.captureTabVisibilityEvents = new CaptureTabVisibilityEvents();

    this.recorder = new Recorder(
      document,
      (rootId, children) => {
        this.whisperInitialized({
          rootId,
          children,
          timing: timing(),
          baseHref: this.baseHref,
        });
      },
      (removed, addedOrMoved, attributes, text) => {
        this.whisperChanges({
          text,
          removed,
          attributes,
          addedOrMoved,
          timing: timing(),
        });
      },
    );
  }

  public connect(options: StreamOptionsInterface = {}) {
    this.baseHref = options.baseHref || window.location.origin;
    this.webSocketService.connect((channel) => {
      this.channel = channel
        .join(`stream.${this.webSocketService.getSession()}`)
        .here(() => {
          this.captureClicks.setup(this.channel);
          this.captureScrollEvents.setup(this.channel);
          this.captureWindowResize.setup(this.channel);
          this.captureMouseMovements.setup(this.channel);
          this.captureConsoleMessages.setup(this.channel);
          // this.captureNetworkRequests.setup(this.channel);
          this.captureTabVisibilityEvents.setup(this.channel);
          this.captureSessionDetails.sendDetails(this.channel);

          this.recorder.setup();

          // TODO - do this in the capture tab visibility events?
          window.addEventListener("focus", this.tabFocusActivity.bind(this));
          window.addEventListener("blur", this.tabFocusActivity.bind(this));
        });
    });
  }

  public teardown() {
    this.recorder.teardown();
    this.captureClicks.teardown();
    this.captureScrollEvents.teardown();
    this.captureWindowResize.teardown();
    this.captureMouseMovements.teardown();
    // this.captureConsoleMessages.teardown();
    this.captureNetworkRequests.teardown();
    this.captureNetworkRequests.teardown();
    this.captureTabVisibilityEvents.teardown();

    // TODO - do this in the capture tab visibility events?
    window.removeEventListener("focus", this.tabFocusActivity.bind(this));
    window.removeEventListener("blur", this.tabFocusActivity.bind(this));
  }

  private tabFocusActivity() {
    let tabHasFocus = document.hasFocus();
    if (tabHasFocus) {
      this.recorder.connect();
    } else {
      this.recorder.disconnect();
    }
    this.channel.whisper("focus-activity", {
      timing: timing(),
      tabHasFocus: tabHasFocus,
    });
  }

  private whisperInitialized(data: InitializeDataInterface) {
    this.channel.whisper("initialize", data);
  }

  private whisperChanges(data: DomChangesDataInterface) {
    this.channel.whisper("changes", data);
  }
}
