import SQLiteAsyncESMFactory from "../libs/wa-sqlite/dist/wa-sqlite-async.mjs";

import * as SQLite from "../libs/wa-sqlite/src/sqlite-api.js";

import { IDBBatchAtomicVFS as VFS } from "../libs/wa-sqlite/src/examples/IDBBatchAtomicVFS.js";
import { OriginPrivateFileSystemVFS as VFS2 } from "../libs/wa-sqlite/src/examples/OriginPrivateFileSystemVFS.js";

import { AutoQueue } from "../libs/queue";
import { parse } from "./template/cmaxes.js";
import { WordEmbeddings, loadModel } from "./template/w2v/embeddings";
import jsonTeJufra from "./template/tejufra.json";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { decompress } from "brotli-compress/js";
import { Def, Dict, EmbeddingsFile, Searching } from "../types/index.js";
import { blobChunkDefaultLength } from "../consts";
import { log } from "../libs/logger";

import { FeatureExtractionModel, ModelType } from "../libs/inference/text";
import { SimpleTextModel } from "../libs/inference/text/simpleTextModel";

self.postMessage({ kind: "loading" });

let sql_buffer_mode: string, production: string;
const aQueue = new AutoQueue();

self.onmessage = function (ev) {
  if (ev.data.kind == "newSearch") {
    aQueue.enqueue({
      action: async () => {
        await sisku(ev.data);
      },
      name: "vlaste",
    });
  } else if (ev.data.kind == "parse") {
    aQueue.enqueue({
      action: () => {
        cmaxesParse({ ...ev.data }, function (res: any) {
          self.postMessage({
            kind: "parse",
            results: res,
            req: ev.data,
          });
        });
      },
    });
  } else if (ev.data.kind == "fancu" && ev.data.cmene) {
    (fancu as any)[ev.data.cmene](ev.data, function (results: any) {
      self.postMessage({
        kind: "fancu",
        cmene: ev.data.cmene,
        datni: ev.data,
        results: results,
      });
    });
  }
};

let db: number,
  sqlite3: SQLiteAPI,
  sql: (sql: string | string[], ...values: any[]) => Promise<Dict[]>,
  wordEmbeddings: WordEmbeddings;

/* TODO:
  check on clean startup fix all errors
  test on old android browsers if opfs gets disabled
*/
async function initSQLDB() {
  const module = await SQLiteAsyncESMFactory();
  sqlite3 = SQLite.Factory(module);
  if ("storage" in navigator && "getDirectory" in navigator.storage) {
    // OPFS is supported
    log("OPFS is supported");

    sqlite3.vfs_register(new VFS2(), true);
    const DB_NAME = "file:///benchmark?foo=bar";
    db = await sqlite3.open_v2(
      DB_NAME,
      SQLite.SQLITE_OPEN_CREATE |
        SQLite.SQLITE_OPEN_READWRITE |
        SQLite.SQLITE_OPEN_URI,
      "opfs"
    );
  } else {
    // OPFS is not supported
    log("OPFS is not supported");
    sqlite3.vfs_register(new VFS("sutysisku"));

    db = await sqlite3.open_v2("sutysisku", undefined, "sutysisku");
  }

  sqlite3.create_function(
    db,
    "regexp",
    2,
    SQLite.SQLITE_UTF8 | SQLite.SQLITE_DETERMINISTIC,
    0,
    function (context, values) {
      const pattern = new RegExp(sqlite3.value_text(values[0]));
      const s = sqlite3.value_text(values[1]);
      sqlite3.result(context, pattern.test(s) ? 1 : 0);
    }
  );

  //todo: memory/delete mode
  await sqlite3.exec(db, `pragma cache_size = 6000;`);
  await sqlite3.exec(db, `pragma page_size = 8192;`);
  await sqlite3.exec(db, `PRAGMA journal_mode=memory;`);
  // db.run(`
  // pragma page_size = 8192;
  // ${self.sql_pragma_mode === 'memory' ? 'pragma cache_size = 6000;' : ''}
  //   PRAGMA journal_mode=MEMORY;
  // `)
  sql = prepareWrapper();

  await runMigrations();

  if (sql_buffer_mode === "memory") {
    self.postMessage({
      kind: "loader",
      cmene: "bootingDb",
    });

    //TODO: restore?
    // await sql(`select w from valsi where bangu='en'`)
    // self.postMessage({
    //   kind: "loader",
    //   cmene: "loaded",
    // });
  }

  self.postMessage({
    kind: "loader",
    cmene: "startLanguageDirectionUpdate",
    completedRows: 1,
    totalRows: 3,
    bangu: "en-embeddings",
  });
  log("loading embeddings");
  //embeddings
  const response = await getOrFetchResource(`/data/embeddings-en.json.bin`);
  // const response = await fetch(`/data/embeddings-en.json.bin?sisku=${new Date().getTime()}`);

  wordEmbeddings = await loadModel(response as EmbeddingsFile);
  self.postMessage({
    kind: "loader",
    cmene: "startLanguageDirectionUpdate",
    completedRows: 3,
    totalRows: 3,
    bangu: "en-embeddings",
    banguRaw: "en-embeddings",
  });
  log("processed embeddings");
  const result = await SimpleTextModel.create({
    id: "mini-lm-v2-quant",
    title: "Quantized mini model for sentence embeddings",
    description: "",
    memEstimateMB: 100,
    type: ModelType.FeatureExtraction,
    sizeMB: 15,
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "/data/mini-lm-v2-quant.brotli",
      ],
    ]),
    outputNames: new Map<string, string>([["encoder", "last_hidden_state"]]),
    tokenizerPath:
      "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/tokenizer.json",
    tokenizerParams: {
      bosTokenID: 0,
      eosTokenID: 1,
      padTokenID: 0,
    },
    tags: ["feature-extraction", "t5"],
    referenceURL:
      "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2",
  });
  log(
    await (result.model as FeatureExtractionModel).process([
      "I eat apple",
      "I consume fruit",
    ])
  );
}

let cacheObj: Cache;

async function getCacheStore(): Promise<Cache> {
  if (!cacheObj) cacheObj = await caches.open("sutysisku");

  return cacheObj;
}

async function getOrFetchResource(url: string) {
  const match = await (await getCacheStore()).match(url);
  if (match) return match.json();
  const response = await fetch(url);
  if (response.ok) {
    const blob = await response.arrayBuffer();
    log("loaded embeddings");

    const decompressedData = new TextDecoder().decode(await decompress(Buffer.from(blob)));
    log("decompressed embeddings");
    const newResponse = new Response(decompressedData);
    cacheObj.put(url, newResponse);
    return JSON.parse(decompressedData);
  }
  return {};
}

async function runMigrations() {
  log("sql migrations");
  await sql(
    `CREATE TABLE IF NOT EXISTS valsi (d text,n text,w text,r text,bangu text,s text,t text,g text,cache text,b text,v text,z text);`
  );
  await sql(
    `CREATE TABLE IF NOT EXISTS langs_ready (bangu TEXT, timestamp TEXT)`
  );
  await sql(`CREATE TABLE IF NOT EXISTS tejufra (bangu TEXT, jufra TEXT)`);
  await sql(`CREATE INDEX if not exists idx_valsi_cache ON valsi (cache);`);
  await sql(`CREATE INDEX if not exists idx_valsi_w ON valsi (w);`);
  await sql(`CREATE INDEX if not exists idx_valsi_w_bangu ON valsi (w,bangu);`);
  await sql(`CREATE INDEX if not exists idx_valsi_bangu ON valsi (bangu);`);
  await sql(`CREATE INDEX if not exists idx_valsi_s_bangu ON valsi (s,b);`);
}

