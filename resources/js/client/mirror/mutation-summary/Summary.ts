import StringMap from "./interfaces/StringMap";
import MutationProjection from "./MutationProjection";

export default class Summary {
  public added: Node[];
  public removed: Node[];
  public reparented: Node[];
  public reordered: Node[];
  public valueChanged: Node[];
  public attributeChanged: StringMap<Element[]>;
  public characterDataChanged: Node[];

  constructor(private projection: MutationProjection) {
    this.added = [];
    this.removed = [];
    this.reparented = [];
    this.reordered = [];

    projection.getChanged(this);

    this.attributeChanged = projection.attributeChangedNodes();
    this.characterDataChanged = projection.getCharacterDataChanged();
    this.getOldPreviousSibling = projection.getOldPreviousSibling.bind(
      projection,
    );
  }

  getOldParentNode(node: Node): Node {
    return this.projection.getOldParentNode(node);
  }

  getOldAttribute(node: Node, name: string): string {
    return this.projection.getOldAttribute(node, name);
  }

  getOldCharacterData(node: Node): string {
    return this.projection.getOldCharacterData(node);
  }

  getOldPreviousSibling(node: Node): Node {
    return this.projection.getOldPreviousSibling(node);
  }
}
