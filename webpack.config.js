const VarieBundler = require("varie-bundler");
const ENV = require("dotenv").config().parsed;

module.exports = function(env) {
  let bundle = new VarieBundler(env, {
    bundleName: "web",
    vue: {
      runtimeOnly: false,
    },
  })
    .webWorkers()
    .entry("app", ["resources/js/app/app.ts", "resources/sass/app.scss"])
    .aliases({
      "@app": "resources/js/app",
      "@views": "resources/js/views",
      "@store": "resources/js/store",
      "@config": "resources/js/config",
      "@routes": "resources/js/routes",
      "@models": "resources/js/app/models",
      "@resources": "resources/js/resources",
      "@components": "resources/js/app/components",
    })
    .varieConfig({
      app: {
        ENV: ENV.APP_ENV,
        APP_URL: ENV.APP_URL,
        WS_HOST: ENV.WS_HOST,
        WS_PORT: ENV.WS_PORT,
        VERSION: require("./package").version,
      },
      services: {
        PUSHER_APP_KEY: ENV.PUSHER_APP_KEY,
      },
    })
    .dontClean([
      "svg",
      "vendor",
      ".htaccess",
      "favicon.ico",
      "index.php",
      "robots.txt",
    ])
    .chainWebpack((config, env) => {
      config.when(!env.isHot, () => {
        config.plugin("html").tap((opts) => {
          opts[0].filename = "../resources/views/layouts/app.blade.php";
          return opts;
        });
      });
    })
    .chainWebpack((config) => {
      config.devServer.disableHostCheck(true);
    })
    .proxy("/api", ENV.APP_URL)
    .build();

  let clientBundle = new VarieBundler(env, "client")
    .varieConfig({
      app: {
        ENV: ENV.APP_ENV,
        APP_URL: ENV.APP_URL,
        WS_HOST: ENV.WS_HOST,
        WS_PORT: ENV.WS_PORT,
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
