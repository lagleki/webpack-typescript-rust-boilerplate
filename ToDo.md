* check all TODO
* the CLL in markdown
* restore corpus-downloader
    * pack it to a ci/cd app, run every week
    * muplis with sentence embeddings
        * embeddings pregeneration script for all muplis and english sentences into z
    * package lojban-corpus-downloader
        * download uncll sentences db
        * whole CLL content
        * download DwE
        * download propbank
    * audio file generation script 
        * add audio links
* versio.json is used to check which files from dumps need to be updated
* tcini.json is used to check which files from sutysisku need to be updated
* two renders of same word when switching between words
* huggingface lojban-tts stopped working
* restore socket.io
* bundle size & speed
    * remove second query when no results
* dont send results to console in prod mode
* how to separate official prefer vs semantic scales
* not every tile should fire an update
    * separate tiles by size
* show language+mode flags in history line
* restore feedback
    * send to chat
* skicu before loading - optimize app loading speed
* embeddings
    * add embeddings to muplis generation
    * add embeddings to normal dict generation
        * replace $$, {} to <MASK>
    * input -> to using embedding
    * comment out fasttext
    * (?) use sentence embeddings for fasttext
    * (?) new generator for fasttext without lz compression
    * preload embeddings unwrapped
    * preload embeddings
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
* coi.js, Cache: files to cache
    * cross origin isolated is a must
        * implement reload

## test
* rotation animation on search
    * should gracefully stop rotating
* arrows not shown on load, have to scroll
* arrows should only show once in a def. check prulamdei, ctucku
* https://www.npmjs.com/package/brotli-unicode
* dasri - rework
    * mobile:
        search line
        buttons: language normal semsearch rimni selmaho
        comment: additional links in this.language
        comment: use regexp
        history: 
    * desktop: search + buttons
* mobile view fixes
    * mobile only top bar not nice
    * check resize window handling
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