import NodeMap from "./NodeMap";
import NodeChange from "./NodeChange";
import { NodeMovement } from "./enums/NodeMovement";

export default class TreeChanges extends NodeMap<NodeChange> {
  public anyParentsChanged: boolean;
  public anyAttributesChanged: boolean;
  public anyCharacterDataChanged: boolean;

  private reachableCache: NodeMap<boolean>;
  private wasReachableCache: NodeMap<boolean>;

  private rootNode: Node;

  constructor(rootNode: Node, mutations: MutationRecord[]) {
    super();

    this.rootNode = rootNode;
    this.reachableCache = undefined;
    this.wasReachableCache = undefined;
    this.anyParentsChanged = false;
    this.anyAttributesChanged = false;
    this.anyCharacterDataChanged = false;

    for (let m = 0; m < mutations.length; m++) {
      let mutation = mutations[m];
      switch (mutation.type) {
        case "childList":
          this.anyParentsChanged = true;
          for (let i = 0; i < mutation.removedNodes.length; i++) {
            let node = mutation.removedNodes[i];
            this.getChange(node).removedFromParent(mutation.target);
          }
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            let node = mutation.addedNodes[i];
            this.getChange(node).insertedIntoParent();
          }
          break;

        case "attributes":
          this.anyAttributesChanged = true;
          this.getChange(mutation.target).attributeMutated(
            mutation.attributeName,
            mutation.oldValue,
          );
          break;

        case "characterData":
          this.anyCharacterDataChanged = true;
          this.getChange(mutation.target).characterDataMutated(
            mutation.oldValue,
          );
          break;
      }
    }
  }

  public getChange(node: Node): NodeChange {
    let cachedNode = this.get(node);
    if (!cachedNode) {
      cachedNode = new NodeChange(node);
      this.set(node, cachedNode);
    }
    return cachedNode;
  }

  public getOldParent(node: Node): Node {
    let change = this.get(node);
    return change ? change.getOldParent() : node.parentNode;
  }

  public getIsReachable(node: Node): boolean {
    if (node === this.rootNode) {
      return true;
    }

    if (!node) {
      return false;
    }

    this.reachableCache = this.reachableCache || new NodeMap<boolean>();
    let isReachable = this.reachableCache.get(node);
    if (isReachable === undefined) {
      isReachable = this.getIsReachable(node.parentNode);
      this.reachableCache.set(node, isReachable);
    }
    return isReachable;
  }

  // A node wasReachable if its oldParent wasReachable.
  public getWasReachable(node: Node): boolean {
    if (node === this.rootNode) {
      return true;
    }
    if (!node) {
      return false;
    }

    this.wasReachableCache = this.wasReachableCache || new NodeMap<boolean>();
    let wasReachable: boolean = this.wasReachableCache.get(node);
    if (wasReachable === undefined) {
      wasReachable = this.getWasReachable(this.getOldParent(node));
      this.wasReachableCache.set(node, wasReachable);
    }
    return wasReachable;
  }

  public reachabilityChange(node: Node): NodeMovement {
    if (this.getIsReachable(node)) {
      return this.getWasReachable(node)
        ? NodeMovement.STAYED_IN
        : NodeMovement.ENTERED;
    }

    return this.getWasReachable(node)
      ? NodeMovement.EXITED
      : NodeMovement.STAYED_OUT;
  }
}
