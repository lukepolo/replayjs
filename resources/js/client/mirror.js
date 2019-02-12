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
        parent.insertBefore(
          node,
          previous ? previous.nextSibling : parent.firstChild,
        );
      }
    });

    attributes.forEach(function(data) {
      var node = _this.deserializeNode(data);

      if (node) {
        Object.keys(data.attributes).forEach(function(attrName) {
          var newVal = data.attributes[attrName];
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

        switch (node.type) {
          case "textarea":
            node.value = data.attributes["value"];
            break;
          case "radio":
          case "checkbox":
            let checked = data.attributes["checked"];
            node.checked = checked === "true";
            break;
          case "select-one": {
            node.selectedIndex = data.attributes["selected-option"];
          }
        }
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

  TreeMirror.prototype.deserializeNode = function(nodeData, parent) {
    var _this = this;
    if (nodeData === null) return null;

    var node = this.idMap[nodeData.id];
    if (node) return node;

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
        if (this.delegate && this.delegate.createElement)
          node = this.delegate.createElement(nodeData.tagName);
        if (!node) node = doc.createElement(nodeData.tagName);

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
            // Debug here if needed
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
