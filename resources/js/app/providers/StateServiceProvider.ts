import { StateServiceProvider as ServiceProvider } from "varie";
import StateServiceInterface from "varie/lib/state/StateServiceInterface";
import RecordingStore from "@store/recording/RecordingStore";

/*
|--------------------------------------------------------------------------
| Store Service Provider
|--------------------------------------------------------------------------
|
*/
export default class StateServiceProvider extends ServiceProvider {
  public $store: StateServiceInterface;

  public async boot() {
    super.boot();

    // ...
  }

  public async register() {
    super.register();

    // ...
  }

  public map() {
    this.$store.registerStore(RecordingStore);
  }
}
