import NodeData from "./NodeData";

export default interface PositionData extends NodeData {
  pn: NodeData;
  ps: NodeData;
}
