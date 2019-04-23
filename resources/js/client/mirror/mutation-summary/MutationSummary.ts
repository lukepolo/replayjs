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
import Summary from "./Summary";
import Options from "./interfaces/Options";
import StringMap from "./interfaces/StringMap";
import MutationProjection from "./MutationProjection";

// TODO(rafaelw): Consider allowing backslash in the attrValue.
// TODO(rafaelw): There's got a to be way to represent this state machine more compactly???

export default class MutationSummary {
  protected root: Node;
  protected options: Options;
  protected calcReordered: boolean;
  protected connected: boolean = false;
  protected observer: MutationObserver;
  protected callback: (summaries: Summary[]) => any;

  protected observerOptions = {
    subtree: true,
    childList: true,
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true,
  };

  constructor(opts: Options) {
    if (MutationObserver === undefined) {
      throw Error("DOM Mutation Observers are required");
    }
    this.options = MutationSummary.validateOptions(opts);

    this.root = this.options.rootNode;
    this.callback = this.options.callback;

    this.observer = new MutationObserver((mutations: MutationRecord[]) => {
      this.observerCallback(mutations);
    });

    this.connect();
  }

  public connect() {
    if (this.connected) {
      throw Error("Already connected");
    }
    this.observer.observe(this.root, this.observerOptions);

    this.connected = true;
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
    callback: true,
    rootNode: true,
    oldPreviousSibling: true,
    observeOwnChanges: true,
  };

  private static validateOptions(options: Options): Options {
    for (let prop in options) {
      if (!(prop in MutationSummary.optionKeys))
        throw Error("Invalid option: " + prop);
    }

    if (typeof options.callback !== "function")
      throw Error(
        "Invalid options: callback is required and must be a function",
      );

    return {
      callback: options.callback,
      rootNode: options.rootNode || document,
      observeOwnChanges: options.observeOwnChanges,
      oldPreviousSibling: options.oldPreviousSibling,
    };
  }

  private createSummaries(mutations: MutationRecord[]): Summary[] {
    if (!mutations || !mutations.length) return [];

    let projection = new MutationProjection(
      this.root,
      mutations,
      this.calcReordered,
      this.options.oldPreviousSibling,
    );

    return [new Summary(projection)];
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

    if (this.changesToReport(summaries)) {
      this.callback(summaries);
    }

    // disconnect() may have been called during the callback.
    if (!this.options.observeOwnChanges && this.connected) {
      this.observer.observe(this.root, this.observerOptions);
    }
  }
}
