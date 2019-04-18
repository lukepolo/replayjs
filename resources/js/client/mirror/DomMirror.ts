import DomCompressor from "./DomCompressor";
import TextData from "./interfaces/TextData";
import PositionData from "./interfaces/PositionData";
import AttributeData from "./interfaces/AttributeData";
import NodeData, { NodeDataTypes } from "./interfaces/NodeData";

export default class DomMirror {
  protected root;
  protected delegate;
  protected idMap = {};
  protected domCompressor: DomCompressor;

  constructor(
    root: Node,
    delegate: {
      setAttribute: () => void;
      createElement: () => void;
    },
  ) {
    this.idMap = {};
    this.root = root;
    this.delegate = delegate;
    this.domCompressor = new DomCompressor();
  }

  public initialize(rootId: number, children: Array<NodeData>) {
    this.idMap[rootId] = this.root;

    for (let i = 0; i < children.length; i++) {
      this.deserializeNode(children[i], this.root);
    }
  }

  public deserializeNode(nodeData: NodeData, parent?: Node): Node {
    if (nodeData === null) {
      return;
    }

    nodeData = this.domCompressor.decompressNode(nodeData);

    let node = this.idMap[nodeData[NodeDataTypes.id]];

    if (node) {
      return node;
    }

    let doc = this.root.ownerDocument;
    if (doc === null) {
      doc = this.root;
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
      case Node.DOCUMENT_FRAGMENT_NODE:
        node = doc.createElement("div");
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
            // cant set attribute
          }
        });

        break;
    }

    if (!node) {
      return;
    }

    this.idMap[nodeData[NodeDataTypes.id]] = node;

    if (parent) {
      parent.appendChild(node);
    }

    if (nodeData[NodeDataTypes.childNodes]) {
      for (let i = 0; i < nodeData[NodeDataTypes.childNodes].length; i++) {
        this.deserializeNode(nodeData[NodeDataTypes.childNodes][i], node);
      }
    }

    return node;
  }

  public applyChanged(
    removed: Array<NodeData>,
    addedOrMoved: Array<PositionData>,
    attributes: Array<AttributeData>,
    text: Array<TextData>,
  ) {
    // NOTE: Applying the changes can result in an attempting to add a child
    // to a parent which is presently an ancestor of the parent. This can occur
    // based on random ordering of moves. The way we handle this is to first
    // remove all changed nodes from their parents, then apply.
    addedOrMoved.forEach((data) => {
      let node = this.deserializeNode(data);
      if (node) {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }
    });

    removed.forEach((data) => {
      let node = this.deserializeNode(data);
      if (node) {
        if (node.parentNode) node.parentNode.removeChild(node);
      }
    });

    addedOrMoved.forEach((data) => {
      let node = this.deserializeNode(data);
      if (node) {
        let parent = this.deserializeNode(data.parentNode);
        let previous = this.deserializeNode(data.previousSibling);

        try {
          parent.insertBefore(
            node,
            previous ? previous.nextSibling : parent.firstChild,
          );
        } catch (e) {
          // Node is gone
        }
      }
    });

    attributes.forEach((data: AttributeData) => {
      let node = <Element>this.deserializeNode(data);

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
              // cant set attribute
            }
          }
        });
      }
    });

    text.forEach((data) => {
      let node = this.deserializeNode(data);

      if (node) {
        node[NodeDataTypes.textContent] = data[NodeDataTypes.textContent];
      }
    });

    removed.forEach((node) => {
      delete this.idMap[node[NodeDataTypes.id]];
    });
  }
}