const convertToObject = (data: {
  columns: string[];
  rows: SQLiteCompatibleType[][];
}) => {
  return data.rows.map((row) => {
    return row.reduce((acc: Dict, value, index: number) => {
      acc[data.columns[index]] = value;
      return acc;
    }, {});
  });
};

function prepareWrapper() {
  // Helper function to execute the query.
  async function execute(sql: string, bindings: any) {
    const results = [];
    for await (const stmt of sqlite3.statements(db, sql)) {
      sqlite3.reset(stmt);
      if (bindings) sqlite3.bind_collection(stmt, bindings);
      const rows = [];
      while ((await sqlite3.step(stmt)) === SQLite.SQLITE_ROW) {
        const row = sqlite3.row(stmt);
        rows.push(row);
      }

      const columns = sqlite3.column_names(stmt);
      if (columns.length) {
        results.push(...convertToObject({ columns, rows }));
      }
    }
    return results;
  }

  return async function (sql: string | string[], ...values: any[]) {
    if (Array.isArray(sql)) {
      // Tag function:
      const results = [];
      for (const i in sql) results.push(...(await execute(sql[i], values[i])));
      return results;
    } else {
      // Ordinary function:
      return execute(sql, values[0]);
    }
  };
}

function prettifySqlQuery(query: string) {
  return query.replace(/[\n\t]/g, " ");
}

async function runQuery(sqlQuery: string, params = {}) {
  const start = new Date().getTime();
  const rows = await sql(sqlQuery, params);
  if (production !== "production")
    log({
      startedAt: start,
      endedAt: new Date().getTime(),
      duration: new Date().getTime() - start,
      sqlQuery: prettifySqlQuery(sqlQuery),
      params,
      rows,
    });

  return rows.map((row) => {
    if (row.r) row.r = JSON.parse(row.r);
    if ((row.t || "").indexOf("{") === 0) row.t = JSON.parse(row.t);
    for (let i of ["s", "b", "z", "cache", "v"]) {
      if ((row[i] || "").indexOf("[") === 0) row[i] = JSON.parse(row[i]);
    }
    if (row.d) {
      try {
        const json = JSON.parse(row.d);
        if (Object.keys(json).length > 0) row.d = json;
      } catch (error) {}
    }
    return row;
  });
}

const supportedLangs: { [key: string]: any } = {
  en: { p: "selsku_lanci_eng" },
  muplis: {},
  sutysisku: { bangu: "en", priority: 11 },
  "en-pixra": {
    p: "cukta",
    noRafsi: true,
    searchPriority: 10,
    priority: 10,
    simpleCache: true,
  },
  "en-ll": {
    p: "cukta",
    noRafsi: true,
    searchPriority: 9,
    priority: 9,
  },
  "en-cll": { p: "cukta", noRafsi: true, searchPriority: 8, priority: 8 },
  jbo: { p: "lanci_jbo", searchPriority: 7 },
  ru: { p: "selsku_lanci_rus" },
  eo: { p: "lanci_epo" },
  es: { p: "selsku_lanci_spa" },
  "fr-facile": { p: "selsku_lanci_fra" },
  ja: { p: "selsku_lanci_jpn" },
  zh: { p: "selsku_lanci_zho" },
  loglan: { p: "loglan" },
};

function arrSupportedLangs() {
  return Object.keys(supportedLangs).sort(
    (a, b) => supportedLangs[b].priority - supportedLangs[a].priority
  );
}

const sufficientLangs = (searching: Dict) =>
  [
    searching ? searching.bangu : null,
    "en",
    "en-cll",
    "en-ll",
    "en-pixra",
    "muplis",
    "jbo",
    "sutysisku",
  ].filter(Boolean);

let sesisku_bangu: string | null;

const fancu = {
  sanji_letejufra: async ({ bangu }: { bangu: string }, cb: any) => {
    aQueue.enqueue({
      action: async () => {
        let tef1 = {},
          tef2 = {};
        if (bangu && bangu !== "en") {
          const result = await runQuery(
            `SELECT jufra FROM tejufra where bangu=$bangu`,
            {
              $bangu: bangu,
            }
          );
          try {
            tef1 = JSON.parse(result[0].jufra);
          } catch (error) {}
        }
        const result = await runQuery(
          `SELECT jufra FROM tejufra where bangu='en'`
        );
        try {
          tef2 = JSON.parse(result[0].jufra);
        } catch (error) {}
        cb({ ...tef2, ...tef1 });
      },
    });
  },
  cnino_bangu: ({ bangu }: { bangu: string }) => {
    sesisku_bangu = bangu;
  },
  // runQuery: (
  //   { query, params = {} }: { query: string; params: any },
  //   cb: any
  // ) => {
  //   runQuery(query, params).then((rows) => cb(rows));
  // },
  getNeighbors: ({ query }: { query: string }, cb: any) => {
    getNeighbors(query).then((rows) => cb(rows));
  },
  ningau_lerosorcu: async (searching: Searching, cb: any) => {
    fancu.ningau_lesorcu(searching, cb, true);
  },
  ningau_lesorcu: async (searching: Searching, cb: any, forceAll: boolean) => {
    aQueue.enqueue({
      action: async () => {
        await jufra({ bapli: true });
        let langsToUpdate = [];
        let response;
        try {
          response = await fetch(
            `${process.env.DUMPS_URL_ROOT}/versio.json?sisku=${new Date().getTime()}`
          );
        } catch (error) {
          log(
            {
              event: "can't fetch new version, skipping database updates",
            },
            "error"
          );
          return;
        }

        let jsonVersio: Dict = {};
        if (response?.ok) {
          jsonVersio = await response.json();

          for (const lang of sufficientLangs(searching)) {
            const langHash = jsonVersio[lang];
            if (!langHash) continue;
            let count = 0;
            if (!forceAll) {
              count =
                (
                  await sql(
                    `SELECT count(*) as klani FROM langs_ready where bangu=? and timestamp=?`,
                    [lang, langHash]
                  )
                )?.[0]?.klani ?? 0;
            }
            if (count === 0) langsToUpdate.push(lang);
          }

          if (langsToUpdate.length > 0) {
            for (const lang of arrSupportedLangs())
              if (langsToUpdate.includes(supportedLangs[lang].bangu))
                langsToUpdate.push(lang);

            const langsUpdated = await cnino_sorcu(
              cb,
              langsToUpdate,
              searching,
              jsonVersio
            );
            log({
              event: "Database updated",
              "No. of languages updated": langsUpdated.length,
            });
          }
        }

        self.postMessage({
          kind: "loader",
          cmene: "loaded",
        });
      },
    });
  },
  ningau_lepasorcu: async (searching: Searching, cb: any) => {
    aQueue.enqueue({
      action: async () => {
        const lang = searching.bangu || "en";
        let json: Dict = {};
        const response = await fetch(
          `${process.env.DUMPS_URL_ROOT}/versio.json?sisku=${new Date().getTime()}`
        );
        if (response.ok) {
          json = await response.json();
        }
        const count =
          (
            await sql(
              `SELECT count(*) as klani FROM langs_ready where bangu=$bangu and timestamp=$timestamp`,
              { $bangu: lang, $timestamp: json[lang] }
            )
          )?.[0]?.klani ?? 0;

        if (count > 0) return;
        await cnino_sorcu(cb, [lang], searching, json);
        self.postMessage({
          kind: "loader",
          cmene: "loaded",
        });
      },
    });
  },
};

