import NodeMap from "./NodeMap";
import TreeChanges from "./TreeChanges";
import StringMap from "./interfaces/StringMap";
import ChildListChange from "./ChildListChange";
import { NodeMovement } from "./enums/NodeMovement";

export default class MutationProjection {
  public entered: Node[];
  public exited: Node[];

  protected treeChanges: TreeChanges;
  protected visitedNodes: NodeMap<boolean>;
  protected childListChangeMap: NodeMap<ChildListChange>;

  constructor(public rootNode: Node, public mutations: MutationRecord[]) {
    this.exited = [];
    this.entered = [];
    this.childListChangeMap = undefined;
    this.visitedNodes = new NodeMap<boolean>();
    this.treeChanges = new TreeChanges(rootNode, mutations);
    this.processMutations();
  }

  protected processMutations() {
    if (
      !this.treeChanges.anyParentsChanged &&
      !this.treeChanges.anyAttributesChanged
    ) {
      return;
    }
    this.treeChanges.keys().forEach((node) => {
      this.visitNode(node);
    });
  }

  protected visitNode(node: Node, parentReachable?: NodeMovement) {
    if (this.visitedNodes.has(node)) {
      return;
    }

    this.visitedNodes.set(node, true);

    let reachable = parentReachable;
    let change = this.treeChanges.get(node);

    // node inherits its parent's reachability change unless
    // its parentNode was mutated.
    if ((change && change.childList) || reachable == undefined) {
      reachable = this.treeChanges.reachabilityChange(node);
    }

    if (
      reachable === NodeMovement.ENTERED ||
      reachable === NodeMovement.STAYED_IN
    ) {
      this.entered.push(node);
    } else if (reachable === NodeMovement.EXITED) {
      this.exited.push(node);
    }

    for (let child = <Node>node.firstChild; child; child = child.nextSibling) {
      this.visitNode(child, reachable);
    }
  }

  public attributeChangedNodes(): StringMap<Element[]> {
    if (!this.treeChanges.anyAttributesChanged) {
      return {};
    }

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
}
