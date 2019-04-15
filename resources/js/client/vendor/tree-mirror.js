import LzString from 'lz-string';
import MutationSummary from "mutation-summary";

var TreeMirrorClient = (function() {
  function TreeMirrorClient(target, mirror, testingQueries) {
    var _this = this;
    this.target = target;
    this.mirror = mirror;
    this.nextId = 1;
    this.knownNodes = new MutationSummary.NodeMap();

    var rootId = this.serializeNode(target).id;
    var children = [];
    for (var child = target.firstChild; child; child = child.nextSibling) {
      var node = this.serializeNode(child, true);
      if (node !== null) {
        children.push(node);
      }
    }

    this.mirror.initialize(rootId, children);

    var queries = [{ all: true }];

    if (testingQueries) queries = queries.concat(testingQueries);

    this.mutationSummary = new MutationSummary({
      rootNode: target,
      callback: function(summaries) {
        _this.applyChanged(summaries);
      },
      queries: queries,
    });
  }

  TreeMirrorClient.prototype.disconnect = function() {
    if (this.mutationSummary) {
      this.mutationSummary.disconnect();
      this.mutationSummary = undefined;
    }
  };

  TreeMirrorClient.prototype.rememberNode = function(node) {
    var id = this.nextId++;
    this.knownNodes.set(node, id);
    return id;
  };

  TreeMirrorClient.prototype.forgetNode = function(node) {
    this.knownNodes.delete(node);
  };

  TreeMirrorClient.prototype.serializeNode = function(node, recursive) {
    if (node === null) return null;

    var id = this.knownNodes.get(node);
    if (id !== undefined) {
      return { id: id };
    }

    var data = {
      nodeType: node.nodeType,
      id: this.rememberNode(node),
    };

    switch (data.nodeType) {
      case Node.DOCUMENT_TYPE_NODE:
        var docType = node;
        data.name = docType.name;
        data.publicId = docType.publicId;
        data.systemId = docType.systemId;
        break;

      case Node.COMMENT_NODE:
        return null;
      case Node.TEXT_NODE:
        data.textContent = node.textContent;
        break;

      case Node.ELEMENT_NODE:
        var elm = node;
        data.tagName = elm.tagName;
        data.attributes = {};

        for (var i = 0; i < elm.attributes.length; i++) {
          var attr = elm.attributes[i];
          data.attributes[attr.name] = attr.value;
        }

        if (
          elm.tagName == "SCRIPT" ||
          elm.tagName == "NOSCRIPT" ||
          elm.tagName == "CANVAS"
        ) {
          return null;
        }

        if (recursive && elm.childNodes.length) {
          data.childNodes = [];

          for (var child = elm.firstChild; child; child = child.nextSibling) {
            var node = this.serializeNode(child, true);
            if (node !== null) {
              data.childNodes.push(node);
            }
          }
        }
        break;
    }

    return this.compressNode(data);
  };

  TreeMirrorClient.prototype.compressAttribute = function(attribute) {
    return LzString.compressToUTF16(attribute);
  };

  TreeMirrorClient.prototype.compressNode = function(node) {
    if (node.textContent || node.attributes) {
      node.compressed = 1;
    }

    if (node.textContent) {
      node.textContent = LzString.compressToUTF16(node.textContent);
    }

    if (node.attributes) {
      Object.keys(node.attributes).forEach((attributeName) => {
        node.attributes[attributeName] = LzString.compressToUTF16(node.attributes[attributeName]);
      });
    }

    return node;
  };

  TreeMirrorClient.prototype.serializeAddedAndMoved = function(
    added,
    reparented,
    reordered,
  ) {
    var _this = this;
    var all = added.concat(reparented).concat(reordered);

    var parentMap = new MutationSummary.NodeMap();

    all.forEach(function(node) {
      var parent = node.parentNode;
      var children = parentMap.get(parent);
      if (!children) {
        children = new MutationSummary.NodeMap();
        parentMap.set(parent, children);
      }

      children.set(node, true);
    });

    var moved = [];

    parentMap.keys().forEach(function(parent) {
      var children = parentMap.get(parent);

      var keys = children.keys();
      while (keys.length) {
        var node = keys.shift();
        while (node.previousSibling && children.has(node.previousSibling))
          node = node.previousSibling;

        while (node && children.has(node)) {
          var data = _this.serializeNode(node);
          if (data !== null) {
            data.previousSibling = _this.serializeNode(node.previousSibling);
            data.parentNode = _this.serializeNode(node.parentNode);
            moved.push(data);
            children.delete(node);
          }
          node = node.nextSibling;
        }
        keys = children.keys();
      }
    });

    return moved;
  };

  TreeMirrorClient.prototype.serializeAttributeChanges = function(
    attributeChanged,
  ) {
    var _this = this;
    var map = new MutationSummary.NodeMap();

    Object.keys(attributeChanged).forEach(function(attrName) {
      attributeChanged[attrName].forEach(function(element) {
        var record = map.get(element);
        if (!record) {
          record = _this.serializeNode(element);

          if (record !== null) {
            record.attributes = {};
            map.set(element, record);
          }
        }

        if (record !== null) {
          record.attributes[attrName] = _this.compressAttribute(element.getAttribute(attrName));
        }
      });
    });

    return map.keys().map(function(node) {
      return map.get(node);
    });
  };

  TreeMirrorClient.prototype.applyChanged = function(summaries) {
    var _this = this;
    var summary = summaries[0];

    var removed = summary.removed.map(function(node) {
      return _this.serializeNode(node);
    });

    var moved = this.serializeAddedAndMoved(
      summary.added,
      summary.reparented,
      summary.reordered,
    );

    var attributes = this.serializeAttributeChanges(summary.attributeChanged);

    var text = summary.characterDataChanged.map(function(node) {
      var data = _this.serializeNode(node);
      if (data !== null) {
        data.textContent = node.textContent;
      }
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
