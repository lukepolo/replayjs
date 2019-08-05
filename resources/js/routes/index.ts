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

  $router
    .middleware([middleware.HomeMiddleware])
    .route("/", Home)
    .setName("home");

  authRoutes($router);

  $router
    .layout("authed")
    .middleware([middleware.Auth])
    .group(() => {
      $router
        .middleware([middleware.HomeMiddleware])
        .route("/", Dashboard)
        .setName("dashboard");
      $router
        .prefix("site/:site")
        .area(siteViews.SiteArea)
        .group(() => {
          $router.route("setup", siteViews.SiteSetup);
          $router.route("dashboard", siteViews.SiteDashboard);
          $router.prefix("guest:guest").group(() => {
            $router.route("", siteViews.SiteGuestSessions);
            $router.route("session/:session", siteViews.SiteSessionPlayer);
          });
        });
    });

  $router.route("*", errorViews.Error404);
}
