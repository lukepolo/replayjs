import InputEvents from "./events/InputEvents";
import { TreeMirrorClient } from "./vendor/tree-mirror";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import InitializeDataInterface from "./interfaces/InitializeDataInterface";
import DomChangesDataInterface from "./interfaces/DomChangesDataInterface";

export default class MirrorClient {
  protected readonly timing: number;
  protected inputEvents: InputEvents;
  protected treeMirrorClient: TreeMirrorClient;
  protected readonly channel: NullPresenceChannel;

  constructor(channel: NullPresenceChannel, timing: number) {
    this.timing = timing;
    this.channel = channel;
    this.inputEvents = new InputEvents();
  }

  public connect(joiningEvent = false) {
    this.disconnect();
    this.treeMirrorClient = new TreeMirrorClient(
      document,
      {
        initialize: (rootId, children) => {
          this.whisperInitialized({
            rootId,
            children,
            joiningEvent,
            baseHref: window.location.origin,
            timing: new Date().getTime() - this.timing,
          });
          this.inputEvents.setup();
        },
        applyChanged: (removed, addedOrMoved, attributes, text) => {
          this.whisperChanges({
            text,
            removed,
            attributes,
            addedOrMoved,
            timing: new Date().getTime() - this.timing,
          });
          if (addedOrMoved.length) {
            this.inputEvents.setup();
          }
        },
      },
      [{ all: true }],
    );
  }

  public disconnect() {
    if (this.treeMirrorClient) {
      this.treeMirrorClient.disconnect();
      this.treeMirrorClient = null;
    }
  }

  public whisperInitialized(data: InitializeDataInterface) {
    this.channel.whisper("initialize", data);
  }

  public whisperChanges(data: DomChangesDataInterface) {
    this.channel.whisper("changes", data);
  }
}
