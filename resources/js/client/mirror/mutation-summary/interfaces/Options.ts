import Summary from "../Summary";

export default interface Options {
  rootNode: Node;
  oldPreviousSibling?: boolean;
  callback: (summaries: Summary) => any;
}
