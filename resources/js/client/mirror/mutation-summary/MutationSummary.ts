// TODO(rafaelw): Allow ':' and '.' as valid name characters.
import Summary from "./Summary";
import Options from "./interfaces/Options";
import StringMap from "./interfaces/StringMap";
import MutationProjection from "./MutationProjection";

// TODO(rafaelw): Consider allowing backslash in the attrValue.

export default class MutationSummary {
  protected root: Node;
  protected options: Options;
  protected calcReordered: boolean;
  protected connected: boolean = false;
  protected observer: MutationObserver;
  protected callback: (summaries: Summary[]) => any;

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

  private createSummaries(mutations: MutationRecord[]): Summary[] {
    if (!mutations || !mutations.length) return [];

    let projection = new MutationProjection(
      this.root,
      mutations,
      this.calcReordered,
      this.options.oldPreviousSibling,
    );

    return [new Summary(projection)];
  }

  // TODO - lets rewrite this part
  private changesToReport(summaries: Summary[]): boolean {
    return summaries.some((summary) => {
      if (
        [
          "added",
          "removed",
          "reordered",
          "reparented",
          "valueChanged",
          "characterDataChanged",
        ].some(function(prop) {
          return summary[prop] && summary[prop].length;
        })
      ) {
        return true;
      }

      if (summary.attributeChanged) {
        let attrNames = Object.keys(summary.attributeChanged);
        let attrsChanged = attrNames.some((attrName) => {
          return !!summary.attributeChanged[attrName].length;
        });
        if (attrsChanged) {
          return true;
        }
      }
      return false;
    });
  }

  private observerCallback(mutations: MutationRecord[]) {
    if (!this.options.observeOwnChanges) {
      this.observer.disconnect();
    }

    let summaries = this.createSummaries(mutations);

    if (this.changesToReport(summaries)) {
      this.callback(summaries);
    }

    // disconnect() may have been called during the callback.
    if (!this.options.observeOwnChanges && this.connected) {
      this.observer.observe(this.root, this.observerOptions);
    }
  }
}
