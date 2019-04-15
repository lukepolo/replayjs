export default interface NodeData {
  id: number;
  nodeType?: number;
  name?: string;
  publicId?: string;
  systemId?: string;
  textContent?: string;
  tagName?: string;
  attributes?: Array<Element>;
  childNodes?: NodeData[];
  compressed?: boolean;
}
