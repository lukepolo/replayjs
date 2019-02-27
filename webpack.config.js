const path = require("path");
const VarieBundler = require("varie-bundler");
const ENV = require("dotenv").config().parsed;

module.exports = function(env, argv) {
  let bundle = new VarieBundler(argv, __dirname)
    .webWorkers()
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
        WS_URL: ENV.WS_URL,
        APP_URL: ENV.APP_URL,
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

  let clientBundle = new VarieBundler(argv, __dirname)
    .config({
      app: {
        ENV: ENV.APP_ENV,
        WS_URL: ENV.WS_URL,
        APP_URL: ENV.APP_URL,
        VERSION: require("./package").version,
      },
      services: {
        PUSHER_APP_KEY: ENV.PUSHER_APP_KEY,
      },
    })
    .entry("client", ["resources/js/client/client.ts"])
    .chainWebpack((config) => {
      config.module.rules.delete("html");
      config.module.rules.delete("javascript");
      config.module.rules.delete("sass");
      config.module.rules.delete("fonts");
      config.module.rules.delete("images");

      config.plugins.delete("vue");
      config.plugins.delete("html");
      config.plugins.delete("clean");
      config.plugins.delete("multi-build");
      config.plugins.delete("mini-extract");
      config.plugins.delete("browser-sync");
      config.plugins.delete("optimize-assets");

      config.devServer.hot(false);
      config.optimization.splitChunks({}).runtimeChunk(false);

      if (config.plugins.has("analyzer")) {
        config.plugin("analyzer").tap(() => {
          return [
            {
              analyzerPort: 8890,
            },
          ];
        });
      }
      config.output.filename("js/client.js");
    });

  clientBundle._env.isModern = false;

  if (!Array.isArray(bundle)) {
    bundle = [bundle];
  }
  bundle.push(clientBundle.build());

  return bundle;
};
