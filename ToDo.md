* huggingface lojban-tts stopped working
* restore socket.io
* restore corpus-downloader
    * muplis with voy embeddings
    * normal langs
* bundle size & speed
    * https://www.npmjs.com/package/brotli-unicode
    * remove second query when no results
* dont send results to console in prod mode
* how to separate official prefer vs semantic scales
* not every tile should fire an update
    * separate tiles by size
* show language+mode flags in history line
* restore feedback
* check resize window handling
* skicu before loading - optimize app loading speed
* embeddings
    * use sentence embeddings for fasstext
    * new generator for fasttext without lz compression
    * preload embeddings unwrapped
    * preload embeddings
    * embeddings pregeneration script for all muplis and english sentences into z
    * loading bar improve embeddings and initial preload messaging
* simplify sql query
    * merge with muplis
    * RAM search: or from similarity to encoding of input
        * vector search
            * load in ram
            * fetch by id from sql
            * sort accordingly
    * show muplis sentences from encoding of input
    * merge muplis results into english
        * we have phrases mode for english only
        * the second result are top 10 results from muplis. lazy loading
        * on click switch to phrases mode

* pregeneration script
    * sisku=now script must take into account
    * audio file generation script 
        * add audio links
    * muplis generation

* coi.js, Cache: files to cache
    * cross origin isolated is a must
        * implement reload
* dasri - rework
    mobile:
    search line
    buttons: language normal semsearch rimni selmaho
    comment: additional links in this.language
    comment: use regexp
    history: 


    desktop: search + buttons

## test
* better message for semantic/+/catni/rimni/fanva/selmaho search
* search too slow
* localize alert messages
* simple coi leads to two queries in db!
* selmaho search not working
* second precise result is always in lojban - only sql change
* tooltips for long words must show load line
* on language change load more dicts
* language not changed on click from desktop
* if url coincides with clicked tile then search doesnt happen
* restore desktop tiles
* semdistance not disappears
* arrows disable button not working
* add opfs - how to detect support?
* when switching from tankomo to ctucku even arrows flicker
* on word change it is reset too early
* from desktop to searching mode - what if empty search
* clear button not working
* rotation animation on search

## other

* grpc
* move ssr-prerenderer to a npm package
* use renderer
* use github addresses in package.json
* beautify html files in dev mode
* templating
    * TODO: how to store config.json ?
    * for css files: use scss hardcoded variables
    * for js files import from json
* package lojban-corpus-downloader
    * need api keys in config.json
    * download muplis
    * download uncll sentences db
    * download DwE
    * download jvs
    * download propbank
    * special command yarn update_db