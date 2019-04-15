import LzString from "lz-string";
import DomCompressor from "./DomCompressor";
const MutationSummary = require("mutation-summary");

export default class DomSource {
  private nextId;
  private mirror;
  private target;
  private knownNodes;
  private domCompressor: DomCompressor;
  private mutationSummary;

  constructor(target, mirror, testingQueries) {
    this.target = target;
    this.mirror = mirror;
    this.nextId = 1;
    this.knownNodes = new MutationSummary.NodeMap();
    this.domCompressor = new DomCompressor();

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
      callback: (summaries) => {
        // @ts-ignore
        this.applyChanged(summaries);
      },
      queries: queries,
    });
  }

  public disconnect() {
    if (this.mutationSummary) {
      this.mutationSummary.disconnect();
      this.mutationSummary = undefined;
    }
  }

  public rememberNode(node) {
    var id = this.nextId++;
    this.knownNodes.set(node, id);
    return id;
  }

  public forgetNode(node) {
    this.knownNodes.delete(node);
  }

  public serializeNode(node, recursive?) {
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

    return this.domCompressor.compressNode(data);
  }

  public serializeAddedAndMoved(added, reparented, reordered) {
    var all = added.concat(reparented).concat(reordered);

    var parentMap = new MutationSummary.NodeMap();

    all.forEach((node) => {
      var parent = node.parentNode;
      var children = parentMap.get(parent);
      if (!children) {
        children = new MutationSummary.NodeMap();
        parentMap.set(parent, children);
      }

      children.set(node, true);
    });

    var moved = [];

    parentMap.keys().forEach((parent) => {
      var children = parentMap.get(parent);

      var keys = children.keys();
      while (keys.length) {
        var node = keys.shift();
        while (node.previousSibling && children.has(node.previousSibling))
          node = node.previousSibling;

        while (node && children.has(node)) {
          var data = this.serializeNode(node);
          if (data !== null) {
            data.previousSibling = this.serializeNode(node.previousSibling);
            data.parentNode = this.serializeNode(node.parentNode);
            moved.push(data);
            children.delete(node);
          }
          node = node.nextSibling;
        }
        keys = children.keys();
      }
    });

    return moved;
  }

  public serializeAttributeChanges(attributeChanged) {
    var map = new MutationSummary.NodeMap();

    Object.keys(attributeChanged).forEach((attrName) => {
      attributeChanged[attrName].forEach((element) => {
        var record = map.get(element);
        if (!record) {
          record = this.serializeNode(element);

          if (record !== null) {
            record.attributes = {};
            map.set(element, record);
          }
        }

        if (record !== null) {
          record.attributes[attrName] = this.domCompressor.compressAttribute(
            element.getAttribute(attrName),
          );
        }
      });
    });

    return map.keys().map((node) => {
      return map.get(node);
    });
  }

  public applyChanged(summaries) {
    var summary = summaries[0];

    var removed = summary.removed.map((node) => {
      return this.serializeNode(node);
    });

    var moved = this.serializeAddedAndMoved(
      summary.added,
      summary.reparented,
      summary.reordered,
    );

    var attributes = this.serializeAttributeChanges(summary.attributeChanged);

    var text = summary.characterDataChanged.map((node) => {
      var data = this.serializeNode(node);
      if (data !== null) {
        data.textContent = node.textContent;
      }
      return data;
    });

    this.mirror.applyChanged(removed, moved, attributes, text);

    summary.removed.forEach((node) => {
      this.forgetNode(node);
    });
  }
}