async function jufra({ bapli }: { bapli: boolean }) {
  aQueue.enqueue({
    action: async () => {
      if (bapli) await sql(`delete from tejufra`);
      //tejufra
      const nitejufra = (
        await sql(`SELECT count(jufra) as klani FROM tejufra`)
      )?.[0]?.klani;
      if (nitejufra === 0 || bapli) {
        //todo: transaction
        for (const key of Object.keys(jsonTeJufra)) {
          await sql(`insert into tejufra (bangu, jufra) values(?,?)`, [
            key,
            JSON.stringify((jsonTeJufra as any)[key]),
          ]);
        }
        log({ event: "Locales fully updated" });
      }
    },
  });
}
function chunkArray(myArray: any[], chunk_size: number, lang: string) {
  let index = 0;
  const arrayLength = myArray.length;
  let tempArray = [];

  for (index = 0; index < arrayLength; index += chunk_size) {
    const myChunk = myArray.slice(index, index + chunk_size);
    tempArray.push(myChunk.map((def) => addCache(def, lang)));
  }

  return tempArray;
}

function addCache(def: Dict, tegerna: string) {
  const cacheSeparator = RegExp(
    /[ \u2000-\u206F\u2E00-\u2E7F\\!"#$%&()*+,\-.\/:<=>?@\[\]^`{|}~：？。，《》「」『』；_－／（）々仝ヽヾゝゞ〃〱〲〳〵〴〵「」『』（）〔〕［］｛｝｟｠〈〉《》【】〖〗〘〙〚〛ッー゛゜。、・゠＝〆〜…‥ヶ•◦﹅﹆※＊〽〓♪♫♬♩〇〒〶〠〄再⃝ⓍⓁⓎ]/,
    "g"
  );
  if (def.g) {
    if (!Array.isArray(def.g)) def.g = [def.g];
    def.g = def.g
      .map((i: string) =>
        i.replace(cacheSeparator, " ").trim().replace(/ {2,}/g, " ")
      )
      .join(";");
  }

  if (supportedLangs[tegerna].simpleCache)
    return { bangu: tegerna, ...def, cache: def.w };
  if (def.cache) {
    if (def.w) def.cache = def.cache.join(";");
    return { bangu: tegerna, ...def };
  }
  let cache;

  cache = [def.w, def.s, def.g, def.d, def.n]
    .concat(def.r || [])
    .filter(Boolean)
    .map((i) => i.replace(/\$[a-z]+_\{.*?\}\$/g, ""))
    .join(";")
    .toLowerCase();
  const cache2 = cache.replace(cacheSeparator, ";").split(";");
  cache = cache.replace(
    /[ \u2000-\u206F\u2E00-\u2E7F\\!"#$%&()*+,\-.\/:<=>?@\[\]^`{|}~：？。，《》「」『』；_－（）]/g,
    ";"
  );
  cache = `${cache};${cache.replace(/h/g, "'")}`.split(";");

  if (def.z) cache.push(def.z);

  cache = [...new Set(cache.concat(cache2))].filter(Boolean).join(";");
  return { bangu: tegerna, ...def, cache };
}

const getRec2 = () => ({
  $d: "",
  $n: "",
  $w: "",
  $r: "",
  $bangu: "",
  $s: "",
  $t: "",
  $g: "",
  $cache: "",
  $b: "",
  $z: "",
  $v: "",
});
function prepareFields(rec: Dict) {
  //TODO merged with addcache
  let rec2: Dict = getRec2();
  Object.keys(rec).map((key) => {
    const key2 = `$${key}`;
    const val = rec[key];
    if (key === "z" && !val) {
      rec2[key2] = [""];
    } else if (typeof val == "object") {
      rec2[key2] = JSON.stringify(val || "");
    } else {
      rec2[key2] = val || "";
    }
  });
  return rec2;
}
async function cnino_sorcu(
  cb: any,
  langsToUpdate: string[],
  searching: Searching,
  jsonVersio: Dict
) {
  langsToUpdate = [...new Set(langsToUpdate)];
  await jufra({ bapli: true });
  fancu.sanji_letejufra({ bangu: searching.bangu }, (results: any) => {
    self.postMessage({
      kind: "fancu",
      cmene: "sanji_letejufra",
      bangu: searching.bangu,
      results,
    });
  });

  //for each lang download dump
  let langs = langsToUpdate || sufficientLangs(searching);
  langs = langs
    .filter((lang) => lang == searching.bangu)
    .concat(langs.filter((lang) => lang != searching.bangu));
  log({
    event: "Preparing imports into the database",
    languages: langsToUpdate,
  });

  while (langs.length > 0) {
    if (sesisku_bangu) {
      const savedLang_next = (
        await sql(`SELECT count(*) as klani FROM langs_ready where bangu=?`, [
          sesisku_bangu,
        ])
      )?.[0]?.klani;
      if (!savedLang_next) langs = [...new Set([sesisku_bangu].concat(langs))];
      sesisku_bangu = null;
    }
    const lang = langs[0];
    langs = langs.slice(1);

    let completedRows = 0;
    log({ event: "Updating the language", language: lang });

    self.postMessage({
      kind: "loader",
      cmene: "startLanguageDirectionUpdate",
      completedRows: 12 + (Math.random() - 0.5) * 3,
      totalRows: 100,
      bangu: lang,
    });
    const langHash = jsonVersio[lang];
    if (!langHash) continue;
    const lenLangChunks = langHash.split("-")[1] ?? blobChunkDefaultLength;

    for (let i = 0; i < lenLangChunks; i++) {
      cb(`downloading ${lang}-${i}.bin dump`);
      const url = `${process.env.DUMPS_URL_ROOT}/parsed/parsed-${lang}-${i}.bin?sisku=${new Date().getTime()}`;
      const response = await fetch(url);
      let json;
      if (response.ok) {
        const blob = await response.arrayBuffer();

        const decompressedData = new TextDecoder().decode(await decompress(Buffer.from(blob)));
        json = JSON.parse(decompressedData);

        let rows = json.data.data[0].rows;
        const totalRows = json.data.tables[0].rowCount * lenLangChunks;

        const chunkSize = 1000;
        const all_rows = rows.length;

        rows = chunkArray(rows, chunkSize, lang);
        const time = new Date().getTime();
        if (i === 0) {
          await sql(`delete from valsi where bangu=$bangu`, { $bangu: lang });
          await sql(`delete from langs_ready where bangu=$bangu`, {
            $bangu: lang,
          });
        }
        for (const toAdd of rows) {
          await sqlite3.exec(db, `BEGIN;`);
          for (let rec of toAdd) {
            await sql(
              `INSERT INTO valsi (d,n,w,r,bangu,s,t,g,cache,b,z,v) VALUES ($d,$n,$w,$r,$bangu,$s,$t,$g,$cache,$b,$z,$v)`,
              prepareFields(rec)
            );
          }
          await sqlite3.exec(db, `COMMIT;`);
          completedRows += chunkSize;
          self.postMessage({
            kind: "loader",
            cmene: "completeChunkInsertion",
            completedRows,
            totalRows,
            bangu: lang,
            banguRaw: lang,
          });
          if (lang === searching.bangu) {
            await sisku(searching);
          }
        }

        log({
          event: "Records inserted",
          language: lang,
          "speed, records/sec": (
            (all_rows * 1000) /
            (new Date().getTime() - time)
          ).toFixed(2),
        });
      } else {
        log({ event: "HTTP error", status: response.status, url }, "error");
        break;
      }
    }
    const savedLang = (
      await sql(
        `SELECT count(*) as klani FROM langs_ready where bangu=? and timestamp=?`,
        [lang, langHash]
      )
    )?.[0]?.klani;

    if (!savedLang) {
      await sql(`insert into langs_ready (bangu,timestamp) values(?,?)`, [
        lang,
        langHash,
      ]);
    }
    cb(`imported ${lang}-*.bin files at ${new Date().toISOString()}`);
    self.postMessage({
      kind: "loader",
      cmene: "completeLanguageDirectionUpdate",
      completedRows,
      totalRows: completedRows,
      bangu: lang,
      banguRaw: lang,
    });
  }
  // db.run(`pragma optimize;`)
  return langsToUpdate;
}

//sisku

let leijufra: Dict = {
  xuzganalojudri: "",
  bangudecomp: "",
  bangu: null,
};

async function getCachedDefinitions({
  query,
  bangu,
  mapti_vreji,
}: {
  query: string;
  bangu: string;
  mapti_vreji: any[];
}) {
  let result = [];
  if (mapti_vreji)
    result = mapti_vreji.filter(
      (i: Dict) =>
        i.bangu === bangu &&
        [i.w, i.d].map((_) => _.toLowerCase()).includes(query.toLowerCase())
    );
  if (result.length === 0)
    result = await runQuery(
      `SELECT d,n,w,r,bangu,s,t,g,b,z,v FROM valsi where (w=$query COLLATE NOCASE or d=$query COLLATE NOCASE) and bangu=$bangu`,
      { $bangu: bangu, $query: query.toLowerCase() }
    );
  return result;
}

const getMergedArray = (array: string[]) =>
  `(${array.map((i) => `'${i.replace(/'/g, "''")}'`).join(",")})`;

