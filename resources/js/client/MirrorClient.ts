import timing from "./helpers/timing";
import DomSource from "./mirror/DomSource";
import ListenInterface from "./interfaces/ListenInterface";
import CaptureInputEvents from "./events/CaptureInputEvents";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import InitializeDataInterface from "./interfaces/InitializeDataInterface";
import DomChangesDataInterface from "./interfaces/DomChangesDataInterface";

export default class MirrorClient implements ListenInterface {
  protected baseHref: string;
  protected domSource: DomSource;
  protected inputEvents: CaptureInputEvents;
  protected channel: NullPresenceChannel;

  constructor(baseHref: string) {
    this.baseHref = baseHref;
    this.inputEvents = new CaptureInputEvents();
  }

  public setup(channel: NullPresenceChannel) {
    this.channel = channel;
    this.initialize();
    this.inputEvents.setup();
    window.addEventListener("focus", this.tabFocusActivity.bind(this));
    window.addEventListener("blur", this.tabFocusActivity.bind(this));
  }

  public teardown() {
    this.disconnect();
    window.removeEventListener("focus", this.tabFocusActivity.bind(this));
    window.removeEventListener("blur", this.tabFocusActivity.bind(this));
  }

  private disconnect() {
    if (this.domSource) {
      this.domSource.disconnect();
      this.domSource = null;
    }
  }

  private whisperInitialized(data: InitializeDataInterface) {
    this.channel.whisper("initialize", data);
  }

  private whisperChanges(data: DomChangesDataInterface) {
    this.channel.whisper("changes", data);
  }

  private tabFocusActivity() {
    let tabHasFocus = document.hasFocus();
    if (tabHasFocus) {
      this.initialize();
    } else {
      this.disconnect();
    }
    this.channel.whisper("focus-activity", {
      timing: timing(),
      tabHasFocus: tabHasFocus,
    });
  }

  private initialize() {
    this.disconnect();
    this.domSource = new DomSource(
      document,
      (rootId, children) => {
        this.whisperInitialized({
          rootId,
          children,
          timing: timing(),
          baseHref: this.baseHref,
        });
        this.inputEvents.setup();
      },
      (removed, addedOrMoved, attributes, text) => {
        this.whisperChanges({
          text,
          removed,
          attributes,
          addedOrMoved,
          timing: timing(),
        });
        if (addedOrMoved.length) {
          this.inputEvents.setup();
        }
      },
    );
  }
}
