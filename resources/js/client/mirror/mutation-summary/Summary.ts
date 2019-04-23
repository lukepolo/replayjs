import { Movement } from "./enums/Movement";
import StringMap from "./interfaces/StringMap";
import MutationProjection from "./MutationProjection";

export default class Summary {
  public added: Node[];
  public removed: Node[];
  public reparented: Node[];
  public reordered: Node[];
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
      let movement: Movement = projection.stayedIn.get(node);
      if (this.reparented && movement === Movement.REPARENTED) {
        this.reparented.push(node);
      } else if (this.reordered && movement === Movement.REORDERED) {
        this.reordered.push(node);
      }
    });

    projection.exited.forEach((node) => {
      this.removed.push(node);
    });
  }
}
