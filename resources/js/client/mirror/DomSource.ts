import LzString from "lz-string";
const MutationSummary = require("mutation-summary");

export default class DomSource {
  constructor(target, mirror, testingQueries) {
    var _this = this;
    // @ts-ignore
    this.target = target;
    // @ts-ignore
    this.mirror = mirror;
    // @ts-ignore
    this.nextId = 1;
    // @ts-ignore
    this.knownNodes = new MutationSummary.NodeMap();

    // @ts-ignore
    var rootId = this.serializeNode(target).id;
    var children = [];
    for (var child = target.firstChild; child; child = child.nextSibling) {
      // @ts-ignore
      var node = this.serializeNode(child, true);
      if (node !== null) {
        children.push(node);
      }
    }

    // @ts-ignore
    this.mirror.initialize(rootId, children);

    var queries = [{ all: true }];

    if (testingQueries) queries = queries.concat(testingQueries);

    // @ts-ignore
    this.mutationSummary = new MutationSummary({
      rootNode: target,
      callback: function(summaries) {
        // @ts-ignore
        _this.applyChanged(summaries);
      },
      queries: queries,
    });
  }

  disconnect = function() {
    if (this.mutationSummary) {
      this.mutationSummary.disconnect();
      this.mutationSummary = undefined;
    }
  };

  rememberNode = function(node) {
    var id = this.nextId++;
    this.knownNodes.set(node, id);
    return id;
  };

  forgetNode = function(node) {
    this.knownNodes.delete(node);
  };

  serializeNode = function(node, recursive) {
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
        // @ts-ignore
        data.name = docType.name;
        // @ts-ignore
        data.publicId = docType.publicId;
        // @ts-ignore
        data.systemId = docType.systemId;
        break;

      case Node.COMMENT_NODE:
        return null;
      case Node.TEXT_NODE:
        // @ts-ignore
        data.textContent = node.textContent;
        break;

      case Node.ELEMENT_NODE:
        var elm = node;
        // @ts-ignore
        data.tagName = elm.tagName;
        // @ts-ignore
        data.attributes = {};

        for (var i = 0; i < elm.attributes.length; i++) {
          var attr = elm.attributes[i];
          // @ts-ignore
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
          // @ts-ignore
          data.childNodes = [];

          for (var child = elm.firstChild; child; child = child.nextSibling) {
            var node = this.serializeNode(child, true);
            if (node !== null) {
              // @ts-ignore
              data.childNodes.push(node);
            }
          }
        }
        break;
    }

    return this.compressNode(data);
  };

  compressAttribute = function(attribute) {
    return LzString.compressToUTF16(attribute);
  };

  compressNode = function(node) {
    if (node.textContent || node.attributes) {
      node.compressed = 1;
    }

    if (node.textContent) {
      node.textContent = LzString.compressToUTF16(node.textContent);
    }

    if (node.attributes) {
      Object.keys(node.attributes).forEach((attributeName) => {
        node.attributes[attributeName] = LzString.compressToUTF16(
          node.attributes[attributeName],
        );
      });
    }

    return node;
  };

  serializeAddedAndMoved = function(added, reparented, reordered) {
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

  serializeAttributeChanges = function(attributeChanged) {
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
          record.attributes[attrName] = _this.compressAttribute(
            element.getAttribute(attrName),
          );
        }
      });
    });

    return map.keys().map(function(node) {
      return map.get(node);
    });
  };

  applyChanged = function(summaries) {
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
}
