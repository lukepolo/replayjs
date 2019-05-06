import NodeMap from "./NodeMap";
import NodeChange from "./NodeChange";
import { NodeMovement } from "./enums/NodeMovement";

export default class TreeChanges extends NodeMap<NodeChange> {
  public anyParentsChanged: boolean;
  public anyAttributesChanged: boolean;
  public anyCharacterDataChanged: boolean;

  private rootNode: Node;
  private wasReachableCache: NodeMap<boolean>;

  constructor(rootNode: Node, mutations: MutationRecord[]) {
    super();

    this.rootNode = rootNode;
    this.anyParentsChanged = false;
    this.anyAttributesChanged = false;
    this.anyCharacterDataChanged = false;
    this.wasReachableCache = new NodeMap<boolean>();

    for (let m = 0; m < mutations.length; m++) {
      let mutation = mutations[m];
      switch (mutation.type) {
        case "childList":
          this.anyParentsChanged = true;
          mutation.addedNodes.forEach((node) => {
            this.getChange(node).insertedIntoParent();
          });
          mutation.removedNodes.forEach((node) => {
            this.getChange(node).removedFromParent(mutation.target);
          });
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
        default:
          console.info(`Missing mutation type change ${mutation.type}`);
          break;
      }
    }
  }

  public reachabilityChange(node: Node): NodeMovement {
    if (node.getRootNode() === this.rootNode) {
      return this.getWasReachable(node)
        ? NodeMovement.STAYED_IN
        : NodeMovement.ENTERED;
    }
    return NodeMovement.EXITED;
  }

  private getChange(node: Node): NodeChange {
    let cachedNode = this.get(node);
    if (!cachedNode) {
      cachedNode = this.set(node, new NodeChange(node));
    }
    return cachedNode;
  }

  // A node wasReachable if its oldParent wasReachable.
  private getWasReachable(node: Node): boolean {
    if (node === this.rootNode) {
      return true;
    }
    if (!node) {
      return false;
    }
    let wasReachable: boolean = this.wasReachableCache.get(node);
    if (wasReachable === undefined) {
      wasReachable = this.getWasReachable(this.getOldParent(node));
      this.wasReachableCache.set(node, wasReachable);
    }
    return wasReachable;
  }

  private getOldParent(node: Node): Node {
    let change = this.get(node);
    return change ? change.getOldParent() : node.getRootNode();
  }
}
