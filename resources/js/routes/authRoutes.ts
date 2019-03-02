import AuthViews from "@views/auth";
import NoAuth from "./middleware/NoAuth";
import RouterInterface from "varie/lib/routing/RouterInterface";

export default function($router: RouterInterface) {
  $router
    .area(AuthViews.AuthArea)
    .middleware([NoAuth])
    .group(() => {
      $router.route("login", AuthViews.Login);
      $router.route("register", AuthViews.Register);
      $router.route("reset-password", AuthViews.ResetPassword);
      $router.route("forgot-password", AuthViews.ForgotPassword);
    });
}
