* root directory for ssr rendering
* beautify html files in dev mode
* templating
    * handlebars for HTML files
    * for css files: use scss hardcoded variables
    * for js files import from json
*  ssr: we specify js, worker via switches, basically read html, apply js
    * or https://github.com/GoogleChromeLabs/prerender-loader
    * or https://github.com/reuters-graphics/html-webpack-prerender-plugin
* generate data:
    * need api keys in config.json
    * download muplis
    * download uncll sentences db
    * download jvs
    * special command yarn update_db