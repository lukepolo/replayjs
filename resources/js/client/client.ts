import CaptureConsoleMessages from "./events/CaptureConsoleMessages";

declare global {
  interface Window {
    replayjsQueue: Array<any>;
    replayjs: (fn: string, data: any) => any;
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
  protected _baseHref = window.location.origin;
  protected socketConnection: SocketConnection;
  protected initialTiming = new Date().getTime();
  protected captureScrollEvents: CaptureScrollEvents;
  protected captureWindowResize: CaptureWindowResize;
  protected captureMouseMovements: CaptureMouseMovements;
  protected captureSessionDetails: CaptureSessionDetails;
  protected captureConsoleMessages: CaptureConsoleMessages;
  protected captureNetworkRequests: CaptureNetworkRequests;

  constructor() {
    this.socketConnection = new SocketConnection();
    if (Array.isArray(window.replayjsQueue)) {
      window.replayjsQueue.forEach((args) => {
        this[args[0]](args[1]);
      });
    }
    delete window.replayjsQueue;
    window.replayjs = (fn, data) => {
      return this[fn](data);
    };
  }

  protected auth(apiKey: string) {
    this.apiKey = apiKey;
    this.socketConnection.setApiKey(apiKey);
  }

  protected baseHref(setBaseHref) {
    this._baseHref = setBaseHref;
  }

  protected clientDetails(data: object) {
    this.captureSessionDetails.set(data);
    if (this.channel) {
      this.captureSessionDetails.sendDetails(this.channel);
    }
  }

  protected stream() {
    this.channel = this.socketConnection
      .connect()
      .join(`chat`)
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

    this.mirrorClient = new MirrorClient(this._baseHref, this.initialTiming);
    this.captureClicks = new CaptureClicks(this.initialTiming);
    this.captureSessionDetails = new CaptureSessionDetails(this.apiKey);
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
