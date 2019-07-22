import NodeMap from "./NodeMap";
import PositionData from "./interfaces/PositionData";
import Summary from "./mutation-summary/interfaces/Summary";
import CaptureInputEvents from "./events/CaptureInputEvents";
import NodeData, { NodeDataTypes } from "./interfaces/NodeData";
import StringMap from "./mutation-summary/interfaces/StringMap";
import MutationSummary from ".//mutation-summary/MutationSummary";
import NodeDataCompressorService from "./services/NodeDataCompressorService";

export default class Recorder {
  protected target: Node;
  protected mutationSummary;
  protected nextId: number = 1;
  protected fullSnapshotCallback;
  protected partialSnapshotCallback;
  protected knownNodes = new NodeMap<number>();
  protected captureInputEvents: CaptureInputEvents;
  protected nodeDataCompressorService = new NodeDataCompressorService();

  // TODO - apply iframe / shadow dom here cause we can track the ID's of the nodes
  constructor(
    target: Node,
    fullSnapshotCallback: (
      rootId: number,
      children: Array<HTMLElement>,
    ) => void,
    partialSnapshotCallback: (
      removed: Array<NodeData>,
      addedOrMoved: Array<NodeData>,
      attributes: Array<NodeData>,
      text: Array<NodeData>,
    ) => void,
  ) {
    this.target = target;
    this.fullSnapshotCallback = fullSnapshotCallback;
    this.partialSnapshotCallback = partialSnapshotCallback;
    this.captureInputEvents = new CaptureInputEvents(
      this.knownNodes,
      this.partialSnapshotCallback,
    );
  }

  public setup() {
    this.captureInputEvents.setup();
    this.mutationSummary = new MutationSummary({
      rootNode: this.target,
      callback: (summary: Summary) => {
        this.collectChanges(summary);
      },
    });

    this.connect();
  }

  public connect() {
    let children = [];
    for (
      let child = this.target.firstChild;
      child;
      // @ts-ignore
      child = child.nextSibling
    ) {
      let node = this.collectNodeData(child, true);
      if (node !== null) {
        children.push(node);
      }
    }

    this.fullSnapshotCallback(
      this.collectNodeData(this.target)[NodeDataTypes.id],
      children,
    );

    if (this.mutationSummary) {
      this.mutationSummary.connect();
    }
  }

  public disconnect() {
    if (this.mutationSummary) {
      this.mutationSummary.disconnect();
    }
  }

  protected collectChanges(summary: Summary) {
    let movedNodes = this.collectNodePositionData(summary.addedNodes);
    let attributeChanges = this.collectNodeAttributes(summary.attributeChanges);
    let textChanges = summary.textChanges.map((node) =>
      this.collectNodeData(node),
    );
    let removedNodes = summary.removedNodes.map((node) =>
      this.collectNodeData(node),
    );

    this.partialSnapshotCallback(
      removedNodes,
      movedNodes,
      attributeChanges,
      textChanges,
    );

    summary.removedNodes.forEach((node) => {
      this.forgetNode(node);
    });
  }

