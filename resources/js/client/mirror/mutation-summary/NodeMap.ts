export default class NodeMap<T> {
  protected static ID_PROP = "__mutation_summary_node_map_id__";
  protected static nextId_: number = 1;

  protected values: T[];
  protected nodes: Node[];

  constructor() {
    this.nodes = [];
    this.values = [];
  }

  protected isIndex(s: string): boolean {
    return +s === (<any>s) >>> 0;
  }

  protected nodeId(node: Node) {
    let id = node[NodeMap.ID_PROP];
    if (!id) {
      id = node[NodeMap.ID_PROP] = NodeMap.nextId_++;
    }
    return id;
  }

  public set(node: Node, value: T) {
    let id = this.nodeId(node);
    this.nodes[id] = node;
    this.values[id] = value;
    return value;
  }

  public get(node: Node): T {
    let id = this.nodeId(node);
    return this.values[id];
  }

  public has(node: Node): boolean {
    return this.nodeId(node) in this.nodes;
  }

  public delete(node: Node) {
    let id = this.nodeId(node);
    delete this.nodes[id];
    this.values[id] = undefined;
  }

  // TODO - i dont think this is needed
  // we should just loop through it like normal
  public keys(): Node[] {
    let nodes: Node[] = [];
    for (let id in this.nodes) {
      // when would this happen?
      if (!this.isIndex(id)) continue;
      nodes.push(this.nodes[id]);
    }

    return nodes;
  }
}
