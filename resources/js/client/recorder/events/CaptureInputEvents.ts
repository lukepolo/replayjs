import NodeMap from "../NodeMap";
import NodeData, { NodeDataTypes } from "../interfaces/NodeData";
import NodeDataCompressorService from "../services/NodeDataCompressorService";
import ListenInterface from "../../interfaces/ListenInterface";

export default class CaptureInputEvents implements ListenInterface {
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
    // TODO - add compression
    // let compressor = new NodeDataCompressorService();
    let id = this.knownNodes.get(target);

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
        if (target.checked) {
          target.setAttribute("checked", "true");
        }
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

  public teardown() {
    ["input", "change"].forEach((eventName) => {
      document.removeEventListener(eventName, this.captureInput.bind(this));
    });
  }
}
