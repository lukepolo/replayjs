import LzString from "lz-string";
import NodeData from "./interfaces/NodeData";

export default class DomCompressor {
  compressNode(node: NodeData): NodeData {
    if (node.textContent || node.attributes) {
      node.compressed = true;
    }

    if (node.textContent) {
      node.textContent = LzString.compressToUTF16(node.textContent);
    }

    if (node.attributes) {
      Object.keys(node.attributes).forEach((attributeName) => {
        node.attributes[attributeName] = LzString.compressToUTF16(
          node.attributes[attributeName],
        );
      });
    }

    return node;
  }

  decompressNode(node: NodeData): NodeData {
    if (!node.compressed) {
      return node;
    }

    if (node.textContent) {
      node.textContent = LzString.decompressFromUTF16(node.textContent);
    }

    if (node.attributes) {
      Object.keys(node.attributes).forEach((attributeName) => {
        node.attributes[attributeName] = this.decompressAttribute(
          node.attributes[attributeName],
        );
      });
    }

    node.compressed = false;

    return node;
  }

  public compressAttribute(attribute: string): string {
    return LzString.compressToUTF16(attribute);
  }

  public decompressAttribute(attribute: string): string {
    return LzString.decompressFromUTF16(attribute);
  }
}
