import Selector from "../mutation-summary/classes/Selector";
import StringMap from "../mutation-summary/interfaces/StringMap";

export default function elementFilterAttributes(
  selectors: Selector[],
): string[] {
  var attributes: StringMap<boolean> = {};

  selectors.forEach((selector) => {
    selector.qualifiers.forEach((qualifier) => {
      attributes[qualifier.attrName] = true;
    });
  });

  return Object.keys(attributes);
}
