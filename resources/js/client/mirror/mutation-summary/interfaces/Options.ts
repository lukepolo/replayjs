import Summary from "../Summary";

export default interface Options {
  rootNode: Node;
  observeOwnChanges?: boolean;
  oldPreviousSibling?: boolean;
  callback: (summaries: Summary[]) => any;
}
