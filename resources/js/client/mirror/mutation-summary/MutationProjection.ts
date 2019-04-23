import NodeMap from "./NodeMap";
import TreeChanges from "./TreeChanges";
import StringMap from "./interfaces/StringMap";
import ChildListChange from "./ChildListChange";
import { NodeMovement } from "./enums/NodeMovement";

export default class MutationProjection {
  public entered: Node[];
  public exited: Node[];
  public stayedIn: NodeMap<NodeMovement>;

  private treeChanges: TreeChanges;
  private visited: NodeMap<boolean>;
  private childListChangeMap: NodeMap<ChildListChange>;

  constructor(
    public rootNode: Node,
    public mutations: MutationRecord[],
    public calcOldPreviousSibling: boolean,
  ) {
    this.treeChanges = new TreeChanges(rootNode, mutations);
    this.entered = [];
    this.exited = [];
    this.stayedIn = new NodeMap<NodeMovement>();
    this.visited = new NodeMap<boolean>();
    this.childListChangeMap = undefined;

    this.processMutations();
  }

  public processMutations() {
    if (
      !this.treeChanges.anyParentsChanged &&
      !this.treeChanges.anyAttributesChanged
    )
      return;

    let changedNodes: Node[] = this.treeChanges.keys();
    for (let i = 0; i < changedNodes.length; i++) {
      this.visitNode(changedNodes[i]);
    }
  }

  public visitNode(node: Node, parentReachable?: NodeMovement) {
    if (this.visited.has(node)) {
      return;
    }

    this.visited.set(node, true);

    let reachable = parentReachable;
    let change = this.treeChanges.get(node);

    // node inherits its parent's reachability change unless
    // its parentNode was mutated.
    if ((change && change.childList) || reachable == undefined) {
      reachable = this.treeChanges.reachabilityChange(node);
    }

    if (reachable === NodeMovement.STAYED_OUT) {
      return;
    }

    if (reachable === NodeMovement.ENTERED) {
      this.entered.push(node);
    } else if (reachable === NodeMovement.EXITED) {
      this.exited.push(node);
      this.ensureHasOldPreviousSiblingIfNeeded(node);
    } else if (reachable === NodeMovement.STAYED_IN) {
      let movement = NodeMovement.STAYED_IN;

      if (change && change.childList) {
        if (change.oldParentNode !== node.parentNode) {
          movement = NodeMovement.REPARENTED;
          this.ensureHasOldPreviousSiblingIfNeeded(node);
        } else if (this.wasReordered(node)) {
          movement = NodeMovement.REORDERED;
        }
      }

      this.stayedIn.set(node, movement);
    }

    if (reachable === NodeMovement.STAYED_IN) {
      return;
    }

    for (let child = <Node>node.firstChild; child; child = child.nextSibling) {
      this.visitNode(child, reachable);
    }
  }

  private ensureHasOldPreviousSiblingIfNeeded(node: Node) {
    if (!this.calcOldPreviousSibling) return;

    this.processChildListChanges();

    let parentNode = <Node>node.parentNode;
    let nodeChange = this.treeChanges.get(node);
    if (nodeChange && nodeChange.oldParentNode) {
      parentNode = nodeChange.oldParentNode;
    }

    let change = this.childListChangeMap.get(parentNode);
    if (!change) {
      change = new ChildListChange();
      this.childListChangeMap.set(parentNode, change);
    }

    if (!change.oldPrevious.has(node)) {
      change.oldPrevious.set(node, node.previousSibling);
    }
  }

  public attributeChangedNodes(): StringMap<Element[]> {
    if (!this.treeChanges.anyAttributesChanged) return {}; // No attributes mutations occurred.

    let attributeFilter: StringMap<boolean>;
    let caseInsensitiveFilter: StringMap<string>;

    let result: StringMap<Element[]> = {};
    let nodes = this.treeChanges.keys();

    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];

      let change = this.treeChanges.get(node);
      if (!change.attributes) continue;

      if (
        NodeMovement.STAYED_IN !== this.treeChanges.reachabilityChange(node)
      ) {
        continue;
      }

