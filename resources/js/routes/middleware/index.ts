/*
|--------------------------------------------------------------------------
| Route Middleware
|--------------------------------------------------------------------------
| You can setup your global route middleware here, Which then can be used
| in your routes file easily.
*/
import Auth from "./Auth";
import NoAuth from "./NoAuth";
import HomeMiddleware from "./HomeMiddleware";

export default {
  Auth,
  NoAuth,
  HomeMiddleware,
};
