const { merge } = require("webpack-merge");

const webpackConfiguration = require("../webpack.config.js");
const environment = require("./environment");

module.exports = (env, argv) =>
  merge(webpackConfiguration(env, argv), {
    /* Manage source maps generation process */
    devtool: "eval-source-map",

    /* Development Server Configuration */
    devServer: {
      static: {
        directory: environment.paths.output,
        publicPath: "/",
        watch: true,
      },
      client: {
        overlay: true,
      },
      open: true,
      compress: true,
      hot: false,
      ...environment.server,
    },

    /* File watcher options */
    watchOptions: {
      aggregateTimeout: 300,
      poll: 300,
      ignored: /node_modules/,
    },

    /* Additional plugins configuration */
    plugins: [],
  });
