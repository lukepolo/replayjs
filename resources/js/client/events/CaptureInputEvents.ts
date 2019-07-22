import NodeMap from "../mirror/mutation-summary/NodeMap";
import NodeData, { NodeDataTypes } from "../mirror/interfaces/NodeData";
import DomCompressor from "../mirror/DomCompressor";

export default class CaptureInputEvents {
  protected knownNodes: NodeMap<number>;
  protected changesCallback;

  public setup(
    knownNodes,
    changesCallback: (
      removed: Array<NodeData>,
      addedOrMoved: Array<NodeData>,
      attributes: Array<NodeData>,
      text: Array<NodeData>,
    ) => void,
  ) {
    this.knownNodes = knownNodes;
    this.changesCallback = changesCallback;

    ["input", "change"].forEach((eventName) => {
      document.addEventListener(eventName, this.captureInput.bind(this));
    });
  }

  private captureInput({ target }) {
    let { tagName } = target;

    if (!tagName || ["INPUT", "TEXTAREA", "SELECT"].indexOf(tagName) < 0) {
      console.info(`BAD TAG NAME`, tagName);
      return;
    }

    if (target.type === "password") {
      return;
    }

    this.updateVnode(target);
  }

  private updateVnode(target: HTMLInputElement) {
    let compressor = new DomCompressor();
    let id = this.knownNodes.get(target);

    // TODO - need to check if the value is the same, but at least its working
    switch (target.type) {
      case "radio":
      case "checkbox":
        this.changesCallback(
          [],
          [],
          [
            {
              [NodeDataTypes.id]: id,
              [NodeDataTypes.attributes]: {
                checked: target.checked,
              },
            },
          ],
          [],
        );
        break;
      default:
        this.changesCallback(
          [],
          [],
          [
            {
              [NodeDataTypes.id]: id,
              [NodeDataTypes.attributes]: {
                value: target.value,
              },
            },
          ],
          [],
        );
        break;
    }
  }
}
