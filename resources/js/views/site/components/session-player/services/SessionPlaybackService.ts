import TextData from "../../../../../client/recorder/interfaces/TextData";
import PositionData from "../../../../../client/recorder/interfaces/PositionData";
import AttributeData from "../../../../../client/recorder/interfaces/AttributeData";
import NodeData, {
  NodeDataTypes,
} from "../../../../../client/recorder/interfaces/NodeData";
import NodeDataCompressorService from "../../../../../client/recorder/services/NodeDataCompressorService";

export default class SessionPlaybackService {
  protected rootNode;
  protected delegate;
  protected nodeIdMap = {};
  protected nodeDataCompressorService: NodeDataCompressorService;

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
    this.nodeDataCompressorService = new NodeDataCompressorService();
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

    nodeData = this.nodeDataCompressorService.decompressNode(nodeData);

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
          setTimeout(() => {
            this.delegate.setAttribute(
              node,
              name,
              nodeData[NodeDataTypes.attributes][name],
            );
          }, 0);
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
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
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

    setTimeout(() => {
      attributes.forEach((data: AttributeData) => {
        let node = <Element>this.recreateNode(data);

        if (node) {
          Object.keys(data[NodeDataTypes.attributes]).forEach((attrName) => {
            let newVal = data[NodeDataTypes.attributes][attrName];
            if (newVal === null) {
              node.removeAttribute(attrName);
            } else {
              try {
                // TODO - id rather just use this internally but need baseURL some how....
                this.delegate.setAttribute(node, attrName, newVal);
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
          node.textContent = data[NodeDataTypes.textContent];
        }
      });

      removed.forEach((node) => {
        delete this.nodeIdMap[node[NodeDataTypes.id]];
      });
    }, 0);
  }
}
