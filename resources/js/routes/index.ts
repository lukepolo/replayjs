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

  $router.middleware([]).group(() => {
    $router
      .middleware([middleware.HomeMiddleware])
      .route("/", Dashboard)
      .setName("dashboard");

    $router.route("site/:site/dashboard", siteViews.SiteDashboard);
    $router.route(
      "recordings/:recording/player",
      siteViews.SiteRecordingPlayer,
    );
  });

  $router.route("*", errorViews.Error404);
}