async function getNeighbors(query: string) {
  let results = await wordEmbeddings.getNearestNeighbors(query, 100);
  results = [
    ...new Set(
      results
        .filter(
          (i) =>
            RegExp(/^[a-z- ]+$/).test(i.word) &&
            i.distance !== 1 &&
            i.distance >= 0.4
        )
        .concat([{ distance: 1, word: query }])
    ),
  ];
  return { words: results.map((i) => i.word), results };
}

function arraysShareElement(array1: string[], array2: string[]) {
  return array1.filter((item) => array2.includes(item)).length;
  // return array1.some((i) => array2.includes(i));
}

async function cnano_sisku({
  query_apos,
  query,
  bangu,
  versio,
  mapti_vreji,
  multi,
  seskari,
  secupra_vreji,
  queryDecomposition,
}: any) {
  const splitQuery_apos = query_apos.split(" ").filter(Boolean);
  const arrayQuery = [
    ...new Set([...queryDecomposition, query_apos, ...splitQuery_apos]),
  ];

  let embeddings: Dict = {};
  const embeddingsMode = bangu === "en" && seskari === "cnano"; // semantic search
  if (embeddingsMode) {
    embeddings = await getNeighbors(query);
  }

  let rows: Dict[];
  if (versio === "selmaho") {
    if (bangu === "muplis") {
      rows = await runQuery(
        `SELECT d,n,w,r,bangu,s,t,g,b,z,v FROM valsi where s=$query and bangu=$bangu`,
        {
          $query: query,
          $bangu: bangu,
        }
      );
    } else {
      rows = (
        await runQuery(
          `SELECT d,n,w,r,bangu,s,t,g,b,z,v FROM valsi where s like $query and bangu=$bangu`,
          {
            $query: query + "%",
            $bangu: bangu,
          }
        )
      ).filter(
        (valsi: Dict) =>
          typeof valsi.s === "string" &&
          new RegExp(`^${query}[0-9]*[a-z]*$`).test(valsi.s)
      );
    }
  } else if (seskari === "fanva") {
    rows = await runQuery(
      `SELECT d,n,w,r,bangu,s,t,g,b,z,v FROM valsi where w=$valsi`,
      {
        $valsi: query_apos,
      }
    );
  } else {
    //normal search
    const queryNEmbeddings = arrayQuery.concat(embeddings.word);
    rows = await runQuery(
      `
		select distinct d,n,w,r,bangu,s,t,g,b,z,v,cache
		from valsi
		where ${Array(arrayQuery.length).fill(`(cache like ?)`).join(" or ")}
    `,
      arrayQuery.map((el) => `%${el}%`)
    );

    rows = rows.filter((def: Dict) => {
      const noSharedElementsInCache = arraysShareElement(
        def.cache.split(";"),
        queryNEmbeddings
      );
      if (bangu === "muplis") {
        def.noSharedElementsInCache =
          (2 * noSharedElementsInCache) / arrayQuery.length;
      } else {
        def.noSharedElementsInCache =
          noSharedElementsInCache / splitQuery_apos.length;
      }
      if (def.w === query_apos && def.bangu === "jbo") return true;
      if (def.bangu === bangu && noSharedElementsInCache) return true;
      if (
        ((def.w.includes(query_apos) || def.cache.includes(query_apos)) &&
          def.bangu === bangu) ||
        def.bangu.includes(`${bangu}-`) ||
        def.bangu === "en-pixra"
      )
        return true;
      return false;
    });
  }

  if (queryDecomposition.length > 1 || bangu === "muplis")
    rows = rows.filter((def: Dict) => def.noSharedElementsInCache >= 1);
  rows = rows
    .map((el: Dict) => {
      const { cache, ...rest } = el;
      return rest;
    })
    .sort((def1: Dict, def2: Dict) => {
      if (def1.bangu === bangu) return -1;
      if (def2.bangu === bangu) return 1;
      if (
        supportedLangs?.[def2.bangu]?.searchPriority !==
        supportedLangs?.[def1.bangu]?.searchPriority
      )
        return (
          supportedLangs?.[def2.bangu]?.searchPriority -
          supportedLangs?.[def1.bangu]?.searchPriority
        );
      if (queryDecomposition.length > 1 || bangu === "muplis")
        return def2.noSharedElementsInCache - def1.noSharedElementsInCache;
      return 0;
    });
  mapti_vreji = mapti_vreji.slice().concat(rows);
  if (seskari === "fanva" || bangu === "muplis") {
    return { result: mapti_vreji, decomposed: false };
  }
  const { result, decomposed } = await sortThem({
    query_apos,
    query,
    bangu,
    mapti_vreji,
    seskari,
    secupra_vreji,
    embeddings: embeddings.results,
  });

  const allMatches = result;
  if (multi)
    return { result: allMatches[0], decomposed, embeddings: embeddings.words };
  if (allMatches[0].length === 0) {
    allMatches[0] = (await jmina_ro_cmima_be_lehivalsi({ query, bangu })) || [];
  }
  if (allMatches[0].length === 0 || allMatches[0][0].w !== query_apos) {
    let vlazahumei = [];

    if (!/^[A-Zh]+[0-9\*]+$/.test(query)) {
      const cachedDefinitions = await getCachedDefinitions({
        query: query_apos,
        bangu,
        mapti_vreji,
      });
      vlazahumei = julne_setca_lotcila(
        await shortget({
          valsi: query_apos,
          secupra: [],
          bangu,
          cachedDefinitions,
        })
      );
    }
    if (bangu === "muplis" || !leijufra.xuzganalojudri) {
      vlazahumei = vlazahumei.filter(
        ({ d, nasezvafahi }: Def) => !d || !nasezvafahi
      );
    }
    if (vlazahumei.length <= 1)
      return {
        result: vlazahumei.concat(allMatches[0]),
        decomposed,
        embeddings: embeddings.words,
      };
    return {
      result: allMatches[1].concat(
        [
          {
            t: leijufra.bangudecomp,
            ot: "vlaza'umei",
            w: query,
            rfs: vlazahumei,
          },
        ],
        allMatches[2]
      ),
      decomposed,
      embeddings: embeddings.words,
    };
  }
  if (allMatches[0][0].w === query_apos) {
    //full match
    const [type, parsedWord] = maklesi_levalsi(allMatches[0][0].w);
    if (type.indexOf("fu'ivla") >= 0 && parsedWord.indexOf("-") >= 0) {
      const rafsi = parsedWord.split("-")[0];
      const selrafsi = await runQuery(
        `SELECT d,n,w,r,bangu,s,t,g,b,z,v FROM valsi, json_each(valsi.r) where json_valid(valsi.r) and json_each.value=$rafsi and valsi.bangu=$bangu limit 1`,
        { $rafsi: rafsi, $bangu: bangu }
      );
      allMatches[0][0].rfs = selrafsi;
    }
  }

  return { result: allMatches[0], decomposed, embeddings: embeddings.words };
}

