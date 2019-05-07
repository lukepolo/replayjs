import StringMap from "./StringMap";

export default interface Summary {
  addedNodes: Node[];
  textChanges: Node[];
  removedNodes: Node[];
  attributeChanges: StringMap<Element[]>;
}
