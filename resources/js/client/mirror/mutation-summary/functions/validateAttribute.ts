const attributeFilterPattern = /^([a-zA-Z:_]+[a-zA-Z0-9_\-:\.]*)$/;

export default function validateAttribute(attribute: string) {
  if (typeof attribute != "string")
    throw Error(
      "Invalid request opion. attribute must be a non-zero length string.",
    );

  attribute = attribute.trim();

  if (!attribute)
    throw Error(
      "Invalid request opion. attribute must be a non-zero length string.",
    );

  if (!attribute.match(attributeFilterPattern))
    throw Error("Invalid request option. invalid attribute name: " + attribute);

  return attribute;
}
