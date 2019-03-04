declare global {
  interface Window {
    replayjsQueue: Array<any>;
  }
}

import MirrorClient from "./MirrorClient";
import SocketConnection from "./SocketConnection";
import CaptureClicks from "./events/CaptureClicks";
import CaptureScrollEvents from "./events/CaptureScrollEvents";
import CaptureWindowResize from "./events/CaptureWindowResize";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import CaptureMouseMovements from "./events/CaptureMouseMovements";
import CaptureSessionDetails from "./events/CaptureSessionDetails";
import CaptureNetworkRequests from "./events/CaptureNetworkRequests";

export default class Client {
  protected apiKey;
  protected mirrorClient: MirrorClient;
  protected captureClicks: CaptureClicks;
  protected channel: NullPresenceChannel;
  protected socketConnection: SocketConnection;
  protected initialTiming = new Date().getTime();
  protected captureWindowResize: CaptureWindowResize;
  protected captureScrollEvents: CaptureScrollEvents;
  protected captureMouseMovements: CaptureMouseMovements;
  protected captureNetworkRequests: CaptureNetworkRequests;

  constructor() {
    window.replayjsQueue.forEach((args) => {
      this[args[0]](args[1]);
    });

    if (!this.apiKey) {
      throw Error("You need to set your API Key.");
    }

    this.socketConnection = new SocketConnection(this.apiKey);
    this.mirrorClient = new MirrorClient(this.channel, this.initialTiming);
    this.captureClicks = new CaptureClicks(this.channel, this.initialTiming);
    this.captureScrollEvents = new CaptureScrollEvents(
      this.channel,
      this.initialTiming,
    );
    this.captureWindowResize = new CaptureWindowResize(
      this.channel,
      this.initialTiming,
    );
    this.captureMouseMovements = new CaptureMouseMovements(
      this.channel,
      this.initialTiming,
    );
    this.captureNetworkRequests = new CaptureNetworkRequests(
      this.channel,
      this.initialTiming,
    );
  }

  protected setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  public stream() {
    this.channel = this.socketConnection
      .connect()
      .join(`chat`)
      .here(() => {
        // Gets ran immediately after connecting
        this.mirrorClient.connect();
        this.captureClicks.setup();
        this.captureScrollEvents.setup();
        this.captureWindowResize.setup();
        this.captureMouseMovements.setup();
        this.captureNetworkRequests.setup();
        new CaptureSessionDetails(this.channel, this.apiKey);
      })
      .joining(() => {
        // When someone joins, we want setup the mirror again
        this.mirrorClient.connect();
      });
  }

  public disconnect() {
    this.mirrorClient.disconnect();
    this.captureClicks.teardown();
    this.captureScrollEvents.teardown();
    this.captureWindowResize.teardown();
    this.captureMouseMovements.teardown();
    this.captureNetworkRequests.teardown();
  }
}
new Client();
