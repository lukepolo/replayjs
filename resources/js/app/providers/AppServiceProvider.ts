import { ServiceProvider } from "varie";
import RecordingService from "@app/services/RecordingService";

/*
|--------------------------------------------------------------------------
| App Service Provider
|--------------------------------------------------------------------------
| You can bind various items to the app here, or can create other
| custom providers that bind the container
|
*/
export default class AppProviderServiceProvider extends ServiceProvider {
  public async boot() {
    // ...
  }

  public async register() {
    this.app.bind("RecordingService", RecordingService);
  }
}
