import TimingInterface from "./TimingInterface";

export default interface DomChangesDataInterface extends TimingInterface {
  text: Array<any>;
  removed: Array<any>;
  attributes: Array<any>;
  addedOrMoved: Array<any>;
}
