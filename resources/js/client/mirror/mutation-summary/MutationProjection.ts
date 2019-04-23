import NodeMap from "./NodeMap";
import TreeChanges from "./TreeChanges";
import ChildListChange from "./ChildListChange";
import NumberMap from "./interfaces/NumberMap";
import StringMap from "./interfaces/StringMap";
import Selector from "./Selector";
import Summary from "./Summary";
import { Movement } from "./enums/Movement";

export default class MutationProjection {
  private treeChanges: TreeChanges;
  private entered: Node[];
  private exited: Node[];
  private stayedIn: NodeMap<Movement>;
  private visited: NodeMap<boolean>;
  private childListChangeMap: NodeMap<ChildListChange>;
  private characterDataOnly: boolean;
  private matchCache: NumberMap<NodeMap<Movement>>;

  // TOOD(any)
  constructor(
    public rootNode: Node,
    public mutations: MutationRecord[],
    public selectors: Selector[],
    public calcReordered: boolean,
    public calcOldPreviousSibling: boolean,
  ) {
    this.treeChanges = new TreeChanges(rootNode, mutations);
    this.entered = [];
    this.exited = [];
    this.stayedIn = new NodeMap<Movement>();
    this.visited = new NodeMap<boolean>();
    this.childListChangeMap = undefined;
    this.characterDataOnly = undefined;
    this.matchCache = undefined;

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
      this.visitNode(changedNodes[i], undefined);
    }
  }

  public visitNode(node: Node, parentReachable: Movement) {
    if (this.visited.has(node)) return;

    this.visited.set(node, true);

    let change = this.treeChanges.get(node);
    let reachable = parentReachable;

    // node inherits its parent's reachability change unless
    // its parentNode was mutated.
    if ((change && change.childList) || reachable == undefined)
      reachable = this.treeChanges.reachabilityChange(node);

    if (reachable === Movement.STAYED_OUT) return;

    // Cache match results for sub-patterns.
    this.matchabilityChange(node);

    if (reachable === Movement.ENTERED) {
      this.entered.push(node);
    } else if (reachable === Movement.EXITED) {
      this.exited.push(node);
      this.ensureHasOldPreviousSiblingIfNeeded(node);
    } else if (reachable === Movement.STAYED_IN) {
      let movement = Movement.STAYED_IN;

      if (change && change.childList) {
        if (change.oldParentNode !== node.parentNode) {
          movement = Movement.REPARENTED;
          this.ensureHasOldPreviousSiblingIfNeeded(node);
        } else if (this.calcReordered && this.wasReordered(node)) {
          movement = Movement.REORDERED;
        }
      }

      this.stayedIn.set(node, movement);
    }

    if (reachable === Movement.STAYED_IN) return;

    // reachable === ENTERED || reachable === EXITED.
    for (let child = <Node>node.firstChild; child; child = child.nextSibling) {
      this.visitNode(child, reachable);
    }
  }

  public ensureHasOldPreviousSiblingIfNeeded(node: Node) {
    if (!this.calcOldPreviousSibling) return;

    this.processChildlistChanges();

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

  public getChanged(summary: Summary) {
    for (let i = 0; i < this.entered.length; i++) {
      let node = this.entered[i];
      let matchable = this.matchabilityChange(node);
      if (matchable === Movement.ENTERED || matchable === Movement.STAYED_IN) {
        summary.added.push(node);
      }
    }

    let stayedInNodes = this.stayedIn.keys();
    for (let i = 0; i < stayedInNodes.length; i++) {
      let node = stayedInNodes[i];
      let matchable = this.matchabilityChange(node);

      if (matchable === Movement.ENTERED) {
        summary.added.push(node);
      } else if (matchable === Movement.EXITED) {
        summary.removed.push(node);
      } else if (
        matchable === Movement.STAYED_IN &&
        (summary.reparented || summary.reordered)
      ) {
        let movement: Movement = this.stayedIn.get(node);
        if (summary.reparented && movement === Movement.REPARENTED)
          summary.reparented.push(node);
        else if (summary.reordered && movement === Movement.REORDERED)
          summary.reordered.push(node);
      }
    }

    for (let i = 0; i < this.exited.length; i++) {
      let node = this.exited[i];
      let matchable = this.matchabilityChange(node);
      if (matchable === Movement.EXITED || matchable === Movement.STAYED_IN)
        summary.removed.push(node);
    }
  }

  public getOldParentNode(node: Node): Node {
    let change = this.treeChanges.get(node);
    if (change && change.childList)
      return change.oldParentNode ? change.oldParentNode : null;

    let reachabilityChange = this.treeChanges.reachabilityChange(node);
    if (
      reachabilityChange === Movement.STAYED_OUT ||
      reachabilityChange === Movement.ENTERED
    )
      throw Error("getOldParentNode requested on invalid node.");

    return node.parentNode;
  }

  public getOldPreviousSibling(node: Node): Node {
    let parentNode = <Node>node.parentNode;
    let nodeChange = this.treeChanges.get(node);
    if (nodeChange && nodeChange.oldParentNode) {
      parentNode = nodeChange.oldParentNode;
    }

    let change = this.childListChangeMap.get(parentNode);
    if (!change)
      throw Error("getOldPreviousSibling requested on invalid node.");

    return change.oldPrevious.get(node);
  }

  public getOldAttribute(element: Node, attrName: string): string {
    let change = this.treeChanges.get(element);
    if (!change || !change.attributes)
      throw Error("getOldAttribute requested on invalid node.");

    let value = change.getAttributeOldValue(attrName);
    if (value === undefined)
      throw Error("getOldAttribute requested for unchanged attribute name.");

    return value;
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
        Movement.STAYED_IN !== this.treeChanges.reachabilityChange(node) ||
        Movement.STAYED_IN !== this.matchabilityChange(node)
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

  public getOldCharacterData(node: Node): string {
    let change = this.treeChanges.get(node);
    if (!change || !change.characterData)
      throw Error("getOldCharacterData requested on invalid node.");

    return change.characterDataOldValue;
  }

  public getCharacterDataChanged(): Node[] {
    if (!this.treeChanges.anyCharacterDataChanged) return []; // No characterData mutations occurred.

    let nodes = this.treeChanges.keys();
    let result: Node[] = [];
    for (let i = 0; i < nodes.length; i++) {
      let target = nodes[i];
      if (Movement.STAYED_IN !== this.treeChanges.reachabilityChange(target))
        continue;

      let change = this.treeChanges.get(target);
      if (
        !change.characterData ||
        target.textContent == change.characterDataOldValue
      )
        continue;

      result.push(target);
    }

    return result;
  }

  public computeMatchabilityChange(selector: Selector, el: Element): Movement {
    if (!this.matchCache) this.matchCache = [];
    if (!this.matchCache[selector.uid])
      this.matchCache[selector.uid] = new NodeMap<Movement>();

    let cache = this.matchCache[selector.uid];
    let result = cache.get(el);
    if (result === undefined) {
      result = selector.matchabilityChange(el, this.treeChanges.get(el));
      cache.set(el, result);
    }
    return result;
  }

  public matchabilityChange(node: Node): Movement {
    // TODO(rafaelw): Include PI, CDATA?
    // Only include text nodes.
    if (this.characterDataOnly) {
      switch (node.nodeType) {
        case Node.COMMENT_NODE:
        case Node.TEXT_NODE:
          return Movement.STAYED_IN;
        default:
          return Movement.STAYED_OUT;
      }
    }

    // No element filter. Include all nodes.
    if (!this.selectors) return Movement.STAYED_IN;

    // Element filter. Exclude non-elements.
    if (node.nodeType !== Node.ELEMENT_NODE) return Movement.STAYED_OUT;

    let el = <Element>node;

    let matchChanges = this.selectors.map((selector: Selector) => {
      return this.computeMatchabilityChange(selector, el);
    });

    let accum: Movement = Movement.STAYED_OUT;
    let i = 0;

    while (accum !== Movement.STAYED_IN && i < matchChanges.length) {
      switch (matchChanges[i]) {
        case Movement.STAYED_IN:
          accum = Movement.STAYED_IN;
          break;
        case Movement.ENTERED:
          if (accum === Movement.EXITED) accum = Movement.STAYED_IN;
          else accum = Movement.ENTERED;
          break;
        case Movement.EXITED:
          if (accum === Movement.ENTERED) accum = Movement.STAYED_IN;
          else accum = Movement.EXITED;
          break;
      }

      i++;
    }

    return accum;
  }

  public getChildlistChange(el: Element): ChildListChange {
    let change = this.childListChangeMap.get(el);
    if (!change) {
      change = new ChildListChange();
      this.childListChangeMap.set(el, change);
    }

    return change;
  }

  public processChildlistChanges() {
    if (this.childListChangeMap) return;

    this.childListChangeMap = new NodeMap<ChildListChange>();

    for (let i = 0; i < this.mutations.length; i++) {
      let mutation = this.mutations[i];
      if (mutation.type != "childList") continue;

      if (
        this.treeChanges.reachabilityChange(mutation.target) !==
          Movement.STAYED_IN &&
        !this.calcOldPreviousSibling
      )
        continue;

      let change = this.getChildlistChange(<Element>mutation.target);

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

    this.processChildlistChanges();

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
