import StringMap from "./interfaces/StringMap";
import MutationProjection from "./MutationProjection";

export default class Summary {
  public added: Node[];
  public removed: Node[];
  public characterDataChanged: Node[];
  public attributeChanged: StringMap<Element[]>;

  constructor(rootNode: Node, mutations: MutationRecord[]) {
    this.added = [];
    this.removed = [];

    let projection = new MutationProjection(rootNode, mutations);
    this.getChanged(projection);
  }

  // TODO - really we dont need this.... summary should just be the projection...
  public getChanged(projection: MutationProjection) {
    this.added = projection.entered;
    this.removed = projection.exited;
    this.attributeChanged = projection.attributeChangedNodes();
    this.characterDataChanged = projection.getCharacterDataChanged();
  }
}
