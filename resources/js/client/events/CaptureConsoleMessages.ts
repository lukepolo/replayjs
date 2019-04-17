import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import ConsoleDataInterface from "../interfaces/ConsoleDataInterface";

export default class CaptureConsoleMessages implements ListenInterface {
  protected channel: NullPresenceChannel;
  protected readonly event = "console-message";

  protected originalConsoleLog;
  protected originalConsoleInfo;
  protected originalConsoleWarn;
  protected originalConsoleError;

  public setup(channel: NullPresenceChannel) {
    this.channel = channel;
    this.originalConsoleLog = window.console.log;
    this.originalConsoleInfo = window.console.info;
    this.originalConsoleWarn = window.console.warn;
    this.originalConsoleError = window.console.error;

    window.console.log = this.captureLog(this.originalConsoleLog, "log");
    window.console.info = this.captureLog(this.originalConsoleInfo, "info");
    window.console.warn = this.captureLog(this.originalConsoleWarn, "warn");
    window.console.error = this.captureLog(this.originalConsoleError, "error");
  }

  public teardown() {
    window.console.log = this.originalConsoleLog;
    window.console.info = this.originalConsoleInfo;
    window.console.warn = this.originalConsoleWarn;
    window.console.error = this.originalConsoleError;
  }

  private captureLog(originalFunction, type) {
    let whisper = this.whisper.bind(this);

    return function(...messages) {
      whisper({
        type,
        messages,
        timing: Date.now(),
      });
      return originalFunction.apply(this, arguments);
    };
  }

  private whisper(data: ConsoleDataInterface) {
    this.channel.whisper(this.event, data);
  }
}
