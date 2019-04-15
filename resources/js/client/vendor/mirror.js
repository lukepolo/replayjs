import LzString from 'lz-string';
import { TreeMirrorClient } from "./tree-mirror";

var TreeMirror = (function() {
  function TreeMirror(root, delegate) {
    this.root = root;
    this.delegate = delegate;
    this.idMap = {};
  }

  TreeMirror.prototype.initialize = function(rootId, children) {
    this.idMap[rootId] = this.root;

    for (var i = 0; i < children.length; i++)
      this.deserializeNode(children[i], this.root);
  };

  TreeMirror.prototype.applyChanged = function(
    removed,
    addedOrMoved,
    attributes,
    text,
  ) {
    var _this = this;
    // NOTE: Applying the changes can result in an attempting to add a child
    // to a parent which is presently an ancestor of the parent. This can occur
    // based on random ordering of moves. The way we handle this is to first
    // remove all changed nodes from their parents, then apply.
    addedOrMoved.forEach(function(data) {
      var node = _this.deserializeNode(data);

      if (node) {
        if (node.parentNode) node.parentNode.removeChild(node);
      }
    });

    removed.forEach(function(data) {
      var node = _this.deserializeNode(data);
      if (node) {
        if (node.parentNode) node.parentNode.removeChild(node);
      }
    });

    addedOrMoved.forEach(function(data) {
      var node = _this.deserializeNode(data);

      if (node) {
        var parent = _this.deserializeNode(data.parentNode);
        var previous = _this.deserializeNode(data.previousSibling);

        try {
          parent.insertBefore(
            node,
            previous ? previous.nextSibling : parent.firstChild,
          );
        } catch (e) {
          // NODE IS GONE
        }
      }
    });

    attributes.forEach(function(data) {
      var node = _this.deserializeNode(data);

      if (node) {
        Object.keys(data.attributes).forEach(function(attrName) {
          var newVal = _this.decompressAttribute(data.attributes[attrName]);
          if (newVal === null) {
            node.removeAttribute(attrName);
          } else {
            try {
              if (
                !_this.delegate ||
                !_this.delegate.setAttribute ||
                !_this.delegate.setAttribute(node, attrName, newVal)
              ) {
                node.setAttribute(attrName, newVal);
              }
            } catch (e) {
              // Debug node.setAttribute here
            }
          }
        });
      }
    });

    text.forEach(function(data) {
      var node = _this.deserializeNode(data);

      if (node) {
        node.textContent = data.textContent;
      }
    });

    removed.forEach(function(node) {
      delete _this.idMap[node.id];
    });
  };

  TreeMirror.prototype.decompressAttribute = function(attribute) {
    return LzString.decompressFromUTF16(attribute);
  };

  TreeMirror.prototype.decompressNode = function(node) {
    if (!node.compressed) {
      return node;
    }

    if (node.textContent) {
      node.textContent = LzString.decompressFromUTF16(node.textContent);
    }

    if (node.attributes) {
      Object.keys(node.attributes).forEach((attributeName) => {
        node.attributes[attributeName] = LzString.decompressFromUTF16(node.attributes[attributeName]);
      });
    }

    return node;
  };

  TreeMirror.prototype.deserializeNode = function(nodeData, parent) {
    var _this = this;
    if (nodeData === null) {
      return null
    }

    nodeData = this.decompressNode(nodeData)

    var node = this.idMap[nodeData.id];
    if (node) {
      return node
    }

    var doc = this.root.ownerDocument;
    if (doc === null) doc = this.root;

    switch (nodeData.nodeType) {
      case Node.COMMENT_NODE:
        node = doc.createComment(nodeData.textContent);
        break;

      case Node.TEXT_NODE:
        node = doc.createTextNode(nodeData.textContent);
        break;

      case Node.DOCUMENT_TYPE_NODE:
        node = doc.implementation.createDocumentType(
          nodeData.name,
          nodeData.publicId,
          nodeData.systemId,
        );
        break;

      case Node.ELEMENT_NODE:
        if (this.delegate && this.delegate.createElement) {
          node = this.delegate.createElement(nodeData.tagName);
        }
        if (!node) {
          node = doc.createElement(nodeData.tagName);
        }
        Object.keys(nodeData.attributes).forEach(function(name) {
          try {
            if (
              !_this.delegate ||
              !_this.delegate.setAttribute ||
              !_this.delegate.setAttribute(
                node,
                name,
                nodeData.attributes[name],
              )
            ) {
              node.setAttribute(name, nodeData.attributes[name]);
            }
          } catch (e) {
            console.warn(`Cannot set attribute`, e);
          }
        });

        break;
    }

    if (!node) return null;

    this.idMap[nodeData.id] = node;

    if (parent) parent.appendChild(node);

    if (nodeData.childNodes) {
      for (var i = 0; i < nodeData.childNodes.length; i++)
        this.deserializeNode(nodeData.childNodes[i], node);
    }

    return node;
  };
  return TreeMirror;
})();

export { TreeMirror };
