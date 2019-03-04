import TimingInterface from "./TimingInterface";

export default interface NetworkRequestDataInterface extends TimingInterface {
  url;
  method;
  headers: object;
  timestamp: Date;
  endTime: Date;
  status: number;
  statusText: string;
  response: string;
  responseHeaders: string;
}
