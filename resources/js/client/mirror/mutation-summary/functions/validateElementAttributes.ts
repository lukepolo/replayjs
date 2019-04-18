import validateAttribute from "./validateAttribute";

export default function validateElementAttributes(attribs: string): string[] {
  if (!attribs.trim().length)
    throw Error(
      "Invalid request option: elementAttributes must contain at least one attribute.",
    );

  var lowerAttributes = {};
  var attributes = {};

  var tokens = attribs.split(/\s+/);
  for (var i = 0; i < tokens.length; i++) {
    var name = tokens[i];
    if (!name) continue;

    var name = validateAttribute(name);
    var nameLower = name.toLowerCase();
    if (lowerAttributes[nameLower])
      throw Error(
        "Invalid request option: observing multiple case variations of the same attribute is not supported.",
      );

    attributes[name] = true;
    lowerAttributes[nameLower] = true;
  }

  return Object.keys(attributes);
}
