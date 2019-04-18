// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// TODO(rafaelw): Allow ':' and '.' as valid name characters.
import NodeMap from "./NodeMap";
import Selector from "./Selector";
import Options from "./interfaces/Options";
import Query from "./interfaces/Query";
import Summary from "./Summary";
import StringMap from "./interfaces/StringMap";
import elementFilterAttributes from "./functions/elementFilterAttributes";
import validateAttribute from "./functions/validateAttribute";
import validateElementAttributes from "./functions/validateElementAttributes";
import MutationProjection from "./MutationProjection";

// TODO(rafaelw): Consider allowing backslash in the attrValue.
// TODO(rafaelw): There's got a to be way to represent this state machine more compactly???

export default class MutationSummary {
  public static NodeMap = NodeMap; // exposed for use in TreeMirror.
  public static parseElementFilter = Selector.parseSelectors; // exposed for testing.

  public static createQueryValidator: (root: Node, query: Query) => any;
  private connected: boolean = false;
  private options: Options;
  private observer: MutationObserver;
  private observerOptions: MutationObserverInit;
  private root: Node;
  private callback: (summaries: Summary[]) => any;
  private elementFilter: Selector[];
  private calcReordered: boolean;
  private queryValidators: any[];

  constructor(opts: Options) {
    if (MutationObserver === undefined) {
      throw Error("DOM Mutation Observers are required");
    }
    this.options = MutationSummary.validateOptions(opts);
    this.observerOptions = MutationSummary.createObserverOptions(
      this.options.queries,
    );

    this.root = this.options.rootNode;
    this.callback = this.options.callback;

    this.elementFilter = Array.prototype.concat.apply(
      [],
      this.options.queries.map((query) => {
        return query.elementFilter ? query.elementFilter : [];
      }),
    );
    if (!this.elementFilter.length) this.elementFilter = undefined;

    this.calcReordered = this.options.queries.some((query) => {
      return query.all;
    });

    // TODO _ i dont think we need this for replay
    this.queryValidators = []; // TODO(rafaelw): Shouldn't always define this.
    if (MutationSummary.createQueryValidator) {
      this.queryValidators = this.options.queries.map((query) => {
        return MutationSummary.createQueryValidator(this.root, query);
      });
    }

    this.observer = new MutationObserver((mutations: MutationRecord[]) => {
      this.observerCallback(mutations);
    });

    this.reconnect();
  }

  public reconnect() {
    if (this.connected) {
      throw Error("Already connected");
    }

    this.observer.observe(this.root, this.observerOptions);
    this.connected = true;
    this.checkpointQueryValidators();
  }

  public takeSummaries(): Summary[] {
    if (!this.connected) throw Error("Not connected");

    let summaries = this.createSummaries(this.observer.takeRecords());
    return this.changesToReport(summaries) ? summaries : undefined;
  }

  public disconnect(): Summary[] {
    let summaries = this.takeSummaries();
    this.observer.disconnect();
    this.connected = false;
    return summaries;
  }

  private static optionKeys: StringMap<boolean> = {
    callback: true, // required
    queries: true, // required
    rootNode: true,
    oldPreviousSibling: true,
    observeOwnChanges: true,
  };

  private static createObserverOptions(queries: Query[]): MutationObserverInit {
    let observerOptions: MutationObserverInit = {
      childList: true,
      subtree: true,
    };

    let attributeFilter: StringMap<boolean>;
    function observeAttributes(attributes?: string[]) {
      if (observerOptions.attributes && !attributeFilter) return; // already observing all.

      observerOptions.attributes = true;
      observerOptions.attributeOldValue = true;

      if (!attributes) {
        // observe all.
        attributeFilter = undefined;
        return;
      }

      // add to observed.
      attributeFilter = attributeFilter || {};
      attributes.forEach((attribute) => {
        attributeFilter[attribute] = true;
        attributeFilter[attribute.toLowerCase()] = true;
      });
    }

    queries.forEach((query) => {
      if (query.characterData) {
        observerOptions.characterData = true;
        observerOptions.characterDataOldValue = true;
        return;
      }

      if (query.all) {
        observeAttributes();
        observerOptions.characterData = true;
        observerOptions.characterDataOldValue = true;
        return;
      }

      if (query.attribute) {
        observeAttributes([query.attribute.trim()]);
        return;
      }

      let attributes = elementFilterAttributes(query.elementFilter).concat(
        query.attributeList || [],
      );
      if (attributes.length) observeAttributes(attributes);
    });

    if (attributeFilter)
      observerOptions.attributeFilter = Object.keys(attributeFilter);

    return observerOptions;
  }

