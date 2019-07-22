import timing from "../../helpers/timing";
import ListenInterface from "../../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import ConsoleDataInterface from "../../interfaces/ConsoleDataInterface";

export default class CaptureConsoleMessages implements ListenInterface {
  protected channel: NullPresenceChannel;
  protected readonly event = "console-message";

  protected originalConsoleFunctions = {};
  protected consoleMethods = ["log", "warn", "debug", "info", "error"];

  public setup(channel: NullPresenceChannel) {
    this.channel = channel;
    this.consoleMethods.forEach((method) => {
      this.captureLog(method);
    });
  }

  public teardown() {
    this.consoleMethods.forEach((method) => {
      window[method] = this.originalConsoleFunctions[method];
    });
  }

  private captureLog(method) {
    this.originalConsoleFunctions[method] = window.console[method];
    window.console[method] = function(messages) {
      this.whisper({
        type: method,
        timing: timing(),
        stack: new Error().stack,
        messages: JSON.stringify(messages),
      });
      return this.originalConsoleFunctions[method].apply(
        window.console,
        arguments,
      );
    }.bind(this);
  }

  private whisper(data: ConsoleDataInterface) {
    this.channel.whisper(this.event, data);
  }
}
