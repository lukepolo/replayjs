import RouterInterface from "varie/lib/routing/RouterInterface";

import middleware from "./middleware";
import authRoutes from "./authRoutes";

import siteViews from "@views/site";
import errorViews from "@views/errors";

import Home from "@views/Home.vue";
import Dashboard from "@views/Dashboard.vue";

export default function($router: RouterInterface) {
  /*
  |--------------------------------------------------------------------------
  | Your default routes for your application
  |--------------------------------------------------------------------------
  |
  */

  authRoutes($router);

  $router
    .middleware([middleware.HomeMiddleware])
    .route("/", Home)
    .setName("home");

  $router
    .layout("authed")
    .middleware([middleware.Auth])
    .group(() => {
      $router
        .middleware([middleware.HomeMiddleware])
        .route("/", Dashboard)
        .setName("dashboard");
      $router
        .prefix("site")
        .area(siteViews.SiteArea)
        .group(() => {
          $router.route(":site/dashboard", siteViews.SiteDashboard);
          // varie bug, naming it site.player
          $router
            .route(
              ":site/recordings/:recording/player",
              siteViews.SiteRecordingPlayer,
            )
            .setName("site.recordings.player");
        });
    });

  $router.route("*", errorViews.Error404);
}
