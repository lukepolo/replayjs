import NodeData from "./NodeData";

export default interface PositionData extends NodeData {
  parentNode: NodeData;
  previousSibling: NodeData;
}
