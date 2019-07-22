import NodeMap from "../NodeMap";
import NodeData, { NodeDataTypes } from "../interfaces/NodeData";
import NodeDataCompressorService from "../services/NodeDataCompressorService";

export default class CaptureInputEvents {
  protected knownNodes: NodeMap<number>;
  protected changesCallback: (
    removed: Array<NodeData>,
    addedOrMoved: Array<NodeData>,
    attributes: Array<NodeData>,
    text: Array<NodeData>,
  ) => void;

  constructor(knownNodes: NodeMap<number>, changesCallback) {
    this.knownNodes = knownNodes;
    this.changesCallback = changesCallback;
  }

  public setup() {
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
    // TODO - we should be compressing these
    // let compressor = new NodeDataCompressorService();
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
        // @ts-ignore
        console.info(target.checked);
        // @ts-ignore
        target.setAttribute("checked", target.checked);
        break;
      default:
        target.setAttribute("value", target.value);
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
