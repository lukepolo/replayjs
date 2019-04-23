import StringMap from "./interfaces/StringMap";
import { NodeMovement } from "./enums/NodeMovement";
import MutationProjection from "./MutationProjection";

export default class Summary {
  public added: Node[];
  public removed: Node[];
  public reordered: Node[];
  public reparented: Node[];
  public characterDataChanged: Node[];
  public attributeChanged: StringMap<Element[]>;

  constructor(
    rootNode: Node,
    mutations: MutationRecord[],
    calcOldPreviousSibling: boolean,
  ) {
    this.added = [];
    this.removed = [];
    this.reparented = [];
    this.reordered = [];

    let projection = new MutationProjection(
      rootNode,
      mutations,
      calcOldPreviousSibling,
    );

    this.getChanged(projection);
    this.attributeChanged = projection.attributeChangedNodes();
    this.characterDataChanged = projection.getCharacterDataChanged();
  }

  public getChanged(projection: MutationProjection) {
    projection.entered.forEach((node) => {
      this.added.push(node);
    });

    projection.stayedIn.keys().forEach((node) => {
      let movement: NodeMovement = projection.stayedIn.get(node);
      if (this.reparented && movement === NodeMovement.REPARENTED) {
        this.reparented.push(node);
      } else if (this.reordered && movement === NodeMovement.REORDERED) {
        this.reordered.push(node);
      }
    });

    projection.exited.forEach((node) => {
      this.removed.push(node);
    });
  }
}
