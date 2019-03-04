import TimingInterface from "./TimingInterface";

export default interface ConsoleDataInterface extends TimingInterface {
  type: string;
  messages: Array<any>;
}
