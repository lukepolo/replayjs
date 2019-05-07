import DomCompressor from "./DomCompressor";
import TextData from "./interfaces/TextData";
import PositionData from "./interfaces/PositionData";
import AttributeData from "./interfaces/AttributeData";
import NodeData, { NodeDataTypes } from "./interfaces/NodeData";

export default class DomMirror {
  protected rootNode;
  protected delegate;
  protected nodeIdMap = {};
  protected domCompressor: DomCompressor;

  constructor(
    rootNode: Node,
    delegate: {
      setAttribute: () => void;
      createElement: () => void;
    },
  ) {
    this.nodeIdMap = {};
    this.rootNode = rootNode;
    this.delegate = delegate;
    this.domCompressor = new DomCompressor();
  }

  public initialize(rootNodeId: number, children: Array<NodeData>) {
    this.nodeIdMap[rootNodeId] = this.rootNode;

    children.forEach((child) => {
      this.recreateNode(child, this.rootNode);
    });
  }

  public recreateNode(nodeData: NodeData, parent?: Node): Node {
    if (nodeData === null) {
      return;
    }

    nodeData = this.domCompressor.decompressNode(nodeData);

    let node = this.nodeIdMap[nodeData[NodeDataTypes.id]];

    if (node) {
      return node;
    }

    let doc = this.rootNode.ownerDocument;
    if (doc === null) {
      doc = this.rootNode;
    }

    switch (nodeData[NodeDataTypes.nodeType]) {
      case Node.COMMENT_NODE:
        node = doc.createComment(nodeData[NodeDataTypes.textContent]);
        break;

      case Node.TEXT_NODE:
        node = doc.createTextNode(nodeData[NodeDataTypes.textContent]);
        break;

      case Node.DOCUMENT_TYPE_NODE:
        node = doc.implementation.createDocumentType(
          nodeData[NodeDataTypes.name],
          nodeData[NodeDataTypes.publicId],
          nodeData[NodeDataTypes.systemId],
        );
        break;

      case Node.ELEMENT_NODE:
        if (this.delegate && this.delegate.createElement) {
          node = this.delegate.createElement(nodeData[NodeDataTypes.tagName]);
        }
        if (!node) {
          node = doc.createElement(nodeData[NodeDataTypes.tagName]);
        }

        Object.keys(nodeData[NodeDataTypes.attributes]).forEach((name) => {
          let attribute = nodeData[NodeDataTypes.attributes][name];

          try {
            if (
              this.delegate &&
              this.delegate.setAttribute &&
              this.delegate.setAttribute(node, name, attribute)
            ) {
              node.setAttribute(name, attribute);
            }
          } catch (e) {
            // TODO - this should never happen is not needed
            console.warn(`Cant set attribute`, e);
          }
        });

        break;
      default:
        console.warn("Missing Node Type", Node.TEXT_NODE);
        break;
    }

    if (!node) {
      return;
    }

    this.nodeIdMap[nodeData[NodeDataTypes.id]] = node;

    if (parent) {
      parent.appendChild(node);
    }

    if (nodeData[NodeDataTypes.childNodes]) {
      nodeData[NodeDataTypes.childNodes].forEach((child) => {
        this.recreateNode(child, node);
      });
    }

    return node;
  }

  public applyChanged(
    removed: Array<NodeData>,
    addedOrMoved: Array<PositionData>,
    attributes: Array<AttributeData>,
    text: Array<TextData>,
  ) {
    /**
     * Applying the changes can result in an attempting to add a child
     * to a parent which is presently an ancestor of the parent. This can occur
     * based on random ordering of moves. The way we handle this is to first
     * remove all changed nodes from their parents, then apply.
     */
    addedOrMoved.forEach((data) => {
      let node = this.recreateNode(data);
      if (node) {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }
    });

    removed.forEach((data) => {
      let node = this.recreateNode(data);
      if (node) {
        if (node.parentNode) node.parentNode.removeChild(node);
      }
    });

    addedOrMoved.forEach((data) => {
      let node = this.recreateNode(data);
      if (node) {
        let parent = this.recreateNode(data.parentNode);
        let previous = this.recreateNode(data.previousSibling);

        try {
          parent.insertBefore(
            node,
            previous ? previous.nextSibling : parent.firstChild,
          );
        } catch (e) {
          console.warn("Node is gone", parent, node);
          // Node is gone
        }
      }
    });

    attributes.forEach((data: AttributeData) => {
      let node = <Element>this.recreateNode(data);

      if (node) {
        Object.keys(data[NodeDataTypes.attributes]).forEach((attrName) => {
          let newVal = this.domCompressor.decompressAttribute(
            data[NodeDataTypes.attributes][attrName],
          );
          if (newVal === null) {
            node.removeAttribute(attrName);
          } else {
            try {
              if (
                !this.delegate ||
                !this.delegate.setAttribute ||
                !this.delegate.setAttribute(node, attrName, newVal)
              ) {
                node.setAttribute(attrName, newVal);
              }
            } catch (e) {
              console.warn(`Cant set attribute`, e);
            }
          }
        });
      }
    });

    text.forEach((data) => {
      let node = this.recreateNode(data);
      if (node) {
        node[NodeDataTypes.textContent] = data[NodeDataTypes.textContent];
      }
    });

    removed.forEach((node) => {
      delete this.nodeIdMap[node[NodeDataTypes.id]];
    });
  }
}
