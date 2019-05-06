import Summary from "./Summary";
import Options from "./interfaces/Options";

export default class MutationSummary {
  protected root: Node;
  protected options: Options;
  protected connected: boolean = false;
  protected observer: MutationObserver;
  protected callback: (summary: Summary) => any;

  protected observerOptions = {
    subtree: true,
    childList: true,
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true,
  };

  constructor(options: Options) {
    if (MutationObserver === undefined) {
      throw Error("DOM Mutation Observers are required");
    }
    this.options = options;
    this.root = this.options.rootNode;
    this.callback = this.options.callback;

    this.observer = new MutationObserver((mutations: MutationRecord[]) => {
      this.observerCallback(mutations);
    });

    this.connect();
  }

  public connect() {
    if (this.connected) {
      throw Error("Already connected");
    }
    this.observer.observe(this.root, this.observerOptions);

    this.connected = true;
  }

  public disconnect() {
    this.observer.disconnect();
    this.connected = false;
  }

  private observerCallback(mutations: MutationRecord[]) {
    // TODO - validate this
    // We disconnect, as we dont want to hear about these changes again
    this.observer.disconnect();

    this.sendSummary(mutations);

    if (this.connected) {
      this.observer.observe(this.root, this.observerOptions);
    }
  }

  private sendSummary(mutations: MutationRecord[]) {
    if (mutations && mutations.length) {
      let summary = new Summary(
        this.root,
        mutations,
        this.options.oldPreviousSibling, // TODO - we may not need this // https://github.com/rafaelw/mutation-summary/blob/master/APIReference.md
      );

      if (
        Object.values(summary).find((entry, index) => {
          if (!Array.isArray(entry)) {
            entry = Object.keys(entry);
          }
          return entry.length > 0;
        })
      ) {
        this.callback(summary);
      }
    }
  }
}
