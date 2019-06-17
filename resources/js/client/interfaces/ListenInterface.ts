import { NullPresenceChannel } from "laravel-echo/dist/channel";

export default interface ListenInterface {
  setup(channel: NullPresenceChannel);
  teardown();
}