      let element = <Element>node;
      let changedAttrNames = change.getAttributeNamesMutated();
      for (let j = 0; j < changedAttrNames.length; j++) {
        let attrName = changedAttrNames[j];

        if (
          attributeFilter &&
          !attributeFilter[attrName] &&
          !(change.isCaseInsensitive && caseInsensitiveFilter[attrName])
        ) {
          continue;
        }

        let oldValue = change.getAttributeOldValue(attrName);
        if (oldValue === element.getAttribute(attrName)) continue;

        if (caseInsensitiveFilter && change.isCaseInsensitive)
          attrName = caseInsensitiveFilter[attrName];

        result[attrName] = result[attrName] || [];
        result[attrName].push(element);
      }
    }

    return result;
  }

  public getCharacterDataChanged(): Node[] {
    if (!this.treeChanges.anyCharacterDataChanged) {
      return [];
    }

    let nodes = this.treeChanges.keys();
    let result: Node[] = [];
    nodes.forEach((node) => {
      if (
        this.treeChanges.reachabilityChange(node) !== NodeMovement.STAYED_IN
      ) {
        return;
      }
      let change = this.treeChanges.get(node);
      if (
        !change.characterData ||
        node.textContent == change.characterDataOldValue
      ) {
        return;
      }
      result.push(node);
    });
    return result;
  }

  public getChildListChange(el: Element): ChildListChange {
    let change = this.childListChangeMap.get(el);
    if (!change) {
      change = new ChildListChange();
      this.childListChangeMap.set(el, change);
    }

    return change;
  }

  public processChildListChanges() {
    if (this.childListChangeMap) return;

    this.childListChangeMap = new NodeMap<ChildListChange>();

    for (let i = 0; i < this.mutations.length; i++) {
      let mutation = this.mutations[i];
      if (mutation.type != "childList") continue;

      if (
        this.treeChanges.reachabilityChange(mutation.target) !==
          NodeMovement.STAYED_IN &&
        !this.calcOldPreviousSibling
      )
        continue;

      let change = this.getChildListChange(<Element>mutation.target);

      let oldPrevious = mutation.previousSibling;

      function recordOldPrevious(node: Node, previous: Node) {
        if (
          !node ||
          change.oldPrevious.has(node) ||
          change.added.has(node) ||
          change.maybeMoved.has(node)
        )
          return;

        if (
          previous &&
          (change.added.has(previous) || change.maybeMoved.has(previous))
        )
          return;

        change.oldPrevious.set(node, previous);
      }

      for (let j = 0; j < mutation.removedNodes.length; j++) {
        let node = mutation.removedNodes[j];
        recordOldPrevious(node, oldPrevious);

        if (change.added.has(node)) {
          change.added.delete(node);
        } else {
          change.removed.set(node, true);
          change.maybeMoved.delete(node);
        }

        oldPrevious = node;
      }

      recordOldPrevious(mutation.nextSibling, oldPrevious);

      for (let j = 0; j < mutation.addedNodes.length; j++) {
        let node = mutation.addedNodes[j];
        if (change.removed.has(node)) {
          change.removed.delete(node);
          change.maybeMoved.set(node, true);
        } else {
          change.added.set(node, true);
        }
      }
    }
  }

  public wasReordered(node: Node) {
    if (!this.treeChanges.anyParentsChanged) return false;

    this.processChildListChanges();

    let parentNode = <Node>node.parentNode;
    let nodeChange = this.treeChanges.get(node);
    if (nodeChange && nodeChange.oldParentNode) {
      parentNode = nodeChange.oldParentNode;
    }

    let change = this.childListChangeMap.get(parentNode);
    if (!change) return false;

    if (change.moved) return change.moved.get(node);

    change.moved = new NodeMap<boolean>();
    let pendingMoveDecision = new NodeMap<boolean>();

    function isMoved(node: Node) {
      if (!node || !change.maybeMoved.has(node)) {
        return false;
      }

      let didMove = change.moved.get(node);
      if (didMove !== undefined) return didMove;

      if (pendingMoveDecision.has(node)) {
        didMove = true;
      } else {
        pendingMoveDecision.set(node, true);
        didMove = getPrevious(node) !== getOldPrevious(node);
      }

      if (pendingMoveDecision.has(node)) {
        pendingMoveDecision.delete(node);
        change.moved.set(node, didMove);
      } else {
        didMove = change.moved.get(node);
      }

      return didMove;
    }

    let oldPreviousCache = new NodeMap<Node>();
    function getOldPrevious(node: Node): Node {
      let oldPrevious = oldPreviousCache.get(node);
      if (oldPrevious !== undefined) return oldPrevious;

      oldPrevious = change.oldPrevious.get(node);
      while (
        oldPrevious &&
        (change.removed.has(oldPrevious) || isMoved(oldPrevious))
      ) {
        oldPrevious = getOldPrevious(oldPrevious);
      }

      if (oldPrevious === undefined) oldPrevious = node.previousSibling;
      oldPreviousCache.set(node, oldPrevious);

      return oldPrevious;
    }

    let previousCache = new NodeMap<Node>();
    function getPrevious(node: Node): Node {
      if (previousCache.has(node)) return previousCache.get(node);

      let previous = node.previousSibling;
      while (previous && (change.added.has(previous) || isMoved(previous)))
        previous = previous.previousSibling;

      previousCache.set(node, previous);
      return previous;
    }

    change.maybeMoved.keys().forEach(isMoved);
    return change.moved.get(node);
  }
}
