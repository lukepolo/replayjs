import TimingInterface from "./TimingInterface";

export default interface InitializeDataInterface extends TimingInterface {
  rootId: number;
  baseHref: string;
  children: Array<any>;
}
