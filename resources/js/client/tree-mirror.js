import { MutationSummary } from "./mutation-summary";

let TreeMirrorClient = (function() {
  function TreeMirrorClient(target, mirror, testingQueries) {
    let _this = this;
    this.target = target;
    this.mirror = mirror;
    this.nextId = 1;
    this.knownNodes = new MutationSummary.NodeMap();

    if (typeof this.mirror == "undefined") {
      this.mirror = _this.getDefaultMirror();
    }

    let rootId = this.serializeNode(target).id;
    let children = [];
    for (let child = target.firstChild; child; child = child.nextSibling)
      children.push(this.serializeNode(child, true));

    this.mirror.initialize(rootId, children);

    let self = this;

    let queries = [{ all: true }];

    if (testingQueries) queries = queries.concat(testingQueries);

    let MutationObserverCtor;

    try {
      if (typeof WebKitMutationObserver !== "undefined")
        MutationObserverCtor = WebKitMutationObserver;
      else MutationObserverCtor = MutationObserver;
    } catch (e) {
      MutationObserverCtor = undefined;
    }

    if (MutationObserverCtor !== undefined) {
      this.mutationSummary = new MutationSummary({
        rootNode: target,
        callback: function(summaries) {
          _this.applyChanged(summaries);
        },
        queries: queries,
      });
    }
  }

  TreeMirrorClient.prototype.getDefaultMirror = function() {
    return {
      initialize: function(rootId, children) {
        return;
      },
      applyChanged: function(removed, addedOrMoved, attributes, text) {
        return;
      },
    };
  };

  TreeMirrorClient.prototype.disconnect = function() {
    if (this.mutationSummary) {
      this.mutationSummary.disconnect();
      this.mutationSummary = undefined;
    }
  };

  TreeMirrorClient.prototype.rememberNode = function(node) {
    let id = this.nextId++;
    this.knownNodes.set(node, id);
    return id;
  };

  TreeMirrorClient.prototype.forgetNode = function(node) {
    this.knownNodes.delete(node);
  };

  TreeMirrorClient.prototype.serializeNode = function(node, recursive) {
    if (node === null) return null;

    let id = this.knownNodes.get(node);
    if (id !== undefined) {
      return { id: id };
    }

    let data = {
      nodeType: node.nodeType,
      id: this.rememberNode(node),
    };

    switch (data.nodeType) {
      case Node.DOCUMENT_TYPE_NODE:
        let docType = node;
        data.name = docType.name;
        data.publicId = docType.publicId;
        data.systemId = docType.systemId;
        break;

      case Node.COMMENT_NODE:
      case Node.TEXT_NODE:
        data.textContent = node.textContent;
        break;

      case Node.ELEMENT_NODE:
        let elm = node;
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
  };

  TreeMirrorClient.prototype.serializeAddedAndMoved = function(
    added,
    reparented,
    reordered,
  ) {
    let _this = this;
    let all = added.concat(reparented).concat(reordered);

    let parentMap = new MutationSummary.NodeMap();

    all.forEach(function(node) {
      let parent = node.parentNode;
      let children = parentMap.get(parent);
      if (!children) {
        children = new MutationSummary.NodeMap();
        parentMap.set(parent, children);
      }

      children.set(node, true);
    });

    let moved = [];

    parentMap.keys().forEach(function(parent) {
      let children = parentMap.get(parent);

      let keys = children.keys();
      while (keys.length) {
        let node = keys[0];
        while (node.previousSibling && children.has(node.previousSibling))
          node = node.previousSibling;

        while (node && children.has(node)) {
          let data = _this.serializeNode(node);
          data.previousSibling = _this.serializeNode(node.previousSibling);
          data.parentNode = _this.serializeNode(node.parentNode);
          moved.push(data);
          children.delete(node);
          node = node.nextSibling;
        }

        let keys = children.keys();
      }
    });

    return moved;
  };

  TreeMirrorClient.prototype.serializeAttributeChanges = function(
    attributeChanged,
  ) {
    let _this = this;
    let map = new MutationSummary.NodeMap();

    Object.keys(attributeChanged).forEach(function(attrName) {
      attributeChanged[attrName].forEach(function(element) {
        let record = map.get(element);
        if (!record) {
          record = _this.serializeNode(element);
          record.attributes = {};
          map.set(element, record);
        }

        record.attributes[attrName] = element.getAttribute(attrName);
      });
    });

    return map.keys().map(function(node) {
      return map.get(node);
    });
  };

  TreeMirrorClient.prototype.applyChanged = function(summaries) {
    let _this = this;
    let summary = summaries[0];

    let removed = summary.removed.map(function(node) {
      return _this.serializeNode(node);
    });

    let moved = this.serializeAddedAndMoved(
      summary.added,
      summary.reparented,
      summary.reordered,
    );

    let attributes = this.serializeAttributeChanges(summary.attributeChanged);

    let text = summary.characterDataChanged.map(function(node) {
      let data = _this.serializeNode(node);
      data.textContent = node.textContent;
      return data;
    });

    this.mirror.applyChanged(removed, moved, attributes, text);

    summary.removed.forEach(function(node) {
      _this.forgetNode(node);
    });
  };
  return TreeMirrorClient;
})();

export { TreeMirrorClient };