function sortMultiDimensional(a: Def, b: Def) {
  if (!a.d) a.d = "";
  if (!b.d) b.d = "";
  return a.d.length < b.d.length ? -1 : a.d.length > b.d.length ? 1 : 0;
}

function cmaxesParse({ tegerna, queryLanguage }: any, callback: any) {
  if (queryLanguage === "loglan")
    return callback(tegerna.split(" ").map((i: string) => ["", i]));
  try {
    let parsed = parse(tegerna.toLowerCase());
    parsed = parsed.filter((el: string[]) => el[0] !== "drata");
    return callback(parsed);
  } catch (error) {}
  return callback([]);
}

function reconcatenate(selsku: string) {
  try {
    let parsed = parse(selsku.toLowerCase());
    parsed = parsed.filter((el: string[]) => el[0] !== "drata");
    const reconcatenated = parsed.map((el: string[]) => el[1]).join(" ");
    return { parsed, reconcatenated };
  } catch (error) {}
  return { parsed: [], reconcatenated: selsku };
}

function maklesi_levalsi(selsku: string) {
  let reconcatenated = selsku;
  if (!leijufra.xuzganalojudri || selsku.search(/[^aeiouyAEIOY]'/) > -1)
    return ["", selsku];
  try {
    const { parsed: parsedString, reconcatenated } = reconcatenate(selsku);
    const oddEls = parsedString.filter(
      (_: any, index: number) => index % 2 == 1
    );
    if (oddEls.length > 0 && oddEls.every((el: string[]) => el[0] == "zei"))
      return ["zei-lujvo", reconcatenated];
    if (parsedString.length == 1) return parsedString[0];
    if (
      parsedString.length > 0 &&
      parsedString.every((el: string[]) => el[0] === "cmavo")
    )
      return ["cmavo-compound", reconcatenated];
    if (parsedString.length > 1) return ["phrase", reconcatenated];
  } catch (e) {}
  return ["", reconcatenated];
}

function ma_veljvo(tegerna: string): any[] {
  if (!leijufra.xuzganalojudri) return [];
  if (tegerna.includes(" zei "))
    return tegerna
      .split(" ")
      .map((veljvocmi) => ma_veljvo(veljvocmi))
      .flat()
      .filter(Boolean);
  let text;
  try {
    text = parse(tegerna).toString().split(",");
  } catch (err) {
    return [];
  }
  if (!["lujvo"].includes(text[0]) || text.length !== 2) return [];
  return text[1].split("-").filter(Boolean);
}

function setca_lotcila(seskicu_be_le_valsi: Def) {
  if (
    typeof seskicu_be_le_valsi.t === "string" &&
    [undefined, ""].includes(seskicu_be_le_valsi.t)
  )
    seskicu_be_le_valsi.t =
      seskicu_be_le_valsi.bangu !== "muplis" && leijufra.xuzganalojudri
        ? maklesi_levalsi(seskicu_be_le_valsi.w)[0]
        : "";
  return seskicu_be_le_valsi;
}

function decompose(selsku: string) {
  return leijufra.xuzganalojudri
    ? reconcatenate(selsku)
        .reconcatenated.replace(/ zei /g, "_zei_")
        .split(" ")
        .map((b: string) => b.replace(/_zei_/g, " zei ").replace(/-/g, ""))
    : selsku.split(" ");
}

function julne_setca_lotcila(porsi_fi_le_seskicu_be_le_valsi: any[]) {
  return porsi_fi_le_seskicu_be_le_valsi.reduce(
    (cnino_porsi, seskicu_be_le_valsi) => {
      if (seskicu_be_le_valsi)
        cnino_porsi.push(setca_lotcila(seskicu_be_le_valsi));
      return cnino_porsi;
    },
    []
  );
}

async function sohivalsi({ decomposed, bangu, mapti_vreji }: any) {
  let secupra = [];
  for (let valsi_index = 0; valsi_index < decomposed.length; valsi_index++) {
    for (
      let valsi2_index = decomposed.length - 1;
      valsi2_index >= valsi_index;
      valsi2_index--
    ) {
      const o = decomposed.slice(valsi_index, valsi2_index + 1).join(" ");
      const cachedDefinitions = await getCachedDefinitions({
        bangu,
        mapti_vreji,
        query: o,
      });
      secupra = await shortget({ valsi: o, secupra, bangu, cachedDefinitions });
    }
  }
  return secupra;
}

async function jmina_ro_cmima_be_lehivalsi({ query, def, bangu }: any) {
  let porsi_fi_le_seskicu_be_le_veljvocmi = [];
  if (def?.v?.length > 1) {
    for (const veljvocmi of def.v) {
      const se_skicu_le_veljvocmi = (
        await runQuery(
          `SELECT d,n,w,r,bangu,s,t,g,b,z,v FROM valsi where w=$veljvocmi and bangu=$bangu limit 1`,
          { $bangu: bangu, $veljvocmi: veljvocmi }
        )
      )[0];

      if (se_skicu_le_veljvocmi) {
        porsi_fi_le_seskicu_be_le_veljvocmi.push(se_skicu_le_veljvocmi);
      }
    }
  } else {
    let porsi_le_veljvocmi = ma_veljvo(query);
    if (porsi_le_veljvocmi.length === 0) return def ? [def] : [];
    for (const veljvocmi of porsi_le_veljvocmi) {
      const se_skicu_le_veljvocmi = (
        await runQuery(
          `SELECT d,n,w,r,bangu,s,t,g,b,z,v FROM valsi, json_each(valsi.r) where json_valid(valsi.r) and json_each.value=? and valsi.bangu=? limit 1`,
          [veljvocmi, bangu]
        )
      )[0];
      if (se_skicu_le_veljvocmi)
        porsi_fi_le_seskicu_be_le_veljvocmi.push(se_skicu_le_veljvocmi);
    }
  }
  porsi_fi_le_seskicu_be_le_veljvocmi = julne_setca_lotcila(
    porsi_fi_le_seskicu_be_le_veljvocmi
  ); // .filter(function(i){return !i.nasezvafahi});
  return [
    {
      t:
        porsi_fi_le_seskicu_be_le_veljvocmi.length > 0
          ? "lujvo"
          : maklesi_levalsi(query)[0],
      w: query,
      nasezvafahi: true,
      rfs: porsi_fi_le_seskicu_be_le_veljvocmi,
    },
  ];
}

async function shortget({
  valsi,
  secupra,
  nasisku_filohipagbu,
  bangu,
  cachedDefinitions,
}: any) {
  const definitions = cachedDefinitions;
  if (definitions.length > 0) return secupra.concat(definitions);
  if (!nasisku_filohipagbu) {
    if (valsi.replace(/ zei /g, "-zei-").split(" ").length === 1) {
      const valsi_giheklesi = maklesi_levalsi(valsi);
      if (
        valsi_giheklesi[0] === "cmavo-compound" ||
        valsi_giheklesi[0] === "zei-lujvo"
      ) {
        const words = valsi_giheklesi[1].split(" ");
        for (const word of words) {
          secupra = await shortget({
            valsi: word,
            secupra,
            nasisku_filohipagbu: true,
            bangu,
            cachedDefinitions,
          });
        }
      } else if (valsi_giheklesi[0] !== "") {
        for (const word of valsi_giheklesi.filter(
          (_: any, index: number) => index % 2 !== 0
        )) {
          secupra = await shortget({
            valsi: word.replace(/-/g, ""),
            secupra,
            nasisku_filohipagbu: true,
            bangu,
            cachedDefinitions,
          });
        }
      }
    } else {
      //several words
      let vuhilevelujvo = ma_veljvo(valsi);
      if (vuhilevelujvo[0] === "@") {
        vuhilevelujvo = vuhilevelujvo.slice(1);

        for (let j = 0; j < vuhilevelujvo.length; j++) {
          const valsi = vuhilevelujvo[j];
          const le_se_skicu_valsi = (
            await runQuery(
              `SELECT d,n,w,r,bangu,s,t,g,b,z,v FROM valsi where w=$valsi and bangu=$bangu limit 1`,
              { $valsi: valsi, $bangu: bangu }
            )
          )[0];

          if (le_se_skicu_valsi) {
            vuhilevelujvo[j] = le_se_skicu_valsi;
            vuhilevelujvo[j]["w"] = valsi;
          }
        }
        secupra.concat(vuhilevelujvo);
      } else if (vuhilevelujvo) {
        for (const r of vuhilevelujvo) {
          const foundRafsi = (
            await runQuery(
              `SELECT value FROM valsi, json_each(valsi.r) where json_valid(valsi.r) and json_each.value=$r and valsi.bangu=bangu limit 1`,
              { $r: r, $bangu: bangu }
            )
          )[0];
          if (foundRafsi) secupra.push(foundRafsi);
        }
      }
    }
  } else {
    let ff = await jmina_ro_cmima_be_lehivalsi({ query: valsi, bangu });
    ff = ff[0] && ff[0].rfs ? ff[0].rfs : undefined;
    secupra = secupra.concat([{ t: "", nasezvafahi: true, w: valsi, rfs: ff }]);
  }
  return secupra;
}

function isCoreWord(def: Def) {
  return typeof def.t === "string" && ["gismu", "cmavo"].includes(def.t ?? "");
}

function defaultPriorityGroups() {
  return {
    wordFullMatch: [],
    wordFullMatchJbo: [],
    wordFullMatchAdditional: [],
    zMatch: [],
    zSemMatch: [],
    glossMatch: [],
    glossSemMatch: [],
    rafsiMatch: [],
    wordSemiMatch: [],
    selmahoFullMatch: [],
    selmahoSemiMatch: [],
    oneOfSelmahosFullMatch: [],
    oneOfSelmahosSemiMatch: [],
    querySemiMatch: [],
    defGoodMatch: [],
    defInsideMatch: [],
    notesInsideMatch: [],
    otherMatch: [],
  } as { [key: string]: Def[] };
}

function includes(arrOuter: any[], inner: string | any[], fn?: any) {
  arrOuter = [arrOuter].flat();
  if (fn) return arrOuter.some((elemOuter) => fn(elemOuter, inner));
  inner = [inner].flat();
  return arrOuter.some((i) => inner.includes(i));
}

function semFilter(arrEmbeddingsObject: any[], arrGloss: string | any[]) {
  return arrEmbeddingsObject.filter((i) => arrGloss.includes(i.word));
}

const nonLetter =
  '[ \u2000-\u206F\u2E00-\u2E7F\\!"#$%&()*+,\\-.\\/:<=>?@\\[\\]^`{|}~：？。，《》「」『』；_－／（）々仝ヽヾゝゞ〃〱〲〳〵〴〵「」『』（）〔〕［］｛｝｟｠〈〉《》【】〖〗〘〙〚〛。、・゠＝〜…‥•◦﹅﹆※＊〽〓♪♫♬♩〇〒〶〠〄再⃝ⓍⓁⓎ]';

async function sortThem({
  mapti_vreji,
  query,
  bangu,
  query_apos,
  seskari,
  secupra_vreji,
  embeddings,
}: any) {
  let decomposed = false;
  let searchPriorityGroups = defaultPriorityGroups();
  const arrCombinedQuery = [...new Set([query, query_apos])];
  for (let el of mapti_vreji) {
    const def = setca_lotcila(el); // TODO: optimize for phrases
    if (!def) continue;
    const semMatch = !def.z || !embeddings ? [] : semFilter(embeddings, def.z);
    const semMatchGlosses =
      !def.g || !embeddings ? [] : semFilter(embeddings, def.g.split(";"));
    if (arrCombinedQuery.flat().includes(def.w)) {
      if (!supportedLangs[def.bangu].noRafsi) {
        def.rfs = JSON.parse(
          JSON.stringify(
            julne_setca_lotcila(
              await sohivalsi({
                decomposed: decompose(def.w),
                bangu,
                mapti_vreji,
              })
            )
          )
        ).filter(({ w }: { w: string }) => w !== def.w);
        decomposed = true;
        if (def.rfs?.length === 0) {
          def.rfs = (
            await jmina_ro_cmima_be_lehivalsi({
              query: def.w,
              def: def,
              bangu,
            })
          )[0].rfs;
        }
      }
      if (def.bangu == bangu) searchPriorityGroups.wordFullMatch.push(def);
      else if (def.bangu === "jbo")
        searchPriorityGroups.wordFullMatchJbo.push(def);
      else searchPriorityGroups.wordFullMatchAdditional.push(def);
    } else if (semMatch.length > 0) {
      const match = {
        ...def,
        // sem: semMatch.map((i) => i.word),
        semMaxDistance: semMatch.sort(
          (left, right) => right.distance - left.distance
        )[0].distance,
      };
      searchPriorityGroups[
        match.semMaxDistance === 1 ? "zMatch" : "zSemMatch"
      ].push(match);
    } else if (semMatchGlosses.length > 0) {
      const match = {
        ...def,
        // sem: semMatchGlosses.map((i) => i.word),
        semMaxDistance: semMatchGlosses.sort(
          (left, right) => right.distance - left.distance
        )[0].distance,
      };
      searchPriorityGroups[
        match.semMaxDistance === 1 ? "glossMatch" : "glossSemMatch"
      ].push(match);
    } else if (def.g && includes(def.g.split(";"), query)) {
      searchPriorityGroups.glossMatch.push(def);
    } else if (def.r && includes(def.r, query)) {
      searchPriorityGroups.rafsiMatch.push(def);
    } else if (
      includes(
        arrCombinedQuery,
        def.w,
        (q_word: string, def_w: string) =>
          def_w.search(`(^| )(${q_word})( |$)`) >= 0
      )
    ) {
      searchPriorityGroups.wordSemiMatch.push(def);
    } else if (typeof def.s === "string" && includes(def.s.split(" "), query)) {
      searchPriorityGroups.selmahoFullMatch.push(def);
    } else if (
      typeof def.s === "string" &&
      includes(
        query,
        def.s,
        (q_el: any, def_s: string | any[]) => def_s.indexOf(q_el) === 0
      )
    ) {
      searchPriorityGroups.selmahoSemiMatch.push(def);
    } else if (Array.isArray(def.s) && includes(def.s, query)) {
      searchPriorityGroups.oneOfSelmahosFullMatch.push(def);
    } else if (
      Array.isArray(def.s) &&
      includes(query, def.s, (q_el: any, defs_s: any[]) =>
        defs_s.some((i) => i.indexOf(q_el) === 0)
      )
    ) {
      searchPriorityGroups.oneOfSelmahosSemiMatch.push(def);
    } else if (
      includes(
        arrCombinedQuery,
        [def.g, def.w].flat(),
        (q_el: any, defs: any[]) =>
          defs.some(
            (i) => i.search(RegExp(`(${nonLetter}(${q_el})${nonLetter})`)) >= 0
          )
      )
    ) {
      searchPriorityGroups.querySemiMatch.push(def);
      //TODO: add semantic search glosses
    } else if (
      typeof def.d === "string" &&
      includes(
        query,
        def.d,
        (q_el: any, def_d: string) =>
          def_d.toLowerCase().search(RegExp(`^${q_el}${nonLetter}`)) >= 0
      )
    ) {
      searchPriorityGroups.defGoodMatch.push(def);
    } else if (
      typeof def.d === "string" &&
      includes(
        query,
        def.d,
        (q_el: any, def_d: string) =>
          def_d
            .toLowerCase()
            .search(RegExp(`${nonLetter}${q_el}${nonLetter}`)) >= 0
      )
    ) {
      searchPriorityGroups.defInsideMatch.push(def);
    } else if (
      typeof def.n !== "undefined" &&
      includes(
        query,
        def.n,
        (q_el: any, def_n: string) =>
          def_n
            .toLowerCase()
            .search(RegExp(`${nonLetter}${q_el}${nonLetter}`)) >= 0
      )
    ) {
      searchPriorityGroups.notesInsideMatch.push(def);
    } else {
      searchPriorityGroups.otherMatch.push(def);
    }
  }
  /*
	  now sort by semantic props distance
	  */
  searchPriorityGroups.zSemMatch.sort(
    (left, right) => (right.semMaxDistance || 0) - (left.semMaxDistance || 0)
  );
  searchPriorityGroups.glossSemMatch.sort(
    (left, right) => (right.semMaxDistance || 0) - (left.semMaxDistance || 0)
  );

  let firstMatches;
  let secondMatches: Def[];
  if (seskari === "catni") {
    const searchPriorityGroups_unofficial_words = defaultPriorityGroups();
    const searchPriorityGroups_official_words = defaultPriorityGroups();
    Object.keys(searchPriorityGroups).forEach((group) => {
      searchPriorityGroups[group].forEach((def) => {
        if (isCoreWord(def))
          searchPriorityGroups_official_words[group].push(def);
        else searchPriorityGroups_unofficial_words[group].push(def);
      });
    });
    firstMatches = secupra_vreji.concat(
      searchPriorityGroups.wordFullMatch,
      searchPriorityGroups.wordFullMatchJbo,
      searchPriorityGroups.wordFullMatchAdditional
    );
    secondMatches = ([] as Def[]).concat(
      searchPriorityGroups_official_words.zMatch,
      searchPriorityGroups_official_words.glossMatch,
      searchPriorityGroups_official_words.selmahoFullMatch,
      searchPriorityGroups.oneOfSelmahosFullMatch,
      searchPriorityGroups.rafsiMatch,
      searchPriorityGroups_official_words.querySemiMatch,
      searchPriorityGroups_official_words.wordSemiMatch,
      searchPriorityGroups_official_words.zSemMatch,
      searchPriorityGroups_official_words.glossSemMatch,
      searchPriorityGroups_official_words.defGoodMatch,
      searchPriorityGroups_official_words.defInsideMatch,
      searchPriorityGroups_official_words.notesInsideMatch,
      searchPriorityGroups_unofficial_words.zMatch,
      searchPriorityGroups_unofficial_words.glossMatch,
      searchPriorityGroups_unofficial_words.selmahoFullMatch,
      searchPriorityGroups_unofficial_words.querySemiMatch,
      searchPriorityGroups_unofficial_words.wordSemiMatch,
      searchPriorityGroups_unofficial_words.zSemMatch,
      searchPriorityGroups_unofficial_words.glossSemMatch,
      searchPriorityGroups_unofficial_words.defGoodMatch,
      searchPriorityGroups_unofficial_words.defInsideMatch,
      searchPriorityGroups_unofficial_words.notesInsideMatch,
      searchPriorityGroups_official_words.otherMatch,
      searchPriorityGroups_unofficial_words.otherMatch
    );
  } else if (seskari === "cnano") {
    firstMatches = secupra_vreji.concat(
      searchPriorityGroups.wordFullMatch,
      searchPriorityGroups.wordFullMatchJbo,
      searchPriorityGroups.zMatch,
      searchPriorityGroups.glossMatch,
      searchPriorityGroups.wordFullMatchAdditional
    );
    secondMatches = ([] as Def[]).concat(
      searchPriorityGroups.selmahoFullMatch,
      searchPriorityGroups.oneOfSelmahosFullMatch,
      searchPriorityGroups.rafsiMatch,
      searchPriorityGroups.querySemiMatch,
      searchPriorityGroups.wordSemiMatch,
      searchPriorityGroups.zSemMatch,
      searchPriorityGroups.glossSemMatch,
      searchPriorityGroups.defGoodMatch,
      searchPriorityGroups.defInsideMatch,
      searchPriorityGroups.notesInsideMatch,
      searchPriorityGroups.otherMatch
    );
  } else {
    firstMatches = secupra_vreji.concat(
      searchPriorityGroups.wordFullMatch,
      searchPriorityGroups.wordFullMatchJbo,
      searchPriorityGroups.zMatch,
      searchPriorityGroups.glossMatch,
      searchPriorityGroups.wordFullMatchAdditional
    );
    secondMatches = ([] as Def[]).concat(
      searchPriorityGroups.selmahoFullMatch,
      searchPriorityGroups.oneOfSelmahosFullMatch,
      searchPriorityGroups.rafsiMatch,
      searchPriorityGroups.defGoodMatch,
      searchPriorityGroups.defInsideMatch,
      searchPriorityGroups.notesInsideMatch,
      searchPriorityGroups.wordSemiMatch,
      searchPriorityGroups.querySemiMatch,
      searchPriorityGroups.otherMatch
    );
  }
  return {
    result: [firstMatches.concat(secondMatches), firstMatches, secondMatches],
    decomposed,
  };
}

async function sisku(searching: Searching) {
  log("sisku");
  let { query, seskari, bangu, versio } = searching;
  query = query.trim();
  //connect and do selects
  if (query.length === 0) return;
  let secupra_vreji: { results: Def[]; embeddings: any[] } = {
    results: [],
    embeddings: [],
  };
  const query_apos =
    bangu === "loglan"
      ? query.replace(/[‘]/g, "'").toLowerCase()
      : query.replace(/[h‘]/g, "'").toLowerCase();
  const queryDecomposition = decompose(query_apos);

  if (query.indexOf("^") === 0 || query.slice(-1) === "$") {
    //regex search
    const regexpedQuery = query.toLowerCase().replace(/'/g, "''");
    // const regexpedQueryPrecise = regexpedQuery.replace(/\^/g, '').replace(/\$/g, '').replace(/^(.*)$/g, '\\b$1\\b')
    let first1000 = await runQuery(
      `SELECT d,n,w,r,bangu,s,t,g,b,z,v FROM valsi where regexp('${regexpedQuery}',w) and bangu=$bangu limit 1000`,
      { $bangu: bangu }
    );

    secupra_vreji.results = julne_setca_lotcila(
      (
        await sortThem({
          query_apos,
          query,
          bangu,
          mapti_vreji: first1000,
          seskari,
          secupra_vreji: [],
        })
      ).result[0]
    );
  } else if (seskari === "rimni") {
    //rimni search
    secupra_vreji.results = await ma_rimni({ query, bangu });
  } else if (bangu !== "muplis" && queryDecomposition.length > 1) {
    //normal search
    const { result, decomposed, embeddings } = await cnano_sisku({
      mapti_vreji: [],
      multi: true,
      query,
      bangu,
      query_apos,
      seskari,
      secupra_vreji: secupra_vreji.results,
      queryDecomposition,
    });
    secupra_vreji = { results: result, embeddings };
    if (!decomposed) {
      secupra_vreji.results.unshift({
        t: "bangudecomp",
        ot: "vlaza'umei",
        bangu,
        w: query,
        rfs: julne_setca_lotcila(
          await sohivalsi({ decomposed: queryDecomposition, bangu })
        ),
      });
    }
  } else {
    const { result, embeddings } = await cnano_sisku({
      mapti_vreji: [],
      multi: false,
      query,
      bangu,
      versio,
      query_apos,
      seskari,
      secupra_vreji: secupra_vreji.results,
      queryDecomposition,
    });
    secupra_vreji = { results: result, embeddings };
  }
  self.postMessage({
    kind: "searchResults",
    ...secupra_vreji,
    req: {
      bangu,
      seskari,
      versio,
      query: searching.query,
    },
  });
}

function krulermorna(t: string) {
  return `.${t
    .replace(/\./g, "")
    .replace(/^/, ".")
    .replace(/h/g, "'")
    .toLowerCase()
    .replace(/([aeiouy\.])u([aeiouy])/g, "$1w$2")
    .replace(/([aeiouy\.])i([aeiouy])/g, "$1ɩ$2")
    .replace(/au/g, "ḁ")
    .replace(/ai/g, "ą")
    .replace(/ei/g, "ę")
    .replace(/oi/g, "ǫ")
    .replace(/\./g, "")}`;
}

async function ma_rimni({ query, bangu }: Searching): Promise<Def[]> {
  if (query.length === 0) return [];
  const rimni = [[], [], [], [], [], [], [], [], []] as Def[][];
  let query_apos: string;
  let queryF: string[];
  let queryR: string[];
  function cupra_lo_porsi(a: Dict[]) {
    for (let i = 0; i < a.length; i++) {
      const def = setca_lotcila(a[i] as Def); // TODO: optimize for phrases
      if (!def) continue;
      const docw = krulermorna(def.w)
        .replace(/([aeiouḁąęǫy])/g, "$1-")
        .split("-")
        .slice(-3);
      if (queryR && docw[0].slice(-1) !== queryR[0].slice(-1)) continue;
      const right = docw[1].slice(-1);
      const reversal =
        docw[1].slice(-3, -1) ===
        queryF[1].slice(-3, -1).split("").reverse().join("");
      const left = queryF[1].slice(-1);
      let sli = false;
      if (
        (left === "a" && right.search("[eao]") >= 0) ||
        (left === "e" && right.search("[iea]") >= 0) ||
        (left === "i" && right.search("[ie]") >= 0) ||
        (left === "o" && right.search("[aou]") >= 0) ||
        (left === "u" && right.search("[aou]") >= 0)
      ) {
        sli = true;
      }
      if (krulermorna(def.w) === query) {
        rimni[0].push(def);
        continue;
      } else if (docw[2] || "" === queryR[2] || "") {
        // if (queryR[2])
        if (
          (docw[0].match(queryR[0]) || []).length > 0 &&
          (docw[1].match(queryR[1]) || []).length > 0 &&
          left === right
        ) {
          rimni[1].push(def);
        } else if (
          (docw[0].match(queryR[0]) || []).length > 0 &&
          (docw[1].match(queryR[1]) || []).length > 0 &&
          sli
        ) {
          rimni[2].push(def);
        } else if (
          (docw[1].match(regexify(queryR[2] || "")) || []).length > 0 &&
          left === right
        ) {
          rimni[3].push(def);
        } else if (
          (docw[1].match(regexify(queryR[2] || "")) || []).length > 0 &&
          sli
        ) {
          rimni[4].push(def);
        } else if (
          (docw[0].match(queryR[0]) || []).length > 0 &&
          sli &&
          reversal
        ) {
          rimni[5].push(def);
        } else if (
          (docw[0].match(queryR[0]) || []).length > 0 &&
          (docw[1].match(queryR[1]) || []).length > 0
        ) {
          rimni[6].push(def);
        }
      } else if (
        queryR[1] &&
        (docw[0].match(queryR[0]) || []).length > 0 &&
        (docw[1].match(queryR[1]) || []).length > 0
      ) {
        rimni[7].push(def);
      } else {
        rimni[8].push(def);
      }
    }
    const sortArray = ({ ar }: { ar: Def[] }) => {
      if (ar.length === 0) return [];
      const gism = [];
      const expgism = [];
      const cmav = [];
      const expcmav = [];
      const drata = [];
      for (let c = 0; c < ar.length; c++) {
        if (ar[c].t === "gismu") {
          gism.push(ar[c]);
        } else if (ar[c].t === "experimental gismu") {
          expgism.push(ar[c]);
        } else if (ar[c].t === "cmavo") {
          cmav.push(ar[c]);
        } else if (ar[c].t === "experimental cmavo") {
          expcmav.push(ar[c]);
        } else {
          drata.push(ar[c]);
        }
      }
      return gism
        .sort(sortMultiDimensional)
        .concat(
          expgism.sort(sortMultiDimensional),
          cmav.sort(sortMultiDimensional),
          expcmav.sort(sortMultiDimensional),
          drata.sort(sortMultiDimensional)
        );
    };

    return rimni.reduce((list, x) => list.concat(sortArray({ ar: x })), []);
  }

  function regexify(t: string) {
    return t
      .replace(/[lmnr]/g, "[lmnr]")
      .replace(/[ɩw]/g, "[ɩw]")
      .replace(/[pb]/g, "[pb]")
      .replace(/[fv]/g, "[fv]")
      .replace(/[td]/g, "[td]")
      .replace(/[sz]/g, "[sz]")
      .replace(/[cj]/g, "[cj]")
      .replace(/[kg]/g, "[kg]")
      .replace(/x/g, "[xk]");
  }

  queryR = krulermorna(query)
    .replace(/([aeiouḁąęǫy])/g, "$1-")
    .split("-")
    .slice(-3);
  queryF = queryR.slice();
  if (queryR.length >= 2) {
    queryR[1] = queryR[1].replace(/[aeiouḁąęǫy]/, "[aeiouḁąęǫy]");
  }
  let r = /.*([aeiouḁąęǫy])/.exec(queryR[0]);
  if (r === null) return [];
  queryR[0] = r[1];
  let result: Dict[] = [];
  if (queryR.length === 2) {
    result = (
      await runQuery(
        `SELECT d,n,w,r,bangu,s,t,g,b,z,v FROM valsi where bangu=$bangu`,
        {
          $bangu: bangu,
        }
      )
    ).filter((valsi) => {
      const queryRn = krulermorna(valsi.w)
        .replace(/([aeiouḁąęǫy])/g, "$1-")
        .split("-")
        .slice(-3);
      if (
        queryRn.length === 2 &&
        queryRn[0].split("").slice(-1)[0] ===
          queryR[0].split("").slice(-1)[0] &&
        setca_lotcila(valsi as Def)
      )
        return true;
      return false;
    });
  } else {
    query_apos = regexify((queryR || []).join(""));
    result = (
      await runQuery(
        `SELECT d,n,w,r,bangu,s,t,g,b,z,v FROM valsi where bangu = $bangu`,
        {
          $bangu: bangu,
        }
      )
    ).filter(({ w }) => {
      if (krulermorna(w).match(`${query_apos.toLowerCase()}$`)) return true;
      return false;
    });
  }
  return cupra_lo_porsi(result ?? []);
}

aQueue.enqueue({ action: initSQLDB });

self.postMessage({ kind: "ready" });