  private static validateOptions(options: Options): Options {
    for (let prop in options) {
      if (!(prop in MutationSummary.optionKeys))
        throw Error("Invalid option: " + prop);
    }

    if (typeof options.callback !== "function")
      throw Error(
        "Invalid options: callback is required and must be a function",
      );

    if (!options.queries || !options.queries.length)
      throw Error(
        "Invalid options: queries must contain at least one query request object.",
      );

    let opts: Options = {
      callback: options.callback,
      rootNode: options.rootNode || document,
      observeOwnChanges: !!options.observeOwnChanges,
      oldPreviousSibling: !!options.oldPreviousSibling,
      queries: [],
    };

    for (let i = 0; i < options.queries.length; i++) {
      let request = options.queries[i];

      // all
      if (request.all) {
        if (Object.keys(request).length > 1)
          throw Error("Invalid request option. all has no options.");

        opts.queries.push({ all: true });
        continue;
      }

      // attribute
      if ("attribute" in request) {
        let query: Query = {
          attribute: validateAttribute(request.attribute),
        };

        query.elementFilter = Selector.parseSelectors(
          "*[" + query.attribute + "]",
        );

        if (Object.keys(request).length > 1)
          throw Error("Invalid request option. attribute has no options.");

        opts.queries.push(query);
        continue;
      }

      // element
      if ("element" in request) {
        let requestOptionCount = Object.keys(request).length;
        let query: Query = {
          element: request.element,
          elementFilter: Selector.parseSelectors(request.element),
        };

        if (request.hasOwnProperty("elementAttributes")) {
          query.attributeList = validateElementAttributes(
            request.elementAttributes,
          );
          requestOptionCount--;
        }

        if (requestOptionCount > 1)
          throw Error(
            "Invalid request option. element only allows elementAttributes option.",
          );

        opts.queries.push(query);
        continue;
      }

      // characterData
      if (request.characterData) {
        if (Object.keys(request).length > 1)
          throw Error("Invalid request option. characterData has no options.");

        opts.queries.push({ characterData: true });
        continue;
      }

      throw Error("Invalid request option. Unknown query request.");
    }

    return opts;
  }

  private createSummaries(mutations: MutationRecord[]): Summary[] {
    if (!mutations || !mutations.length) return [];

    let projection = new MutationProjection(
      this.root,
      mutations,
      this.elementFilter,
      this.calcReordered,
      this.options.oldPreviousSibling,
    );

    let summaries: Summary[] = [];
    for (let i = 0; i < this.options.queries.length; i++) {
      summaries.push(new Summary(projection, this.options.queries[i]));
    }

    return summaries;
  }

  private checkpointQueryValidators() {
    this.queryValidators.forEach((validator) => {
      if (validator) validator.recordPreviousState();
    });
  }

  private runQueryValidators(summaries: Summary[]) {
    this.queryValidators.forEach((validator, index) => {
      if (validator) validator.validate(summaries[index]);
    });
  }

  private changesToReport(summaries: Summary[]): boolean {
    return summaries.some((summary) => {
      let summaryProps = [
        "added",
        "removed",
        "reordered",
        "reparented",
        "valueChanged",
        "characterDataChanged",
      ];
      if (
        summaryProps.some(function(prop) {
          return summary[prop] && summary[prop].length;
        })
      )
        return true;

      if (summary.attributeChanged) {
        let attrNames = Object.keys(summary.attributeChanged);
        let attrsChanged = attrNames.some((attrName) => {
          return !!summary.attributeChanged[attrName].length;
        });
        if (attrsChanged) return true;
      }
      return false;
    });
  }

  private observerCallback(mutations: MutationRecord[]) {
    if (!this.options.observeOwnChanges) {
      this.observer.disconnect();
    }

    let summaries = this.createSummaries(mutations);
    this.runQueryValidators(summaries);

    if (this.options.observeOwnChanges) {
      this.checkpointQueryValidators();
    }

    if (this.changesToReport(summaries)) {
      this.callback(summaries);
    }

    // disconnect() may have been called during the callback.
    if (!this.options.observeOwnChanges && this.connected) {
      this.checkpointQueryValidators();
      this.observer.observe(this.root, this.observerOptions);
    }
  }
}
