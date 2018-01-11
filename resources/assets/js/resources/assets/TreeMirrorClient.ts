// https://github.com/rafaelw/mutation-summary/blob/master/util/tree-mirror.ts

import MutationSummary from 'mutation-summary';

interface NodeData {
  id:number;
  nodeType?:number;
  name?:string;
  publicId?:string;
  systemId?:string;
  textContent?:string;
  tagName?:string;
  attributes?:StringMap<string>;
  childNodes?:NodeData[];
}

interface PositionData extends NodeData {
  previousSibling:NodeData;
  parentNode:NodeData;
}

interface AttributeData extends NodeData {
  attributes:StringMap<string>;
}

interface TextData extends NodeData{
  textContent:string;
}

export default  class TreeMirrorClient {
  private nextId:number;

  private mutationSummary:MutationSummary;
  private knownNodes:NodeMap<number>;

  constructor(public target:Node, public mirror:any) {
    this.nextId = 1;
    this.knownNodes = new MutationSummary.NodeMap<number>();

    let rootId = this.serializeNode(target).id;
    let children:NodeData[] = [];
    for (let child = target.firstChild; child; child = child.nextSibling)
      children.push(this.serializeNode(child, true));

    this.mirror.initialize(rootId, children);

    let queries = [{ all: true }];

    this.mutationSummary = new MutationSummary({
      rootNode: target,
      callback: (summaries:Summary[]) => {
        this.applyChanged(summaries);
      },
      queries: queries
    });
  }


  disconnect() {
    if (this.mutationSummary) {
      this.mutationSummary.disconnect();
      this.mutationSummary = undefined;
    }
  }

  private rememberNode(node:Node):number {
    let id = this.nextId++;
    this.knownNodes.set(node, id);
    return id;
  }

  private forgetNode(node:Node) {
    this.knownNodes.delete(node);
  }

  private serializeNode(node:Node, recursive?:boolean):NodeData {
    if (node === null)
      return null;

    let id = this.knownNodes.get(node);
    if (id !== undefined) {
      return { id: id };
    }

    let data:NodeData = {
      nodeType: node.nodeType,
      id: this.rememberNode(node)
    };

    switch(data.nodeType) {
      case Node.DOCUMENT_TYPE_NODE:
        let docType = <DocumentType>node;
        data.name = docType.name;
        data.publicId = docType.publicId;
        data.systemId = docType.systemId;
        break;

      case Node.COMMENT_NODE:
      case Node.TEXT_NODE:
        data.textContent = node.textContent;
        break;

      case Node.ELEMENT_NODE:
        let elm = <Element>node;
        data.tagName = elm.tagName;
        data.attributes = {};
        for (let i = 0; i < elm.attributes.length; i++) {
          let attr = elm.attributes[i];
          data.attributes[attr.name] = attr.value;
        }

        if (recursive && elm.childNodes.length) {
          data.childNodes = [];

          for (let child = elm.firstChild; child; child = child.nextSibling)
            data.childNodes.push(this.serializeNode(child, true));
        }
        break;
    }

    return data;
  }

  private serializeAddedAndMoved(added:Node[],
                                 reparented:Node[],
                                 reordered:Node[]):PositionData[] {
    let all = added.concat(reparented).concat(reordered);

    let parentMap = new MutationSummary.NodeMap<NodeMap<boolean>>();

    all.forEach((node) => {
      let parent = node.parentNode;
      let children = parentMap.get(parent)
      if (!children) {
        children = new MutationSummary.NodeMap<boolean>();
        parentMap.set(parent, children);
      }

      children.set(node, true);
    });

    let moved:PositionData[] = [];

    parentMap.keys().forEach((parent) => {
      let children = parentMap.get(parent);

      let keys = children.keys();

      while (keys.length) {
        let node = keys[0];
        while (node.previousSibling && children.has(node.previousSibling))
          node = node.previousSibling;

        while (node && children.has(node)) {
          let data = <PositionData>this.serializeNode(node);
          data.previousSibling = this.serializeNode(node.previousSibling);
          data.parentNode = this.serializeNode(node.parentNode);
          moved.push(<PositionData>data);
          children.delete(node);
          node = node.nextSibling;
        }

        keys = children.keys();
      }
    });

    return moved;
  }

  private serializeAttributeChanges(attributeChanged:StringMap<Element[]>):AttributeData[] {
    let map = new MutationSummary.NodeMap<AttributeData>();

    Object.keys(attributeChanged).forEach((attrName) => {
      attributeChanged[attrName].forEach((element) => {
        let record = map.get(element);
        if (!record) {
          record = <AttributeData>this.serializeNode(element);
          record.attributes = {};
          map.set(element, record);
        }

        record.attributes[attrName] = element.getAttribute(attrName);
      });
    });

    return map.keys().map((node:Node) => {
      return map.get(node);
    });
  }

  applyChanged(summaries:Summary[]) {
    let summary:Summary = summaries[0]

    let removed:NodeData[] = summary.removed.map((node:Node) => {
      return this.serializeNode(node);
    });

    let moved:PositionData[] =
      this.serializeAddedAndMoved(summary.added,
        summary.reparented,
        summary.reordered);

    let attributes:AttributeData[] =
      this.serializeAttributeChanges(summary.attributeChanged);

    let text:TextData[] = summary.characterDataChanged.map((node:Node) => {
      let data = this.serializeNode(node);
      data.textContent = node.textContent;
      return <TextData>data;
    });

    this.mirror.applyChanged(removed, moved, attributes, text);

    summary.removed.forEach((node:Node) => {
      this.forgetNode(node);
    });
  }
}
