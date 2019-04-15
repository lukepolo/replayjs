import LzString from "lz-string";

export default class DomCompressor {
  compressNode(node) {
    return LzString.compressToUTF16(node);
  }

  decompressNode(node) {
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

  public compressAttribute(attribute) {
    return LzString.compressToUTF16(attribute);
  }

  public decompressAttribute(attribute) {
    return LzString.decompressFromUTF16(attribute);
  }
}
