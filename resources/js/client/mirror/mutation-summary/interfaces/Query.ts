import Selector from "../classes/Selector";

export default interface Query {
  element?: string;
  attribute?: string;
  all?: boolean;
  characterData?: boolean;
  elementAttributes?: string;
  attributeList?: string[];
  elementFilter?: Selector[];
}
