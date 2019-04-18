import escapeQuotes from "./functions/escapeQuotes";

export default class Qualifier {
  public attrName: string;
  public attrValue: string;
  public contains: boolean;

  public matches(oldValue: string): boolean {
    if (oldValue === null) return false;

    if (this.attrValue === undefined) return true;

    if (!this.contains) return this.attrValue == oldValue;

    let tokens = oldValue.split(" ");
    for (let i = 0; i < tokens.length; i++) {
      if (this.attrValue === tokens[i]) return true;
    }

    return false;
  }

  public toString(): string {
    if (this.attrName === "class" && this.contains) {
      return "." + this.attrValue;
    }

    if (this.attrName === "id" && !this.contains) {
      return "#" + this.attrValue;
    }

    if (this.contains) {
      return "[" + this.attrName + "~=" + escapeQuotes(this.attrValue) + "]";
    }

    // TODO - make sure this works
    if (this.attrValue) {
      return "[" + this.attrName + "=" + escapeQuotes(this.attrValue) + "]";
    }

    return `[${this.attrName}]`;
  }
}
