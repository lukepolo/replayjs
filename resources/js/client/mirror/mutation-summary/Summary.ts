import StringMap from "./interfaces/StringMap";
import MutationProjection from "./MutationProjection";

export default class Summary {
  public addedNodes: Node[];
  public textChanges: Node[];
  public removedNodes: Node[];
  public attributeChanges: StringMap<Element[]>;

  constructor(rootNode: Node, mutations: MutationRecord[]) {
    let projection = new MutationProjection(rootNode, mutations);
    this.getChanged(projection);
  }

  // TODO - really we dont need this.... summary should just be the projection...
  public getChanged(projection: MutationProjection) {
    this.addedNodes = projection.addedNodes;
    this.removedNodes = projection.removedNodes;
    this.textChanges = projection.getTextChanges();
    this.attributeChanges = projection.getAttributeChanges();
  }
}
