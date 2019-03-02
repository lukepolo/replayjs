import { injectable, inject } from "inversify";
import VarieAuthService from "varie-auth-plugin/lib/AuthService";

@injectable()
export default class AuthService extends VarieAuthService {
  /*
  |--------------------------------------------------------------------------
  | You can customize how each method works for your application
  |--------------------------------------------------------------------------
  |
  | We have setup some defaults that probably wont match what you need,
  | feel free to "overload" them.
  |
  */
}
