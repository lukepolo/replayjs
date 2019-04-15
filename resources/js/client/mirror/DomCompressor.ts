import LzString from "lz-string";
import NodeData, { NodeDataTypes } from "./interfaces/NodeData";

export default class DomCompressor {
  compressNode(node: NodeData): NodeData {
    if (node[NodeDataTypes.textContent] || node[NodeDataTypes.attributes]) {
      node[NodeDataTypes.compressed] = true;
    }

    if (node[NodeDataTypes.textContent]) {
      node[NodeDataTypes.textContent] = LzString.compressToUTF16(
        node[NodeDataTypes.textContent],
      );
    }

    if (node[NodeDataTypes.attributes]) {
      Object.keys(node[NodeDataTypes.attributes]).forEach((attributeName) => {
        node[NodeDataTypes.attributes][
          attributeName
        ] = LzString.compressToUTF16(
          node[NodeDataTypes.attributes][attributeName],
        );
      });
    }

    return node;
  }

  decompressNode(node: NodeData): NodeData {
    if (!node[NodeDataTypes.compressed]) {
      return node;
    }

    if (node[NodeDataTypes.textContent]) {
      node[NodeDataTypes.textContent] = LzString.decompressFromUTF16(
        node[NodeDataTypes.textContent],
      );
    }

    if (node[NodeDataTypes.attributes]) {
      Object.keys(node[NodeDataTypes.attributes]).forEach((attributeName) => {
        node[NodeDataTypes.attributes][
          attributeName
        ] = this.decompressAttribute(
          node[NodeDataTypes.attributes][attributeName],
        );
      });
    }

    node[NodeDataTypes.compressed] = false;

    return node;
  }

  public compressAttribute(attribute: string): string {
    return LzString.compressToUTF16(attribute);
  }

  public decompressAttribute(attribute: string): string {
    return LzString.decompressFromUTF16(attribute);
  }
}
