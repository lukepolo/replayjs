import Summary from "../Summary";

export default interface Options {
  callback: (summaries: Summary[]) => any;
  rootNode?: Node;
  oldPreviousSibling?: boolean;
  observeOwnChanges?: boolean;
}
