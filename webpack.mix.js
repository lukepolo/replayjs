const path = require("path");
const mix = require("laravel-mix");
const env = require("dotenv").config().parsed;

if (process.env.NODE_ENV !== "development") {
  mix.config.production = true;
}

/*
|--------------------------------------------------------------------------
| Mix Asset Management
|--------------------------------------------------------------------------
| https://github.com/JeffreyWay/laravel-mix/tree/master/docs#readme
|
*/
mix
  .typeScript("resources/assets/js/app/app.ts", "js")
	.typeScript("resources/assets/js/client/client.ts", "js")
  // .extract([
  //   "vue",
  //   "vue-router",
  //   "vuex"
  // ])
	.sass("resources/assets/sass/app.scss", "css")
  .setPublicPath("public")
  .browserSync({
    open: "external",
    host: env ? env.APP_URL : "varie.test",
    proxy: env ? env.APP_URL : "varie.test",
    files: ["public/**/*.js", "public/**/*.css"]
  })
  .sourceMaps()
  .webpackConfig({
    resolve: {
      symlinks: false,
      alias: {
        "@app": path.join(__dirname + '/resources/assets/js', "app"),
        "@routes": path.join(__dirname + '/resources/assets/js', "routes"),
        "@config": path.join(__dirname + '/resources/assets/js', "config"),
        "@store": path.join(__dirname + '/resources/assets/js', "app/store"),
        "@models": path.join(__dirname + '/resources/assets/js', "app/models"),
        "@resources": path.join(__dirname + '/resources/assets/js', "resources"),
        "@views": path.join(__dirname + '/resources/assets/js', "resources/views"),
        "@components": path.join(__dirname + '/resources/assets/js', "app/components")
      }
    }
  })
  .options({
    extractVueStyles: true
  })
	.version();
