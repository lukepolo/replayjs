// https://github.com/rafaelw/mutation-summary/blob/master/util/tree-mirror.ts
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

export default class TreeMirror {

  private idMap:NumberMap<Node>;

  constructor(public root:Node, public delegate?:any) {
    this.idMap = {};
  }

  initialize(rootId:number, children:NodeData[]) {
    this.idMap[rootId] = this.root;

    for (let i = 0; i < children.length; i++)
      this.deserializeNode(children[i], <Element>this.root);
  }

  applyChanged(removed:NodeData[],
               addedOrMoved:PositionData[],
               attributes:AttributeData[],
               text:TextData[]) {

    // NOTE: Applying the changes can result in an attempting to add a child
    // to a parent which is presently an ancestor of the parent. This can occur
    // based on random ordering of moves. The way we handle this is to first
    // remove all changed nodes from their parents, then apply.
    addedOrMoved.forEach((data:PositionData) => {
      let node = this.deserializeNode(data);
      let parent = this.deserializeNode(data.parentNode);
      let previous = this.deserializeNode(data.previousSibling);
      if (node.parentNode)
        node.parentNode.removeChild(node);
    });

    removed.forEach((data:NodeData) => {
      let node = this.deserializeNode(data);
      if (node.parentNode)
        node.parentNode.removeChild(node);
    });

    addedOrMoved.forEach((data:PositionData) => {
      let node = this.deserializeNode(data);
      let parent = this.deserializeNode(data.parentNode);
      let previous = this.deserializeNode(data.previousSibling);

      if(this.isDomObject(node)) {
        parent.insertBefore(node, previous ? previous.nextSibling : parent.firstChild);
      }
    });

    attributes.forEach((data:AttributeData) => {

      let node = <Element> this.deserializeNode(data);
      let type = node.type;

      if(this.isDomObject(node)) {
        Object.keys(data.attributes).forEach((attrName) => {
          let newVal = data.attributes[attrName];
          if (newVal === null) {
            node.removeAttribute(attrName);
          } else {
            if (!this.delegate ||
              !this.delegate.setAttribute ||
              !this.delegate.setAttribute(node, attrName, newVal)) {
              node.setAttribute(attrName, newVal);
            }
          }
        });

        switch(type) {
          case 'textarea' :
            node.value = data.attributes['value'];
            break;
          case 'radio' :
          case 'checkbox' :
            let checked = data.attributes['checked'];
            node.checked = checked === 'true';
            break;
          case 'select-one' : {
            node.selectedIndex = data.attributes['selected-option']
          }
        }
      }
    });

    text.forEach((data:TextData) => {
      let node = this.deserializeNode(data);
      node.textContent = data.textContent;
    });

    removed.forEach((node:NodeData) => {
      delete this.idMap[node.id];
    });
  }

  private deserializeNode(nodeData:NodeData, parent?:Element):Node {
    if (nodeData === null)
      return null;

    let node:Node = this.idMap[nodeData.id];
    if (node)
      return node;

    let doc = this.root.ownerDocument;
    if (doc === null)
      doc = <HTMLDocument>this.root;

    switch(nodeData.nodeType) {
      case Node.COMMENT_NODE:
        node = doc.createComment(nodeData.textContent);
        break;

      case Node.TEXT_NODE:
        node = doc.createTextNode(nodeData.textContent);
        break;

      case Node.DOCUMENT_TYPE_NODE:
        node = doc.implementation.createDocumentType(nodeData.name, nodeData.publicId, nodeData.systemId);
        break;

      case Node.ELEMENT_NODE:
        if (this.delegate && this.delegate.createElement)
          node = this.delegate.createElement(nodeData.tagName);
        if (!node)
          node = doc.createElement(nodeData.tagName);

        Object.keys(nodeData.attributes).forEach((name) => {
          if (!this.delegate ||
            !this.delegate.setAttribute ||
            !this.delegate.setAttribute(node, name, nodeData.attributes[name])) {
            (<Element>node).setAttribute(name, nodeData.attributes[name]);
          }
        });

        break;
    }

    if (!node) {
      throw "ouch";
    }

    this.idMap[nodeData.id] = node;

    if (parent) {
      // try {
        parent.appendChild(node);
      // } catch(error) {
      // }
    }

    if (nodeData.childNodes) {
      for (let i = 0; i < nodeData.childNodes.length; i++)
        this.deserializeNode(nodeData.childNodes[i], <Element>node);
    }

    return node;
  }

  isDomObject(obj) {
      return obj instanceof HTMLElement;
  }
}
