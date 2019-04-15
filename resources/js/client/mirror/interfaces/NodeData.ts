export enum NodeDataTypes {
  id = "i",
  nodeType = "nt",
  name = "n",
  publicId = "pi",
  systemId = "si",
  textContent = "tc",
  tagName = "tn",
  attributes = "a",
  childNodes = "cn",
  compressed = "c",
  parentNode = "parentNode",
  previousSibling = "previousSibling",
}

export default interface NodeData {
  i: number;
  nt?: number;
  n?: string;
  pi?: string;
  si?: string;
  tc?: string;
  tn?: string;
  a?: object;
  cn?: NodeData[];
  c?: boolean;
}
