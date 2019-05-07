import StringMap from "./interfaces/StringMap";

export default class NodeChange {
  public node: Node;
  public added: boolean = false;
  public childList: boolean = false;
  public oldParentNode: Node = null;
  public attributes: boolean = false;
  public characterData: boolean = false;
  public characterDataOldValue: string = null;

  protected attributeOldValues: StringMap<string> = null;

  constructor(node: Node) {
    this.node = node;
  }

  getAttributeOldValue(name: string): string {
    if (!this.attributeOldValues) {
      return undefined;
    }
    return this.attributeOldValues[name];
  }

  getAttributeNamesMutated(): string[] {
    let names: string[] = [];
    if (!this.attributeOldValues) return names;
    for (let name in this.attributeOldValues) {
      names.push(name);
    }
    return names;
  }

  attributeMutated(name: string, oldValue: string) {
    this.attributes = true;
    this.attributeOldValues = this.attributeOldValues || {};

    if (name in this.attributeOldValues) {
      return;
    }

    this.attributeOldValues[name] = oldValue;
  }

  characterDataMutated(oldValue: string) {
    if (this.characterData) {
      return;
    }
    this.characterData = true;
    this.characterDataOldValue = oldValue;
  }

  // Note: is it possible to receive a removal followed by a removal. This
  // can occur if the removed node is added to an non-observed node, that
  // node is added to the observed area, and then the node removed from it.
  removedFromParent(parent: Node) {
    this.childList = true;
    if (this.added || this.oldParentNode) {
      this.added = false;
    } else {
      this.oldParentNode = parent;
    }
  }

  insertedIntoParent() {
    this.childList = true;
    this.added = true;
  }

  // An node's oldParent is
  //   -its present parent, if its parentNode was not changed.
  //   -null if the first thing that happened to it was an add.
  //   -the node it was removed from if the first thing that happened to it was a remove.
  getOldParent() {
    if (this.childList) {
      if (this.oldParentNode) {
        return this.oldParentNode;
      }
      if (this.added) {
        return null;
      }
    }

    return this.node.getRootNode();
  }
}
