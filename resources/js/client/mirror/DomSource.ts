import DomCompressor from "./DomCompressor";
import PositionData from "./interfaces/PositionData";
import AttributeData from "./interfaces/AttributeData";
import NodeMap from "./mutation-summary/NodeMap";
import Summary from "./mutation-summary/Summary";
import NodeData, { NodeDataTypes } from "./interfaces/NodeData";
import StringMap from "./mutation-summary/interfaces/StringMap";
import MutationSummary from "./../mirror/mutation-summary/MutationSummary";

export default class DomSource {
  protected knownNodes;
  protected target: Node;
  protected changesCallback;
  protected mutationSummary;
  protected nextId: number = 1;
  protected domCompressor: DomCompressor;

  // TODO - apply iframe / shadow dom here cause we can track the ID's of the nodes
  constructor(
    target: Node,
    initializeCallback: (rootId: number, children: Array<HTMLElement>) => void,
    changesCallback: (
      removed: Array<NodeData>,
      addedOrMoved: Array<NodeData>,
      attributes: Array<NodeData>,
      text: Array<NodeData>,
    ) => void,
  ) {
    this.target = target;
    this.changesCallback = changesCallback;
    this.domCompressor = new DomCompressor();
    this.knownNodes = new NodeMap<NodeMap<number>>();

    let children = [];
    for (
      let child = <Node>target.firstChild;
      child;
      child = child.nextSibling
    ) {
      let node = this.collectNodeData(child, true);
      if (node !== null) {
        children.push(node);
      }
    }

    initializeCallback(
      this.collectNodeData(target)[NodeDataTypes.id],
      children,
    );

    this.mutationSummary = new MutationSummary({
      rootNode: target,
      callback: (summary: Summary) => {
        this.applyChanged(summary);
      },
    });
  }

  public disconnect() {
    if (this.mutationSummary) {
      this.mutationSummary.disconnect();
      this.mutationSummary = undefined;
    }
  }

  protected applyChanged(summary: Summary) {
    let removed = summary.removed.map((node) => {
      return this.collectNodeData(node);
    });

    let moved = this.collectNodePositionData(summary.added);

    let attributes = this.serializeAttributeChanges(summary.attributeChanged);

    let text = summary.characterDataChanged.map((node) => {
      let data = this.collectNodeData(node);
      if (data !== null) {
        data[NodeDataTypes.textContent] = node.textContent;
      }
      return data;
    });

    this.changesCallback(removed, moved, attributes, text);

    summary.removed.forEach((node) => {
      this.forgetNode(node);
    });
  }

  protected collectNodeData(node: Node, recursive?: boolean): NodeData {
    if (node === null) {
      return null;
    }

    let id = this.knownNodes.get(node);
    if (id !== undefined) {
      return {
        [NodeDataTypes.id]: id,
      };
    }

    let data: NodeData = {
      [NodeDataTypes.nodeType]: node.nodeType,
      [NodeDataTypes.id]: this.rememberNode(node),
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

    return this.domCompressor.compressNode(data);
  }

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

  // All were doing is mapping nodes to an node id so we can apply the attributes
  protected serializeAttributeChanges(
    attributeChanged: StringMap<Element[]>,
  ): Array<AttributeData> {
    let nodeMap = new NodeMap<AttributeData>();

    Object.keys(attributeChanged).forEach((attrName) => {
      attributeChanged[attrName].forEach((element) => {
        let node = nodeMap.get(element);

        if (!node) {
          node = <AttributeData>this.collectNodeData(element);
          if (node !== null) {
            node[NodeDataTypes.attributes] = {};
            nodeMap.set(element, node);
          }
        }

        if (node !== null) {
          node[NodeDataTypes.attributes][
            attrName
          ] = this.domCompressor.compressAttribute(
            element.getAttribute(attrName),
          );
        }
      });
    });

    return nodeMap.keys().map((node) => {
      return nodeMap.get(node);
    });
  }

  protected rememberNode(node: Node) {
    let id = this.nextId++;
    this.knownNodes.set(node, id);
    return id;
  }

  protected forgetNode(node: Node) {
    this.knownNodes.delete(node);
  }
}
