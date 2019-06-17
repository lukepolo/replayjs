import TimingInterface from "./TimingInterface";

export default interface ScrollDataInterface extends TimingInterface {
  target: EventTarget;
  scrollPosition: number;
}
