export enum NodeDataTypes {
  id = "i",
  nodeType = "nodeType",
  name = "n",
  publicId = "pi",
  systemId = "si",
  textContent = "tc",
  tagName = "tn",
  attributes = "a",
  childNodes = "cn",
  compressed = "c",
  parentNode = "pn",
  previousSibling = "ps",
}

export default interface NodeData {
  i: number;
  nodeType?: number;
  n?: string;
  pi?: string;
  si?: string;
  tc?: string;
  tn?: string;
  a?: object;
  cn?: NodeData[];
  c?: boolean;
}
