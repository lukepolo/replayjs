import Query from "./Query";
import Summary from "../Summary";

export default interface Options {
  callback: (summaries: Summary[]) => any;
  queries: Query[];
  rootNode?: Node;
  oldPreviousSibling?: boolean;
  observeOwnChanges?: boolean;
}
