import CaptureConsoleMessages from "./events/CaptureConsoleMessages";

declare global {
  interface Window {
    replayjsQueue: ((fn: string, data: any) => void) | Array<any>;
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
  protected captureScrollEvents: CaptureScrollEvents;
  protected captureWindowResize: CaptureWindowResize;
  protected captureMouseMovements: CaptureMouseMovements;
  protected captureSessionDetails: CaptureSessionDetails;
  protected captureConsoleMessages: CaptureConsoleMessages;
  protected captureNetworkRequests: CaptureNetworkRequests;

  constructor() {
    if (Array.isArray(window.replayjsQueue)) {
      window.replayjsQueue.forEach((args) => {
        this[args[0]](args[1]);
      });
    }

    window.replayjsQueue = (fn, data) => {
      this[fn](data);
    };

    if (!this.apiKey) {
      throw Error("You need to set your API Key.");
    }

    this.socketConnection = new SocketConnection(this.apiKey);
    this.mirrorClient = new MirrorClient(this.channel, this.initialTiming);
    this.captureClicks = new CaptureClicks(this.channel, this.initialTiming);
    this.captureSessionDetails = new CaptureSessionDetails(
      this.channel,
      this.apiKey,
    );
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
    this.captureConsoleMessages = new CaptureConsoleMessages(
      this.channel,
      this.initialTiming,
    );
    this.captureNetworkRequests = new CaptureNetworkRequests(
      this.channel,
      this.initialTiming,
    );
  }

  protected setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  protected clientDetails(data: object) {
    this.captureSessionDetails.set(data);
    if (this.channel) {
      this.captureSessionDetails.sendDetails();
    }
  }

  protected stream() {
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
        this.captureConsoleMessages.setup();
        this.captureNetworkRequests.setup();
        this.captureSessionDetails.sendDetails();
      })
      .joining(() => {
        // When someone joins, we want setup the mirror again
        this.mirrorClient.connect(true);
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
new Client();