  protected collectNodeData(node: Node, recursive?: boolean): NodeData {
    if (node === null) {
      return null;
    }

    let id = this.knownNodes.get(node);

    let data: NodeData = {
      [NodeDataTypes.nodeType]: node.nodeType,
      [NodeDataTypes.id]: id || this.rememberNode(node),
    };

    switch (data[NodeDataTypes.nodeType]) {
      case Node.DOCUMENT_TYPE_NODE:
        let docType = <DocumentType>node;
        data[NodeDataTypes.name] = docType[NodeDataTypes.name];
        data[NodeDataTypes.publicId] = docType[NodeDataTypes.publicId];
        data[NodeDataTypes.systemId] = docType[NodeDataTypes.systemId];
        break;

      case Node.COMMENT_NODE:
        return null;
      case Node.TEXT_NODE:
        data[NodeDataTypes.textContent] = node.textContent;
        break;

      case Node.ELEMENT_NODE:
        let elm = <Element>node;
        data[NodeDataTypes.tagName] = elm.tagName;
        data[NodeDataTypes.attributes] = {};

        for (let i = 0; i < elm.attributes.length; i++) {
          let attr = elm.attributes[i];
          data[NodeDataTypes.attributes][attr.name] = attr.value;
        }

        // @ts-ignore
        if (elm.value) {
          // @ts-ignore
          switch (elm.type) {
            case "radio":
            case "checkbox":
              // @ts-ignore
              // elm.setAttribute('checked', elm.checked)
              break;
            default:
              // @ts-ignore
              // elm.setAttribute('value', elm.value)
              break;
          }
        }

        if (
          elm.tagName == "CANVAS" ||
          elm.tagName == "SCRIPT" ||
          elm.tagName == "NOSCRIPT"
        ) {
          return null;
        }

        if (recursive && elm.childNodes.length) {
          data[NodeDataTypes.childNodes] = [];

          for (
            let child = <Node>elm.firstChild;
            child;
            child = child.nextSibling
          ) {
            let nodeData = this.collectNodeData(child, true);
            if (nodeData !== null) {
              data[NodeDataTypes.childNodes].push(nodeData);
            }
          }
        }
        break;
    }

    return this.nodeDataCompressorService.compressNode(data);
  }

  // TODO - do more research on this
  protected collectNodePositionData(added: Array<Node>): Array<PositionData> {
    let parentNodeMap = new NodeMap<NodeMap<boolean>>();

    /**
     * We first need to generate a list of parents
     * because we will have many nodes that share that parent
     * then we will set the children that have that parent
     */
    added.forEach((node) => {
      let parent = node.parentNode;
      let children = parentNodeMap.get(parent);
      if (!children) {
        children = new NodeMap();
        parentNodeMap.set(parent, children);
      }
      children.set(node, true);
    });

    let moved = [];

    /**
     * Next we will loop through ach parent and
     * serialize each of those nodes recursively
     */
    parentNodeMap.keys().forEach((parent: Node) => {
      let children = parentNodeMap.get(parent);

      let keys = children.keys();
      while (keys.length) {
        let node = keys.shift();
        while (node.previousSibling && children.has(node.previousSibling)) {
          node = node.previousSibling;
        }

        while (node && children.has(node)) {
          let data = <PositionData>this.collectNodeData(node);
          if (data !== null) {
            /**
             * To place the node where it belongs during replay
             * we need to take note of where they
             * are at in the sibling chain
             */
            data.previousSibling = this.collectNodeData(node.previousSibling);

            /**
             * We also need to serialize their parent all the way to the top
             * that we can properly place them in the document
             */
            data.parentNode = this.collectNodeData(node.parentNode);
            moved.push(data);
            children.delete(node);
          }
          node = node.nextSibling;
        }
        keys = children.keys();
      }
    });

    return moved;
  }

  protected collectNodeAttributes(
    attributeChanged: StringMap<Element[]>,
  ): Array<NodeData> {
    let nodeMap = new NodeMap<NodeData>();

    Object.keys(attributeChanged).forEach((attrName) => {
      attributeChanged[attrName].forEach((element) => {
        let node = nodeMap.get(element);

        if (!node) {
          node = this.collectNodeData(element);
          if (node !== null) {
            node[NodeDataTypes.attributes] = {};
            nodeMap.set(element, node);
          }
        }
        node[NodeDataTypes.attributes][
          attrName
        ] = this.nodeDataCompressorService.compressData(
          element.getAttribute(attrName),
        );
      });
    });
    return nodeMap.values();
  }

  protected rememberNode(node: Node): number {
    let id = this.nextId++;
    this.knownNodes.set(node, id);
    return id;
  }

  protected forgetNode(node: Node) {
    this.knownNodes.delete(node);
  }

  public teardown() {
    this.disconnect();
    this.captureInputEvents.teardown();
  }
}
