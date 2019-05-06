import Summary from "../Summary";

export default interface Options {
  rootNode: Node;
  callback: (summaries: Summary) => any;
}
