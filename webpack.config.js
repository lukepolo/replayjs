const path = require("path");
const VarieBundler = require("varie-bundler");
const ENV = require("dotenv").config().parsed;

module.exports = function(env, argv) {
  return new VarieBundler(argv, __dirname)
    .entry("app", ["resources/js/app/app.ts", "resources/sass/app.scss"])
    .aliases({
      "@app": path.join(__dirname, "resources/js/app"),
      "@views": path.join(__dirname, "resources/js/views"),
      "@store": path.join(__dirname, "resources/js/store"),
      "@config": path.join(__dirname, "resources/js/config"),
      "@routes": path.join(__dirname, "resources/js/routes"),
      "@models": path.join(__dirname, "resources/js/app/models"),
      "@resources": path.join(__dirname, "resources/js/resources"),
      "@components": path.join(__dirname, "resources/js/app/components"),
    })
    .config({
      app: {
        ENV: ENV.APP_ENV,
        VERSION: require("./package").version,
      },
      services: {
        PUSHER_APP_KEY: ENV.PUSHER_APP_KEY,
      },
    })
    .chainWebpack((config, env) => {
      config.plugin("clean").tap((opts) => {
        opts[0] = [
          "public/css",
          "public/js",
          "resources/views/layouts/app.blade.php",
        ];
        return opts;
      });

      config.when(!env.isHot, () => {
        config.plugin("html").tap((opts) => {
          opts[0].filename = "../resources/views/layouts/app.blade.php";
          return opts;
        });
      });

      config.devServer.proxy([
        {
          context: ["/api"],
          target: ENV.APP_URL,
          changeOrigin: true,
        },
      ]);
    })
    .build();
};
