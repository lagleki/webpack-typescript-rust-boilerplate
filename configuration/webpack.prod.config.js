/* eslint-disable import/no-extraneous-dependencies */
const { merge } = require("webpack-merge");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { ESBuildMinifyPlugin } = require("esbuild-loader");

const webpackConfiguration = require("../webpack.config");

module.exports = (env, argv) =>
  merge(webpackConfiguration(env, argv), {
    /* Manage source maps generation process. Refer to https://webpack.js.org/configuration/devtool/#production */
    devtool: false,

    /* Optimization configuration */
    optimization: {
      minimize: true,
      minimizer: [
        // new TerserPlugin({
        //   parallel: true,
        // }),
        // new CssMinimizerPlugin(),
        new ESBuildMinifyPlugin({
          target: "es2015", // Syntax to compile to (see options below for possible values)
          css: true
        }),
      ],
    },

    /* Performance treshold configuration values */
    performance: {
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },

    /* Additional plugins configuration */
    plugins: [],
  });
