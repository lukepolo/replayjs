import DomCompressor from "./DomCompressor";
import NodeData from "./interfaces/NodeData";
import PositionData from "./interfaces/PositionData";
import AttributeData from "./interfaces/AttributeData";
const MutationSummary = require("mutation-summary");

export default class DomSource {
  protected mirror;
  protected knownNodes;
  protected target: Node;
  protected mutationSummary;
  protected nextId: number = 1;
  protected domCompressor: DomCompressor;

  constructor(target: Node, mirror) {
    this.mirror = mirror;
    this.target = target;
    this.domCompressor = new DomCompressor();
    this.knownNodes = new MutationSummary.NodeMap();

    let children = [];
    for (
      let child = <Node>target.firstChild;
      child;
      child = child.nextSibling
    ) {
      let node = this.serializeNode(child, true);
      if (node !== null) {
        children.push(node);
      }
    }

    this.mirror.initialize(this.serializeNode(target).id, children);

    this.mutationSummary = new MutationSummary({
      rootNode: target,
      callback: (summaries) => {
        this.applyChanged(summaries);
      },
      queries: [{ all: true }],
    });
  }

  public disconnect() {
    if (this.mutationSummary) {
      this.mutationSummary.disconnect();
      this.mutationSummary = undefined;
    }
  }

  protected serializeNode(node: Node, recursive?: boolean): NodeData {
    if (node === null) return null;

    let id = this.knownNodes.get(node);
    if (id !== undefined) {
      return { id: id };
    }

    let data: NodeData = {
      nodeType: node.nodeType,
      id: this.rememberNode(node),
    };

    switch (data.nodeType) {
      case Node.DOCUMENT_TYPE_NODE:
        let docType = <DocumentType>node;
        data.name = docType.name;
        data.publicId = docType.publicId;
        data.systemId = docType.systemId;
        break;

      case Node.COMMENT_NODE:
        return null;
      case Node.TEXT_NODE:
        data.textContent = node.textContent;
        break;

      case Node.ELEMENT_NODE:
        let elm = <Element>node;
        data.tagName = elm.tagName;
        data.attributes = {};

        for (let i = 0; i < elm.attributes.length; i++) {
          let attr = elm.attributes[i];
          data.attributes[attr.name] = attr.value;
        }

        if (
          elm.tagName == "SCRIPT" ||
          elm.tagName == "NOSCRIPT" ||
          elm.tagName == "CANVAS"
        ) {
          return null;
        }

        if (recursive && elm.childNodes.length) {
          data.childNodes = [];

          for (
            let child = <Node>elm.firstChild;
            child;
            child = child.nextSibling
          ) {
            let nodeData = this.serializeNode(child, true);
            if (nodeData !== null) {
              data.childNodes.push(nodeData);
            }
          }
        }
        break;
    }

    return this.domCompressor.compressNode(data);
  }

  protected serializeAddedAndMoved(
    added: Array<Node>,
    reparented: Array<Node>,
    reordered: Array<Node>,
  ): Array<PositionData> {
    let all = added.concat(reparented).concat(reordered);

    let parentMap = new MutationSummary.NodeMap();

    all.forEach((node) => {
      let parent = node.parentNode;
      let children = parentMap.get(parent);
      if (!children) {
        children = new MutationSummary.NodeMap();
        parentMap.set(parent, children);
      }

      children.set(node, true);
    });

    let moved = [];

    parentMap.keys().forEach((parent) => {
      let children = parentMap.get(parent);

      let keys = children.keys();
      while (keys.length) {
        let node = keys.shift();
        while (node.previousSibling && children.has(node.previousSibling)) {
          node = node.previousSibling;
        }

        while (node && children.has(node)) {
          let data = <PositionData>this.serializeNode(node);
          if (data !== null) {
            data.previousSibling = this.serializeNode(node.previousSibling);
            data.parentNode = this.serializeNode(node.parentNode);
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

  protected serializeAttributeChanges(
    attributeChanged: Array<Element[]>,
  ): Array<AttributeData> {
    let map = new MutationSummary.NodeMap();

    Object.keys(attributeChanged).forEach((attrName) => {
      attributeChanged[attrName].forEach((element) => {
        let record = map.get(element);
        if (!record) {
          record = this.serializeNode(element);

          if (record !== null) {
            record.attributes = {};
            map.set(element, record);
          }
        }

        if (record !== null) {
          record.attributes[attrName] = this.domCompressor.compressAttribute(
            element.getAttribute(attrName),
          );
        }
      });
    });

    return map.keys().map((node) => {
      return map.get(node);
    });
  }

  protected applyChanged(summaries) {
    let summary = summaries[0];

    let removed = summary.removed.map((node) => {
      return this.serializeNode(node);
    });

    let moved = this.serializeAddedAndMoved(
      summary.added,
      summary.reparented,
      summary.reordered,
    );

    let attributes = this.serializeAttributeChanges(summary.attributeChanged);

    let text = summary.characterDataChanged.map((node) => {
      let data = this.serializeNode(node);
      if (data !== null) {
        data.textContent = node.textContent;
      }
      return data;
    });

    this.mirror.applyChanged(removed, moved, attributes, text);

    summary.removed.forEach((node) => {
      this.forgetNode(node);
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
