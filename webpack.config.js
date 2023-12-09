/**
 * Webpack main configuration file
 */
const webpack = require("webpack");

const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const Dotenv = require("dotenv-webpack");
const WorkboxPlugin = require("workbox-webpack-plugin");

const { PuppeteerPrerenderPlugin } = require("puppeteer-prerender-plugin");
const prettier = require("prettier");

const environment = require("./configuration/environment");

const templateFiles = fs
  .readdirSync(environment.paths.source)
  .filter((file) =>
    [".html", ".ejs"].includes(path.extname(file).toLowerCase())
  )
  .map((filename) => ({
    input: filename,
    output: filename.replace(/\.ejs$/, ".html"),
  }));

function htmlJson() {
  try {
    return JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "configuration", "html.json"))
    );
  } catch (error) {
    return {};
  }
}
const htmlPluginEntries = (env, argv) =>
  templateFiles
    .map((template) =>
      [
        new HTMLWebpackPlugin({
          minify: argv.mode === "production",
          inject: true,
          hash: false,
          filename: template.output,
          template: path.resolve(environment.paths.source, template.input),
          templateParameters: htmlJson(),
          favicon: path.resolve(
            environment.paths.source,
            "assets/pixra",
            "snime-1.svg"
          ),
        }),
        argv.mode !== "production"
          ? undefined
          : new PuppeteerPrerenderPlugin({
              enabled: true,
              entryDir: path.join(__dirname, "dist"),
              outputDir: path.join(__dirname, "dist"),
              renderAfterEvent: "__RENDERED__",
              postProcess: (result) => {
                // result.html = result.html
                //   .replace(/<script (.*?)>/g, "<script $1 defer>")
                //   .replace('id="root"', 'id="root" data-server-rendered="true"');
                if (argv.mode === "development") {
                  result.html = prettier.format(result.html, {
                    parser: "html",
                  });
                }
              },
              routes: [
                "/" + template.output.replace(/^index\.html$/, ""), // Renders to dist/index.html
              ],
              puppeteerOptions: {
                // Needed to run inside Docker
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
              },
            }),
      ].filter(Boolean)
    )
    .flat();

module.exports = (env, argv) => {
  const workboxPlugin = new WorkboxPlugin.GenerateSW({
    // these options encourage the ServiceWorkers to get in there fast
    // and not allow any straggling "old" SWs to hang around
    clientsClaim: true,
    skipWaiting: true,
    maximumFileSizeToCacheInBytes: 100 * 1024 * 1024,
  });

  if (argv.mode !== "production") {
    Object.defineProperty(workboxPlugin, "alreadyCalled", {
      get() {
        return false;
      },
      set() {},
    });
  }
  const plugins = [workboxPlugin];
  return {
    mode: argv.mode,
    experiments: {
      asyncWebAssembly: true,
      // layers: true,
      // lazyCompilation: true,
      // outputModule: true,
      syncWebAssembly: true,
      // topLevelAwait: true,
    },
    entry: {
      app: path.resolve(environment.paths.source, "ts", "index.ts"),
    },
    resolve: {
      // crypto: false,
      // fs: false,
      // path: false,
      extensions: [".tsx", ".ts", ".js", ".json"],
      fallback: {
        buffer: require.resolve("buffer"),
      },
    },
    output: {
      filename: "js/[name].js",
      path: environment.paths.output,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.((c|sa|sc)ss)$/i,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ["babel-loader"],
        },
        {
          test: /\.(png|gif|jpe?g|svg)$/i,
          type: "asset",
          parser: {
            dataUrlCondition: {
              maxSize: environment.limits.images,
            },
          },
          generator: {
            filename: "images/design/[name].[hash:6][ext]",
          },
        },
        {
          test: /\.(eot|ttf|woff|woff2)$/,
          type: "asset",
          parser: {
            dataUrlCondition: {
              maxSize: environment.limits.images,
            },
          },
          generator: {
            filename: "images/design/[name].[hash:6][ext]",
          },
        },
      ],
    },
    optimization: {
      // splitChunks: {
      //   chunks: `async`,
      //   minSize: 20000,
      //   minRemainingSize: 0,
      //   minChunks: 1,
      //   maxAsyncRequests: 30,
      //   maxInitialRequests: 30,
      //   enforceSizeThreshold: 50000,
      //   cacheGroups: {
      //     defaultVendors: {
      //       test: /[\\/]node_modules[\\/]/,
      //       priority: -10,
      //       reuseExistingChunk: true,
      //     },
      //     default: {
      //       minChunks: 2,
      //       priority: -20,
      //       reuseExistingChunk: true,
      //     },
      //   },
      // },
      minimizer: [
        "...",
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              // Lossless optimization with custom option
              // Feel free to experiment with options for better result for you
              plugins: [
                ["gifsicle", { interlaced: true }],
                ["jpegtran", { progressive: true }],
                ["optipng", { optimizationLevel: 5 }],
                // Svgo configuration here https://github.com/svg/svgo#configuration
                [
                  "svgo",
                  {
                    plugins: [
                      {
                        name: "removeViewBox",
                        active: false,
                      },
                    ],
                  },
                ],
              ],
            },
          },
        }),
      ],
    },
    plugins: [
      ...plugins,
      new WasmPackPlugin({
        crateDirectory: __dirname,
        outDir: "pkg",
        // forceWatch: true,
      }),
      new MiniCssExtractPlugin({
        filename: "css/[name].css",
      }),
      new CleanWebpackPlugin({
        verbose: true,
        cleanOnceBeforeBuildPatterns: ["**/*", "!stats.json"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "node_modules/onnxruntime-web/dist/*.wasm",
            to: "[name][ext]",
          },
          {
            from: path.resolve(environment.paths.source, "assets"),
            to: path.resolve(environment.paths.output, "assets"),
            toType: "dir",
            globOptions: {
              ignore: ["*.DS_Store", "Thumbs.db"],
            },
          },
          {
            from: path.resolve(
              environment.paths.source,
              "ts",
              "worker",
              "data"
            ),
            to: path.resolve(environment.paths.output, "data"),
            toType: "dir",
            globOptions: {
              ignore: ["*.DS_Store", "Thumbs.db"],
            },
          },
        ],
      }),
      new webpack.DefinePlugin({
        production: false,
        sql_buffer_mode: "memory",
      }),
      new Dotenv(),
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
      // new webpack.ProvidePlugin({
      //   process: 'process/browser',
      // }),
    ].concat(htmlPluginEntries(env, argv)),
    target: "web",
  };
};
