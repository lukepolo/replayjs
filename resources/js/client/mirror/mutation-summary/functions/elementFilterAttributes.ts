import Selector from "../classes/Selector";
import StringMap from "../interfaces/StringMap";

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
