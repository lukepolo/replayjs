import RouterInterface from "varie/lib/routing/RouterInterface";

import middleware from "./middleware";
import ErrorViews from "@views/errors";
import Welcome from "@views/Welcome.vue";
import Player from "@views/Player.vue";
import Preview from "@views/Preview.vue";

export default function($router: RouterInterface) {
  /*
  |--------------------------------------------------------------------------
  | Your default routes for your application
  |--------------------------------------------------------------------------
  |
  */
  $router.route("/", Welcome);
  $router.route("preview", Preview);
  $router.route("/recordings/:recording/player", Player);

  $router.route("*", ErrorViews.Error404);
}
