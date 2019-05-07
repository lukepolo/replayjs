import Summary from "./Summary";
import Options from "./interfaces/Options";

export default class MutationSummary {
  protected root: Node;
  protected options: Options;
  protected connected: boolean = false;
  protected observer: MutationObserver;
  protected callback: (summary: Summary) => any;

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
    this.observer.observe(this.root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
    });
    this.connected = true;
  }

  public disconnect() {
    if (this.connected) {
      this.observer.disconnect();
      this.connected = false;
    }
  }

  /**
   * Mutation observer will merge several mutations into an array and pass
   * it to the callback function.
   *
   * For example, if we append an element el_1 into body, and then append
   * another element el_2 into el_1, these two mutations may be passed to the
   * callback function together when the two operations were done.
   *
   * Generally we need trace child nodes of newly added node, but in this
   * case if we count el_2 as el_1's child node in the first mutation record,
   * then we will count el_2 again in the second mutation record which was
   * duplicated.
   *
   * To avoid of duplicate counting added nodes, we disconnect and reconnect
   */
  private observerCallback(mutations: MutationRecord[]) {
    this.disconnect();

    if (mutations && mutations.length) {
      let summary = new Summary(this.root, mutations);

      if (
        Object.values(summary).find((entry) => {
          if (!Array.isArray(entry)) {
            entry = Object.keys(entry);
          }
          return entry.length > 0;
        })
      ) {
        console.info(summary);
        this.callback(summary);
      }
    }

    this.connect();
  }
}
