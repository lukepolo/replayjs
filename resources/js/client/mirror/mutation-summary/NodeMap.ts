export default class NodeMap<T> {
  private static ID_PROP = "__mutation_summary_node_map_id__";
  private static nextId_: number = 1;

  private values: T[];
  private nodes: Node[];

  constructor() {
    this.nodes = [];
    this.values = [];
  }

  private isIndex(s: string): boolean {
    return +s === (<any>s) >>> 0;
  }

  private nodeId(node: Node) {
    let id = node[NodeMap.ID_PROP];
    if (!id) id = node[NodeMap.ID_PROP] = NodeMap.nextId_++;
    return id;
  }

  public set(node: Node, value: T) {
    let id = this.nodeId(node);
    this.nodes[id] = node;
    this.values[id] = value;
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

  public keys(): Node[] {
    let nodes: Node[] = [];
    for (let id in this.nodes) {
      if (!this.isIndex(id)) continue;
      nodes.push(this.nodes[id]);
    }

    return nodes;
  }
}
