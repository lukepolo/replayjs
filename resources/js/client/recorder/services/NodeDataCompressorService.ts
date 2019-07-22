import LzString from "lz-string";
import NodeData, { NodeDataTypes } from "../interfaces/NodeData";

export default class NodeDataCompressorService {
  public compressNode(node: NodeData): NodeData {
    if (node[NodeDataTypes.compressed]) {
      return node;
    }

    if (node[NodeDataTypes.textContent]) {
      node[NodeDataTypes.textContent] = this.compressData(
        node[NodeDataTypes.textContent],
      );
    }

    if (node[NodeDataTypes.attributes]) {
      Object.keys(node[NodeDataTypes.attributes]).forEach((attributeName) => {
        node[NodeDataTypes.attributes][attributeName] = this.compressData(
          node[NodeDataTypes.attributes][attributeName],
        );
      });
    }

    node[NodeDataTypes.compressed] = true;

    return node;
  }

  public decompressNode(node: NodeData): NodeData {
    if (!node[NodeDataTypes.compressed]) {
      return node;
    }

    if (node[NodeDataTypes.textContent]) {
      node[NodeDataTypes.textContent] = this.decompressData(
        node[NodeDataTypes.textContent],
      );
    }

    if (node[NodeDataTypes.attributes]) {
      Object.keys(node[NodeDataTypes.attributes]).forEach((attributeName) => {
        node[NodeDataTypes.attributes][attributeName] = this.decompressData(
          node[NodeDataTypes.attributes][attributeName],
        );
      });
    }

    node[NodeDataTypes.compressed] = false;

    return node;
  }

  public compressData(data: string): string {
    return LzString.compressToUTF16(data);
  }

  public decompressData(data: string): string {
    return LzString.decompressFromUTF16(data);
  }
}
