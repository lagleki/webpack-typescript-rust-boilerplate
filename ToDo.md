* tts stopped working
* show language flags in history line
* restore feedback
* preload embeddings
* embeddings pregeneration script for all muplis and english sentences into z
* merge muplis results into english
* loading bar improve embeddings and initial preload messaging

* check resize window handling
* pregeneration script
    * audio file generation script 
        * add audio links
    * muplis generation
* search too slow
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