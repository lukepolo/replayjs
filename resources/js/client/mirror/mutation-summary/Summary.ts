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

  constructor(private projection: MutationProjection) {
    this.added = [];
    this.removed = [];
    this.reparented = [];
    this.reordered = [];

    this.getChanged(projection);
    this.attributeChanged = projection.attributeChangedNodes();
    this.characterDataChanged = projection.getCharacterDataChanged();
  }

  public getChanged(projection: MutationProjection) {
    projection.entered.forEach((node) => {
      let matchable = projection.matchabilityChange(node);
      if (matchable === Movement.ENTERED || matchable === Movement.STAYED_IN) {
        this.added.push(node);
      }
    });

    projection.stayedIn.keys().forEach((node) => {
      switch (projection.matchabilityChange(node)) {
        case Movement.ENTERED:
          this.added.push(node);
          break;
        case Movement.EXITED:
          this.removed.push(node);
          break;
        case Movement.STAYED_IN:
          let movement: Movement = projection.stayedIn.get(node);
          if (this.reparented && movement === Movement.REPARENTED) {
            this.reparented.push(node);
          } else if (this.reordered && movement === Movement.REORDERED) {
            this.reordered.push(node);
          }
          break;
      }
    });

    projection.exited.forEach((node) => {
      let matchable = projection.matchabilityChange(node);
      if (matchable === Movement.EXITED || matchable === Movement.STAYED_IN) {
        this.removed.push(node);
      }
    });
  }
}
