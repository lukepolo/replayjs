export enum NodeDataTypes {
  id = "id",
  nodeType = "nodeType",
  name = "name",
  publicId = "publicId",
  systemId = "systemId",
  textContent = "textContent",
  tagName = "tagName",
  attributes = "attributes",
  childNodes = "childNodes",
  compressed = "compressed",
  parentNode = "parentNode",
  previousSibling = "previousSibling",
}

export default interface NodeData {
  id: number;
  nodeType?: number;
  name?: string;
  publicId?: string;
  systemId?: string;
  textContent?: string;
  tagName?: string;
  attributes?: object;
  childNodes?: NodeData[];
  compressed?: boolean;
}
