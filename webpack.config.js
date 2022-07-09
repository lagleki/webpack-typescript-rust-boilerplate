/**
 * Webpack main configuration file
 */

const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
// const PrerenderSPAPlugin = require("prerender-webpack5-plugin");
const { PuppeteerPrerenderPlugin } = require("puppeteer-prerender-plugin");

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
    .map((template) => [
      new HTMLWebpackPlugin({
        minify: argv.mode === "production",
        inject: true,
        hash: false,
        filename: template.output,
        template: path.resolve(environment.paths.source, template.input),
        templateParameters: htmlJson(),
        favicon: path.resolve(
          environment.paths.source,
          "images",
          "favicon.ico"
        ),
      }),
      // new PrerenderSPAPlugin({
      //   // Required - Routes to render.
      //   routes: [template.output.replace(/^index\.html$/, "")],
      //   // renderer: require('@prerenderer/renderer-jsdom'),
      //   rendererOptions: {
      //     // Optional - The name of the property to add to the window object with the contents of `inject`.
      //     // injectProperty: "__PRERENDER_INJECTED",
      //     // Optional - Any values you'd like your app to have access to via `window.injectProperty`.
      //     // inject: {
      //     //   foo: "bar",
      //     // },

      //     // Optional - defaults to 0, no limit.
      //     // Routes are rendered asynchronously.
      //     // Use this to limit the number of routes rendered in parallel.
      //     maxConcurrentRoutes: 4,

      //     // Optional - Wait to render until the specified event is dispatched on the document.
      //     // eg, with `document.dispatchEvent(new Event('custom-render-trigger'))`
      //     // renderAfterDocumentEvent: "custom-render-trigger",

      //     // Optional - Wait to render until the specified element is detected using `document.querySelector`
      //     renderAfterElementExists: ".rendered_elem",

      //     // Optional - Wait to render until a certain amount of time has passed.
      //     // NOT RECOMMENDED
      //     // renderAfterTime: 5000, // Wait 5 seconds.
      //     // Optional - Cancel render if it takes more than a certain amount of time
      //     // useful in combination with renderAfterDocumentEvent as it will avoid waiting infinitely if the event doesn't fire
      //     timeout: 5000, // Cancel render if it takes more than 20 seconds

      //     // Other puppeteer options.
      //     // (See here: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions)
      //     // headless: false, // Display the browser window when rendering. Useful for debugging.
      //   },
      // }),
      new PuppeteerPrerenderPlugin({
        enabled: argv.mode !== "development",
        entryDir: "dist",
        outputDir: "dist",
        renderAfterEvent: "__RENDERED__",
        postProcess: (result) => {
          result.html = result.html
            .replace(/<script (.*?)>/g, "<script $1 defer>")
            .replace('id="app"', 'id="app" data-server-rendered="true"');
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
    ])
    .flat();

module.exports = (env, argv) => {
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
      extensions: [".tsx", ".ts", ".js", ".json"],
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
            from: path.resolve(environment.paths.source, "images", "content"),
            to: path.resolve(environment.paths.output, "images", "content"),
            toType: "dir",
            globOptions: {
              ignore: ["*.DS_Store", "Thumbs.db"],
            },
          },
        ],
      }),
    ].concat(htmlPluginEntries(env, argv)),
    target: "web",
  };
};
