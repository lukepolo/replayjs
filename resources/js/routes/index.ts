import RouterInterface from "varie/lib/routing/RouterInterface";

import middleware from "./middleware";
import authRoutes from "./authRoutes";
import ErrorViews from "@views/errors";

import Home from "@views/Home.vue";
import Player from "@views/Player.vue";
import Preview from "@views/Preview.vue";
import Dashboard from "@views/Dashboard.vue";

export default function($router: RouterInterface) {
  /*
  |--------------------------------------------------------------------------
  | Your default routes for your application
  |--------------------------------------------------------------------------
  |
  */
  $router
    .middleware([middleware.HomeMiddleware])
    .route("/", Home)
    .setName("home");

  authRoutes($router);

  $router.middleware([]).group(() => {
    $router
      .middleware([middleware.HomeMiddleware])
      .route("/", Dashboard)
      .setName("dashboard");
    $router.route("preview", Preview);
    $router.route("recordings/:recording/player", Player);
  });

  $router.route("*", ErrorViews.Error404);
}
