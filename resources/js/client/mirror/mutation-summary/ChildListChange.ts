import NodeMap from "./NodeMap";

export default class ChildListChange {
  public added: NodeMap<boolean>;
  public removed: NodeMap<boolean>;
  public maybeMoved: NodeMap<boolean>;
  public oldPrevious: NodeMap<Node>;
  public moved: NodeMap<boolean>;

  constructor() {
    this.added = new NodeMap<boolean>();
    this.removed = new NodeMap<boolean>();
    this.maybeMoved = new NodeMap<boolean>();
    this.oldPrevious = new NodeMap<Node>();
    this.moved = undefined;
  }
}
