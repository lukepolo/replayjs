let TreeMirror = (function() {
  function TreeMirror(root, delegate) {
    this.root = root;
    this.delegate = delegate;
    this.idMap = {};
  }
  TreeMirror.prototype.initialize = function(rootId, children) {
    this.idMap[rootId] = this.root;

    for (let i = 0; i < children.length; i++)
      this.deserializeNode(children[i], this.root);
  };

  TreeMirror.prototype.applyChanged = function(
    removed,
    addedOrMoved,
    attributes,
    text,
  ) {
    let _this = this;
    // NOTE: Applying the changes can result in an attempting to add a child
    // to a parent which is presently an ancestor of the parent. This can occur
    // based on random ordering of moves. The way we handle this is to first
    // remove all changed nodes from their parents, then apply.
    addedOrMoved.forEach(function(data) {
      let node = _this.deserializeNode(data);
      let parent = _this.deserializeNode(data.parentNode);
      let previous = _this.deserializeNode(data.previousSibling);

      if (
        node.contains(parent) === false &&
        node instanceof HTMLElement === true &&
        parent instanceof HTMLElement === true &&
        node.parentNode
      ) {
        node.parentNode.removeChild(node);
      }
    });

    removed.forEach(function(data) {
      let node = _this.deserializeNode(data);
      if (node.parentNode) node.parentNode.removeChild(node);
    });

    addedOrMoved.forEach(function(data) {
      let node = _this.deserializeNode(data);
      let parent = _this.deserializeNode(data.parentNode);
      let previous = _this.deserializeNode(data.previousSibling);

      try {
        // The node might be a document element which has a parent reference
        // to the last node in the idMap. In this case we will see the error
        // above (see NOTE)
        if (
          !node.contains(parent) &&
          node instanceof HTMLElement === true &&
          // 21.3.2017: In some cases the idMap reports that the parent of the element is for example
          // html comment. In this case we obviously don't want to apply the move so we check
          // here that it is
          parent instanceof HTMLElement === true
        ) {
          parent.insertBefore(
            node,
            previous ? previous.nextSibling : parent.firstChild,
          );
        }
        // 21.3.2017: Handle <html> elements as special case in case we the tree is trying
        // to remove it, we add back to root
        else if (
          node instanceof HTMLElement &&
          node.nodeName === "HTML" &&
          _this.root instanceof HTMLDocument &&
          _this.root.contains(node) === false
        ) {
          _this.root.appendChild(node);
        }
      } catch (e) {
        // In some cases it seems that MutationSummary determines the parent
        // of a node incorrectly. Example: <meta> element has parent #document
        // and previousSibling is <html>. When this occurs we receive an error
        // that says 'Only one element is allowed on #document'
        // We probably want to append the node to the sibling
        if (
          parent instanceof HTMLDocument &&
          previous instanceof HTMLElement &&
          parent.contains(previous)
        ) {
          if (previous.firstChild)
            previous.insertBefore(node, previous.firstChild);
          else previous.appendChild(node);
        }

        // Might still fail but we should call applyChanged inside try...catch
        // anyway
        if (_this.debug) {
          console.log(e);
        }
      }
    });

    attributes.forEach(function(data) {
      let node = _this.deserializeNode(data);
      Object.keys(data.attributes).forEach(function(attrName) {
        let newVal = data.attributes[attrName];
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
    });

    text.forEach(function(data) {
      let node = _this.deserializeNode(data);
      node.textContent = data.textContent;
    });

    removed.forEach(function(node) {
      delete _this.idMap[node.id];
    });
  };

  TreeMirror.prototype.deserializeNode = function(nodeData, parent) {
    let _this = this;
    if (nodeData === null) return null;

    let node = this.idMap[nodeData.id];
    if (node) return node;

    let doc = this.root.ownerDocument;
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

    if (!node) throw "ouch";

    this.idMap[nodeData.id] = node;

    if (parent) parent.appendChild(node);

    if (nodeData.childNodes) {
      for (let i = 0; i < nodeData.childNodes.length; i++)
        this.deserializeNode(nodeData.childNodes[i], node);
    }

    return node;
  };
  return TreeMirror;
})();

export { TreeMirror };
