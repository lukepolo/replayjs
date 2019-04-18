export default interface Options {
  callback: (summaries: Summary[]) => any;
  queries: Query[];
  rootNode?: Node;
  oldPreviousSibling?: boolean;
  observeOwnChanges?: boolean;
}
