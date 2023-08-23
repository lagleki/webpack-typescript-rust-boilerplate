import { component, store, h } from "../../../renderer/src";
import { rows } from "./utils/pronunciation";
import tejufra from "./worker/template/tejufra.json";

import katex from "katex";

export function get_mathjax_svg(math: string, span: HTMLElement): void {
  katex.render(math.replace(/^\$/, "").replace(/\$$/, ""), span);
}

// import io from "socket.io-client";
// import arrowCreate, { HEAD } from "arrows-svg";
import {
  // listFamymaho,
  // modes,
  supportedLangs,
  initState,
  positionScrollTopToggleBtn,
  listFamymaho,
  initStateLoading,
  initStateRAM,
  regexTeX,
  regexIntraLink,
  regexImageLink,
  regexHyperLink,
} from "./consts";
import {
  BasnaMemoized,
  Def,
  DefRenderedElement,
  Dict,
  RegexFlavours,
} from "./types";
// import { UNICODE_START, lerfu_index } from "./worker/template/utils/zlm.js";

// //global vars:
// let resultCount;
// let typingTimer; //search after timeout
// let cacheObj;
// let scrollTimer = null;
// let scrollJvoTimer = null;
// const timers = {
//   vh: null,
//   typing: null,
// };
// let socket, socket1Chat, socket1Chat_connected;

// //stores
const stateRAM = store(initStateRAM, { eventKey: "RAM" });

const storeOptions = { eventKey: "sutysisku-event", localCacheKey: "store" };
console.log("sss", {
  ...initState,
  displaying: { ...initState.displaying, ...generateStateFromUrl() },
});
let state = store(
  {
    ...initState,
    displaying: { ...initState.displaying, ...generateStateFromUrl() },
  },
  storeOptions
);
const stateLoading = store(initStateLoading, storeOptions);
const stateLeijufra = store(tejufra.en, { eventKey: storeOptions.eventKey });

// const jvoPlumbsOn = store(
//   { on: false },
//   { localCacheKey: "plumbsOn", eventKey: "plumbsOn" }
// );

// //worker
const worker = new Worker(new URL("./worker/worker", import.meta.url));
postQuery();
// worker.postMessage({
//   kind: "parse",
//   operation: "audioLink",
//   tegerna: "coi",
//   queryLanguage: "en",
// });

function postQuery() {
  console.log(
    "ppp",
    state.displaying.query,
    twoJsonsAreEqual(state.displaying, stateRAM.fetched),
    state.displaying,
    stateRAM.fetched
  );
  if (
    state.displaying.query &&
    !twoJsonsAreEqual(state.displaying, stateRAM.fetched)
  ) {
    console.log(
      "posty",
      new Date().getTime(),
      state.displaying.query,
      stateRAM.fetched.query
    );
    worker.postMessage({
      kind: "newSearch",
      ...state.displaying,
    });
  }
}

function twoJsonsAreEqual(obj1 = {}, obj2 = {}) {
  if (Object.keys(obj1).length != Object.keys(obj2).length) return false;

  for (const key in obj1)
    if (obj1[key as keyof typeof obj1] != obj2[key as keyof typeof obj1])
      return false;

  return true;
}

worker.onmessage = (ev) => {
  console.log("res", new Date().getTime());

  const { data } = ev;
  const { kind } = data;
  // if (kind == "parse" && data?.req?.operation == "audioLink")
  if (kind == "searchResults") {
    stateRAM.results = data.results;
    state.displaying = data.req;
    console.log(
      "res+state0",
      data.results.length,
      data.req.query,
      new Date().getTime()
    );
    stateRAM.fetched = structuredClone(data.req);
    state.embeddings = data.embeddings;
    stateRAM.showDesktop = false;
    console.log("res+state", new Date().getTime());
  }
};

function buildURLParams(params = {}) {
  return "#" + new URLSearchParams(params).toString();
}

function encodeUrl(uenzi: string) {
  //for bookmarkable urls
  return encodeURIComponent((uenzi || "").replace(/ /g, "_")).replace(
    /'/g,
    "%27"
  );
}

function debounce<F extends (...params: any[]) => void>(fn: F, delay: number) {
  return function (this: any, ...args: any[]) {
    clearTimeout(stateRAM.typing);
    stateRAM.typing = window.setTimeout(() => fn.apply(this, args), delay);
  } as F;
}

function setStateFromInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  state.displaying.query = input.value;
  postQuery();
}

//always show dasri thats all
component(
  "#root",
  async () => {
    console.log("render", new Date().getTime());
    return h(
      "div",
      {
        class:
          state.displaying.bangu.indexOf("muplis") >= 0
            ? "body-muplis"
            : "body-sutysisku",
      },
      h(
        "#galtu-dasri",
        {
          class: [
            "kampu-dasri",
            `${state.displaying.seskari}-dasri`,
            "noselect",
          ],
        },
        h(
          "form#se-vasru-lo-galtu-dasri",
          {
            submit: () => {
              return false;
            },
            novalidate: true,
          },
          h(
            "div",
            {
              click: () => {
                stateRAM.focused = 0;
                state.displaying.query = "";
              },
            },
            h(
              "div#title",
              {
                "aria-label": "la sutysisku",
              },
              h(
                "span#site-title",
                {
                  class: [
                    `${
                      state.displaying.query === ""
                        ? `desktop`
                        : `${state.displaying.seskari}-search`
                    }-mode-title-color`,
                  ],
                },
                h("img#logo", {
                  src: "/assets/pixra/snime.svg",
                  style:
                    state.displaying.seskari === "rimni"
                      ? { filter: "sepia(1.0)" }
                      : {},
                  height: "16",
                  width: "16",
                  alt: "logo",
                }),
                h("span", {
                  style: { color: "#fff" },
                  "data-jufra": "titlelogo-inner",
                  textContent: "la sutysisku",
                })
              )
            )
          ),
          h("div#kicne1"),
          h("input#ciska", {
            "aria-label": stateLeijufra.cnano,
            required: true,
            placeholder: stateLeijufra.bangusisku,
            spellcheck: "false",
            autocapitalize: "off",
            autocomplete: "false",
            type: "text",
            name: "focus",
            value: state.displaying.query,
            input: (event: Event) => {
              debounce(setStateFromInput, 1000)(event);
            },
          }),
          h("button#clear", {
            "aria-label": "clear",
            type: "reset",
          })
        )
      ),
      h(
        "div#loading.noselect",
        { class: stateLoading.loading ? ["d-inline-flex"] : ["d-none"] },
        h("div#bangu_loading.loading_elems", {
          innerText: stateLoading.innerText,
          class: stateLoading.hideProgress ? ["simple"] : [],
        }),
        h(
          "div#cpacu.loading_elems",
          { class: stateLoading.hideProgress ? ["d-none"] : ["d-block"] },
          h("span#kernelo_lo_cpacu", {
            style: {
              width: `${Math.min(
                100,
                Math.max(
                  10,
                  (stateLoading.completedRows * 100) / stateLoading.totalRows
                )
              )}%`,
            },
          })
        )
      ),
      h(
        "div#contentWrapper",
        {
          style: {
            paddingBottom: stateLoading.loading ? "28px" : 0,
          },
          scroll: (event: Event) => {
            const content = event.target as HTMLElement;
            const btnScrollToTop = document.getElementById(
              "scrollToTop"
            ) as HTMLElement;
            btnScrollToTop.className =
              content.scrollTop > positionScrollTopToggleBtn
                ? "d-block"
                : "d-block dizlo";
          },
        },
        h(
          "div#content.content",
          h("button#scrollToTop.d-none", {
            click: () => {
              const wrapper = document.getElementById(
                "contentWrapper"
              ) as HTMLElement;
              const content = document.getElementById("content") as HTMLElement;
              content.scrollIntoView(
                wrapper?.scrollTop > positionScrollTopToggleBtn
              );
            },
          }),
          h(
            "div.content-panel",
            h(
              "div#sidju",
              {
                class: ["sidju", "sidju-top", "ralju", "noselect"],
              },
              h(
                "div#citri.citri",
                h("span", {
                  class: "romoi_lehiseciska",
                  innerText:
                    state.citri.length > 0 ? stateLeijufra.purc || "" : null,
                }),
                ...state.citri.map(({ seskari, versio, query, bangu }) => {
                  if (seskari === "velcusku") return;
                  return h("a", {
                    class: [
                      `citrycmi`,
                      `a-${versio !== "masno" ? versio : seskari}`,
                    ],
                    attributes: {
                      href: buildURLParams({
                        seskari,
                        versio,
                        sisku: encodeUrl(query),
                        bangu,
                      }),
                    },
                    innerText: query,
                  });
                })
              ),
              h(
                "div#leitutci.xp-btn-list",
                ...["catni", "cnano", "rimni"].map((el) =>
                  h(`button#${el}`, {
                    class: [
                      "xp-btn",
                      "ralju-tutci",
                      ...(state.displaying.seskari === el
                        ? [
                            `${state.displaying.seskari}-tutci-hover`,
                            "tutci-hover",
                          ]
                        : []),
                    ],
                    textContent:
                      stateLeijufra[el as "catni" | "cnano" | "rimni"],
                  })
                )
              )
            ),
            h(
              "div#rectu",
              ...rectuResults(),
              h("div#drata", { style: { "text-align": "center" } }),
              h(
                "div#descr",
                { class: stateRAM.showDesktop ? ["d-block"] : ["d-none"] },
                h("div", {
                  class: ["term", "termouter"],
                  innerHTML: stateLeijufra.bangudesc,
                }),
                h(
                  "div",
                  { class: ["term", "termouter"] },
                  h(
                    "h1#pronunciation",
                    { style: { "font-weight": "bold" } },
                    h("span", { textContent: stateLeijufra.pron_guide })
                  ),
                  h("div", {
                    textContent:
                      ". , a b c d e f g ' i j k l m n o p r s t u v x y z",
                  }),
                  h(
                    "div#table",
                    h(
                      "table.centero",
                      ...rows.map((row) =>
                        h(
                          "tr",
                          ...row.map((col) =>
                            h(
                              "td",
                              col &&
                                h("button", {
                                  innerHTML: col,
                                  class: "bangu",
                                  click: () => {
                                    const audio: HTMLAudioElement | null =
                                      document.querySelector("#audio");
                                    if (audio) {
                                      audio.src = `/assets/sance/lerfu/${encodeURIComponent(
                                        col.replace(/.*<b>(.*?)<\/b>.*/g, "$1")
                                      )}.ogg`;
                                      audio.play();
                                    }
                                  },
                                })
                            )
                          )
                        )
                      )
                    )
                  ),
                  h("audio#audio")
                )
              ),
              await outpBlock()
            )
          )
        )
      ),
      h(
        "div#velsku.noselect",
        h(
          "a#velsku_sebenji",
          {
            href: "https://lojban.pw/articles/live_chat/",
          },
          h("img.velsku_pixra", { src: "/assets/pixra/nunsku.svg" }),
          h("span.velsku_pamei", {
            textContent: stateLeijufra["Live chat for your questions"],
          })
        )
      )
    );
  },
  {
    eventKeys: ["sutysisku-event"],
    afterRender: () => {
      document.getElementById("ciska")?.[stateRAM.focused ? "focus" : "blur"]();
    },
  }
);

const outpBlock = async () => {
  console.log("skicu", new Date().getTime());

  let reses = await skicu_roledovalsi({ appendToSearch: false });
  console.log("after skicu", new Date().getTime(), "aft");

  return h(
    "div#outp",
    state.displaying.seskari === "cnano" &&
      (supportedLangs as any)[state.displaying.bangu as any]
        .semanticSearchPossible &&
      h("div.term.noselect.nasezvafahi", {
        innerText: stateLeijufra.alerts.semanticSearchAlert,
      }),
    state.displaying.seskari === "rimni" &&
      stateLeijufra.alerts?.rhymesSearchAlert &&
      h("div.term.noselect.nasezvafahi", {
        innerText: stateLeijufra.alerts.rhymesSearchAlert,
      }),
    h("div", ...reses)
  );
};

function rectuResults() {
  const results = stateRAM.results.slice(0, 100);
  // console.log(results);
  return [];
}

let cacheObj: Cache;
async function getCacheObject() {
  if (!cacheObj) cacheObj = await caches.open("sutysisku");
  return cacheObj;
}

async function getOrFetchResource(url: string) {
  const match = await (await getCacheObject()).match(url);
  if (match) return true;
  const response = await fetch(url);
  if (!response.ok) return false;
  cacheObj.put(url, response);
  return true;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

//todo: change to regex
function getMemoizedBasna(query: string[]): BasnaMemoized {
  const string = query.join(" ");
  const cached = state.memoizedValues[string] as unknown as BasnaMemoized;
  if (cached) return cached;
  let arrQuery = query
    .concat(query.map((i) => i.replace(/'/g, "h")))
    .map((i) => escapeRegExp(i.trim().replace(/[\|\(\)\{\}<>]/g, ".")))
    .filter((i) => i.length > 2);
  const regex = `(${arrQuery.join("|")})`;
  return ((state.memoizedValues as any)[string] = {
    arrQuery,
    regex,
  } as BasnaMemoized);
}

function basna({ def, query }: { def: any; query: string[] }) {
  if (query.length === 0 || (query.length === 1 && query[0].length <= 2))
    return def;
  const { arrQuery, regex } = getMemoizedBasna(query);

  if ((arrQuery ?? []).length === 0) return def;

  return def.replace(
    new RegExp(regex as string, "igm"),
    "<span class='basna'>$1</span>"
  );
}

function escHtml(str: string, apos?: boolean) {
  //for displaying text
  str = (str || "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\(/g, "&#40;")
    .replace(/\)/g, "&#41;");
  if (!apos) str = str.replace(/'/g, "&#039;");
  return str;
}

function encodeValsiForWeb(v: string) {
  return encodeURIComponent(v).replace(/'/g, "h");
}

function plukaquery(query: string) {
  if (query.charAt(0) !== "^" && query.slice(-1) !== "$")
    return query.replace(/\./g, " ").replace(/ {2,}/g, " ").replace(/’/g, "'");
  return query;
}

function placeTagHasExpansion(v: string) {
  const v_ = v.substr(1, v.length - 2).split("=");
  const jalge = v_.map((i) => i.replace(/[^A-Za-z']/g, ""));
  return v.length > 1 || (jalge[0] && jalge[0] !== "x");
}

const number2ColorHue = (number: number) =>
  Math.floor(((number * 360) / 7.618) % 360);

const bgString2Int = (number: number, { s = "90%", l = "80%" }) =>
  `hsl(${number2ColorHue(number)},${s},${l})`;

function getVeljvoString({
  placeTag,
  fullDef,
  isHead,
  dataArrAdded,
  clearedPlaceTag,
}: {
  placeTag: string;
  fullDef: Def;
  isHead: boolean;
  dataArrAdded: string[];
  clearedPlaceTag: string;
}) {
  if (isHead && fullDef.t !== "lujvo")
    return {
      dataArr: false,
      replacement: placeTag,
      stringifiedPlaceTag: placeTag,
    };
  const rfsWords = (fullDef.rfs || []).map((i) => i.w);
  const arrayPlaceTags = placeTag
    .substr(1, placeTag.length - 2)
    .split("=")
    .map((i) => {
      const arrayTag = i.split(/(?=[_0-9].*)/);
      const candidateWord = rfsWords.filter(
        (word) => word.indexOf(arrayTag[0]) === 0
      )[0];
      return {
        full: isHead ? candidateWord || arrayTag[0] : fullDef.w,
        number: arrayTag
          .slice(1)
          .join("")
          .replace(/^_([0-9]+)$/, "_{$1}"),
        short: isHead ? arrayTag[0] : fullDef.w,
        hasMatchInRFS: !!candidateWord,
      };
    });
  const stringifiedPlaceTag =
    arrayPlaceTags
      .filter((i) => i.hasMatchInRFS || !isHead)
      .map((i) => i.full + i.number.replace(/[_\{\}]/g, ""))
      .join(",") || clearedPlaceTag;
  const replacingPlaceTag = arrayPlaceTags
    .map((i) => i.full + i.number)
    .join("=");
  return {
    stringifiedPlaceTag,
    dataArr: !dataArrAdded.includes(clearedPlaceTag),
    replacement: `$${replacingPlaceTag}$`,
  };
}

import { UNICODE_START, lerfu_index } from "./utils/zlm";
import { string } from "@tensorflow/tfjs";

function latinToZbalermorna(c: string) {
  if ((c.codePointAt(0) ?? 0) >= 0xed80) {
    return c;
  }
  if (c == " ") return " ";
  if (c == "h" || c == "H") c = "'";
  if (lerfu_index.includes(c))
    return String.fromCodePoint(UNICODE_START + lerfu_index.indexOf(c));
  else if (lerfu_index.includes(c.toLowerCase()))
    return String.fromCodePoint(
      UNICODE_START + lerfu_index.indexOf(c.toLowerCase())
    );
  if (c == "\n") return "\n";
  if (c == "\t") return "\t";
  return c;
}

function krulermorna(text: string) {
  return text
    .replace(/\./g, "")
    .replace(/^/, ".")
    .toLowerCase()
    .replace(/([aeiou\.])u([aeiou])/g, "$1w$2")
    .replace(/([aeiou\.])i([aeiou])/g, "$1ɩ$2")
    .replace(/au/g, "ḁ")
    .replace(/ai/g, "ą")
    .replace(/ei/g, "ę")
    .replace(/oi/g, "ǫ")
    .replace(/\./g, "");
}
function cohukrulermorna(text: string) {
  return text
    .replace(/w/g, "u")
    .replace(/ɩ/g, "i")
    .replace(/ḁ/g, "au")
    .replace(/ą/g, "ai")
    .replace(/ę/g, "ei")
    .replace(/ǫ/g, "oi");
}

function zbalermornaize({ w, ot, rfs }: Def) {
  let word = krulermorna(w);
  word = word
    .split(/(?=[ɩw])/)
    .map((spisa) =>
      cohukrulermorna(spisa)
        .split("")
        .map((lerfu) => latinToZbalermorna(lerfu))
        .join("")
    )
    .join("");
  return word.replace(/,/g, "");
}

function convertMathStringtoHtml({
  iterTerbricmiId,
  index,
  fullDef,
  jsonIds,
  type,
  placeTag,
  dataArrAdded,
  stringifiedPlaceTags,
}: {
  iterTerbricmiId: number;
  index: number;
  fullDef: Def;
  jsonIds: Dict[];
  type: string;
  placeTag: string;
  dataArrAdded: string[];
  stringifiedPlaceTags: string[];
}): {
  span: HTMLSpanElement;
  stringifiedPlaceTags: string[];
  iterTerbricmiId: number;
} {
  iterTerbricmiId++;
  const combInd = `${index}_${iterTerbricmiId}`;

  if (type === "d") jsonIds.push({ [placeTag]: combInd });
  const clearedPlaceTag = placeTag.replace(/[^a-zA-Z0-9]/g, "");
  const isHead = (fullDef.rfs || []).length > 0;

  const objectVeljvoReplacement = getVeljvoString({
    isHead,
    placeTag,
    fullDef,
    dataArrAdded,
    clearedPlaceTag,
  });
  const stringifiedPlaceTag = objectVeljvoReplacement.stringifiedPlaceTag;
  if (!stringifiedPlaceTags.includes(stringifiedPlaceTag))
    stringifiedPlaceTags.push(stringifiedPlaceTag);
  const number = stringifiedPlaceTags.indexOf(stringifiedPlaceTag);
  const replacementTag = isHead
    ? objectVeljvoReplacement.replacement
    : placeTag;
  const gradient = bgString2Int(number, { s: "90%", l: "100%" });
  const gradientBorder = bgString2Int(number, { s: "100%", l: "40%" });
  // dataArrAdded.push(clearedPlaceTag)
  const background = `repeating-linear-gradient(to right,${gradient},${gradient} 100%) content-box content-box, linear-gradient(90deg, ${gradientBorder},${gradientBorder} 100%) padding-box padding-box`;
  const span = h("span", {
    class: "terbricmi",
    id: type === "d" ? combInd : null,
    style: {
      background,
    },
    attributes: {
      "data-arr":
        objectVeljvoReplacement.dataArr && type === "d"
          ? stringifiedPlaceTag
          : null,
      "data-color": !isHead ? number2ColorHue(number) : null,
    },
  });
  get_mathjax_svg(replacementTag, span);
  return { span, iterTerbricmiId, stringifiedPlaceTags };
}

function textToTaggedArray(
  text: DefRenderedElement,
  args: RegexFlavours[]
): DefRenderedElement[] {
  if (args.length === 0) return [text];
  const regex = args[0];
  return text.value
    .split(regex.partial)
    .map((el) => ({ type: "simple", value: el }) as DefRenderedElement)
    .reduce((acc: DefRenderedElement[], el: DefRenderedElement) => {
      //chunks: intralinks
      if (regex.full.test(el.value)) {
        return acc.concat([
          { type: regex.tagName, value: el.value } as DefRenderedElement,
        ]);
      }
      return acc.concat(textToTaggedArray(el, args.slice(1)));
    }, [] as DefRenderedElement[]);
}

function melbi_uenzi({
  text,
  fullDef,
  type,
  query,
  index,
  stringifiedPlaceTags,
}: {
  text: string | Dict;
  fullDef: Def;
  query: string[];
  type: string;
  index: string;
  stringifiedPlaceTags: string[];
}) {
  /*
  text: split, analyze each part
  for -cll style special syntax, hilite it too
  but probably just def.book_d outside melbi uenzi
  {} parts
  hyperlinks
  hilite
  */
  const { bangu, seskari } = state.displaying;
  let hasExpansion = false;
  if (typeof text === "object") {
    if (fullDef.bangu.indexOf("-cll") >= 0) {
      const url =
        stateLeijufra.custom_links?.filter((i) => !!i.uncll)?.[0]?.uncll?.url ||
        "/";
      return {
        tergeha: h(
          "ul",
          {
            class: "uoldeliste",
            style: {
              "list-style-image": "url(../assets/pixra/cukta.svg)",
            },
          },
          ...Object.keys(text).map((address) =>
            h(
              "li",
              h("a", {
                rel: "noreferrer",
                target: "_blank",
                href: `${url}${address}`,
                innerText: text[address],
              })
            )
          )
        ).outerHTML,
        hasExpansion: false,
      };
    } else if (fullDef.bangu.indexOf("-ll") >= 0) {
      const url =
        stateLeijufra.custom_links?.filter((i) => !!i.introbook)?.[0]?.introbook
          ?.url || "/";
      return {
        tergeha: h(
          "ul",
          {
            class: "uoldeliste",
            style: {
              "list-style-image": "url(../pixra/certu.svg)",
            },
          },
          ...Object.keys(text).map((address) =>
            h(
              "li",
              h("a", {
                rel: "noreferrer",
                target: "_blank",
                href: `${url}${address}`,
                innerText: text[address],
              })
            )
          )
        ).outerHTML,
        hasExpansion: false,
      };
    }
  }

  let iterTerbricmiId = 0;
  const jsonIds: Dict[] = [];
  const dataArrAdded: string[] = [];
  const curSeskari = ["cnano", "catni", "rimni"].includes(seskari)
    ? seskari
    : "cnano";

  const placeTags = text.match(/\$.*?\$/g) || [];
  for (const placeTag of placeTags) {
    if (
      type === "d" &&
      typeof index !== "undefined" &&
      placeTagHasExpansion(placeTag)
    ) {
      hasExpansion = true;
      break;
    }
  }

  const jalge = h("span");
  const renewed = [{ type: "simple", value: text } as DefRenderedElement]
    .reduce((acc: DefRenderedElement[], el: DefRenderedElement) => {
      return acc.concat(
        textToTaggedArray(el, [
          regexTeX,
          regexIntraLink,
          regexImageLink,
          regexHyperLink,
        ]).reduce((acc: DefRenderedElement[], el: DefRenderedElement) => {
          if (el.type !== "simple") return acc.concat([el]);
          const basnaized = getMemoizedBasna(query);
          const regexHilite = new RegExp(basnaized.regex);
          if ((basnaized.arrQuery ?? []).length === 0) return acc.concat([el]);
          return acc.concat(
            (el.value ?? "").split(regexHilite).map((el: string) =>
              regexHilite.test(el)
                ? ({
                    type: "hilite",
                    value: el,
                  } as DefRenderedElement)
                : ({
                    type: "simple",
                    value: el,
                  } as DefRenderedElement)
            )
          );
        }, [] as DefRenderedElement[])
      );
    }, [] as DefRenderedElement[])
    // chunks: hilite
    .reduce(
      (
        acc: DefRenderedElement[],
        el: DefRenderedElement,
        index: number,
        renewed: DefRenderedElement[]
      ) => {
        if (
          index > 0 &&
          index < renewed.length - 1 &&
          renewed[index - 1].type === "math" &&
          renewed[index + 1].type === "math" &&
          renewed[index].value === "="
        ) {
          const newEl = {
            ...el,
            type: "veljvocmiterjonmaho",
          } as DefRenderedElement;
          return acc.concat([newEl]);
        }
        return acc.concat([el]);
      },
      [] as DefRenderedElement[]
    )

    //convert to HTML
    .map((el: DefRenderedElement, index: number) => {
      // console.log(el);
      if (el.type === regexTeX.tagName) {
        const convertedChunk = convertMathStringtoHtml({
          dataArrAdded,
          fullDef,
          index,
          iterTerbricmiId,
          jsonIds,
          placeTag: el.value,
          stringifiedPlaceTags,
          type,
        });
        iterTerbricmiId = convertedChunk.iterTerbricmiId;
        stringifiedPlaceTags = convertedChunk.stringifiedPlaceTags;
        return convertedChunk.span;
      } else if (el.type === "veljvocmiterjonmaho") {
        return h("span", { class: ["veljvocmiterjonmaho"], innerText: "=" });
      } else if (el.type === regexIntraLink.tagName) {
        const intralink = el.value.substring(1, el.value.length - 1);
        return h("a", {
          class: `a-${curSeskari}`,
          href: `#seskari=${curSeskari}&sisku=${encodeUrl(
            intralink
          )}&bangu=${bangu}&versio=masno`,
          innerText: intralink,
        });
      } else if (el.type === regexImageLink.tagName) {
        const url = el.value.replace(/^http:/, "https:");
        return h(
          "a",
          {
            href: url,
            rel: "noreferrer",
            target: "_blank",
          },
          h("img", {
            class: ["se-tcidu-pixra"],
            alt: query,
            src: url,
          })
        );
      } else if (el.type === regexHyperLink.tagName) {
        const url = el.value.replace(/^http:/, "https:");
        return h("a", {
          href: url,
          rel: "noreferrer",
          target: "_blank",
          innerText: url,
        });
      } else if (el.type === "hilite") {
        return h("mark", {
          class: ["basna"],
          innerText: el.value,
        });
      } else {
        return h("span", { innerText: el.value });
      }
    });

  jalge.innerHTML = text
    //add span to linages of lujvo's complex places
    .replace(/\$=\$/g, `$<span class="veljvocmiterjonmaho">=</span>$`)
    //add span to borders of latex
    .replace(/\$.*?\$/g, (placeTag: string) => {
      iterTerbricmiId++;
      const combInd = `${index}_${iterTerbricmiId}`;

      if (type === "d") jsonIds.push({ [placeTag]: combInd });
      const clearedPlaceTag = placeTag.replace(/[^a-zA-Z0-9]/g, "");
      const isHead = (fullDef.rfs || []).length > 0;

      const objectVeljvoReplacement = getVeljvoString({
        isHead,
        placeTag,
        fullDef,
        dataArrAdded,
        clearedPlaceTag,
      });
      const stringifiedPlaceTag = objectVeljvoReplacement.stringifiedPlaceTag;
      if (!stringifiedPlaceTags.includes(stringifiedPlaceTag))
        stringifiedPlaceTags.push(stringifiedPlaceTag);
      const number = stringifiedPlaceTags.indexOf(stringifiedPlaceTag);
      const replacementTag = isHead
        ? objectVeljvoReplacement.replacement
        : placeTag;
      const gradient = bgString2Int(number, { s: "90%", l: "100%" });
      const gradientBorder = bgString2Int(number, { s: "100%", l: "40%" });
      // dataArrAdded.push(clearedPlaceTag)
      const background = `repeating-linear-gradient(to right,${gradient},${gradient} 100%) content-box content-box, linear-gradient(90deg, ${gradientBorder},${gradientBorder} 100%) padding-box padding-box`;
      const span = h("span", {
        class: "terbricmi",
        id: type === "d" ? combInd : null,
        style: {
          background,
        },
        attributes: {
          "data-arr":
            objectVeljvoReplacement.dataArr && type === "d"
              ? stringifiedPlaceTag
              : null,
          "data-color": !isHead ? number2ColorHue(number) : null,
        },
      });
      get_mathjax_svg(replacementTag, span);
      return span.outerHTML;
    })
    //add spans to intralinks
    .replace(/\{.*?\}/g, (intralink: string) => {
      intralink = intralink.substring(1, intralink.length - 1);
      return h("a", {
        class: `a-${curSeskari}`,
        href: `#seskari=${curSeskari}&sisku=${encodeUrl(
          intralink
        )}&bangu=${bangu}&versio=masno`,
        innerHTML: basna({
          def: escHtml(intralink, true),
          query: query,
        }),
      }).outerHTML;
    })
    //add hyperlinks
    .replace(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
      (url: string) => {
        url = url.replace(/^http:/, "https:");
        return h("a", {
          href: url,
          rel: "noreferrer",
          target: "_blank",
          innerHTML: !/^https?:\/\/.*\.(jpg|png)$/.test(url)
            ? basna({
                def: url,
                query,
              })
            : `<img class='se-tcidu-pixra' alt='secusku' src="${url}"/>\n`,
        }).outerHTML;
      }
    );

  //add hiliting where still absent
  Array.from(jalge.childNodes)
    .filter(
      (node) =>
        node.nodeType === 3 && (node?.textContent ?? "").trim().length > 1
    )
    .forEach((node) => {
      const span = document.createElement("span");
      span.innerHTML = basna({
        def: node.textContent,
        query,
      });
      node.replaceWith(span);
    });

  //@todo:
  // .replace(
  //   /(<span [^<>]+?>[^\(\)<>]+?<\/span>) \([^\(\)<>]*?\bproperty of <span .*?id="([^\(\)<>]+?)"[^<>]+?>([^\(\)<>]+?)<\/span>\)/g,
  //   (c, _, id, t) => {
  //     if (type === 'd') {
  //       const a = jsonIds.filter((e) => e[t] !== id && e[t])
  //       if (a[0] && a[0][t])
  //         c = c.replace(/^<span /, `<span data-target="${a[0][t]}" `)
  //     }
  //     return c
  //   }
  // )

  jalge.innerHTML = jalge.innerHTML.replace(/\n+/g, "<br/>");
  //todo: list of placetags
  return {
    tergeha: h("div", ...renewed).outerHTML,
    hasExpansion,
    stringifiedPlaceTags,
  };
}

async function skicu_paledovalsi({
  def,
  inner,
  index,
  stringifiedPlaceTags = [],
}: {
  def: Def;
  inner: boolean;
  index: string;
  stringifiedPlaceTags: string[];
}) {
  if (
    def.bangu === "en-pixra" &&
    !(typeof def.d === "string"
      ? await getOrFetchResource(
          def.d?.indexOf("../") === 0
            ? def.d
            : `../pixra/xraste/${encodeURIComponent(def.d ?? "")}`
        )
      : null)
  )
    return;
  const { query, seskari, versio } = state.displaying;
  const bangu = state.displaying.bangu.replace(/-cll/, "");
  const out = h("div", {
    class: [
      !inner && def.d && def.nasezvafahi && (def.rfs || []).length === 0
        ? "sidju sidju-normal cll noselect"
        : "term",
      inner ? "terminner" : "termouter",
    ],
  });

  let selms;
  if (def.s) {
    const selmahos = typeof def.s === "string" ? def.s.split(" ") : def.s;
    if (selmahos.length > 0) {
      selms = h("div");
      for (const selmaho of selmahos) {
        const inDefSelmahoElement = h("button", {
          class: "xp-btn tutci tutci-sampu",
          innerHTML: basna({
            def: escHtml(selmaho),
            query: [query],
          }),
          attributes: {
            onclick: () => {
              state.displaying.versio = "selmaho";
              state.displaying.query = selmaho;
            },
          },
        });
        selms.appendChild(inDefSelmahoElement);
      }
    }
  }
  let hasTranslateButton = false;
  const word = h("h4", {
    class: ["valsi"],
    attributes:
      def.d && !def.nasezvafahi
        ? { "data-valsi": encodeValsiForWeb(def.w) }
        : {},
  });

  if (
    stateLeijufra.lojbo &&
    def.t !== stateLeijufra.bangudecomp &&
    seskari !== "fanva" &&
    (plukaquery(def.w) == query || seskari == "velcusku")
  ) {
    hasTranslateButton = true;
    word.innerHTML = `${basna({
      def: def.q || def.w,
      query: [query],
    })} `;
  } else {
    const aTag = h("a", {
      innerHTML: basna({
        def: escHtml(def.w, true),
        query: [query],
      }),
      class: "valsi",
      attributes: {
        href: buildURLParams({
          seskari: seskari === "fanva" ? "catni" : seskari,
          sisku: encodeUrl(def.w),
          bangu,
          versio: "masno",
        }),
      },
    });
    word.appendChild(aTag);
  }

  let jvs;
  if (typeof def.t === "string") {
    def.t = def.t === "bangudecomp" ? stateLeijufra.bangudecomp : def.t;
    const txt = encodeUrl(def.w).replace(/_/g, "%20");
    jvs = h("a", {
      class: "klesi link",
      href: stateLeijufra.judri
        ? stateLeijufra.judri + txt
        : buildURLParams({
            seskari: seskari === "catni" ? "catni" : "cnano",
            sisku: txt,
            bangu,
            versio: "masno",
          }),
      attributes: stateLeijufra.judri
        ? {
            target: "_blank",
            rel: "noreferrer",
          }
        : {},
      innerText: stateLeijufra.xuzganalojudri
        ? def.d && def.nasezvafahi
          ? `➕ ${def.t}# `
          : `${def.t}# `
        : def.t,
    });
  } else if (def?.t?.type) {
    jvs = h("a", {
      href: "javascript:;",
      innerText: def.t.type,
      class: ["klesi", def?.t?.bangu !== "lojbo" ? "na_eisesance" : null],
    });
  } else if (def.date) {
    jvs = h("div", {
      class: "klesi",
      innerText: def.date,
      style: {
        whiteSpace: "nowrap",
      },
    });
  }

  let prettifiedDefinition: Partial<{
    tergeha: string;
    hasExpansion: boolean;
    stringifiedPlaceTags: string[];
  }> = {};
  if (def.d && !def.nasezvafahi)
    if (
      !(supportedLangs[def.bangu as keyof typeof supportedLangs] as any)
        .pictureDictionary
    ) {
      prettifiedDefinition = melbi_uenzi({
        text: def.d,
        fullDef: def,
        query: state.embeddings.length > 0 ? state.embeddings : [query],
        type: "d",
        index,
        stringifiedPlaceTags,
      });
    } else {
      prettifiedDefinition = {
        tergeha:
          def.d.indexOf("../") === 0
            ? `<img src="${def.d}"/>`
            : `<img src="../pixra/xraste/${encodeURIComponent(
                typeof def.d === "string" ? def.d : ""
              )}"/>`,
        hasExpansion: false,
        stringifiedPlaceTags,
      };
    }
  if (prettifiedDefinition?.stringifiedPlaceTags)
    stringifiedPlaceTags = prettifiedDefinition.stringifiedPlaceTags;

  //<xuzganalojudri|lojbo>
  let zbalermorna;
  if (
    stateLeijufra.lojbo &&
    !(typeof def.t === "object" && def.t.k === 0) &&
    (seskari !== "fanva" || index === "0")
  ) {
    const textContent = zbalermornaize(def);
    zbalermorna = h(
      "h4",
      (supportedLangs[bangu as keyof typeof supportedLangs] as any)
        .zbalermorna_defined
        ? h("a", {
            attributes: {
              href: buildURLParams({
                seskari,
                sisku: "zbalermorna",
                bangu,
                versio,
              }),
            },
            innerText: textContent,
            class: ["valsi", "zbalermorna", "segerna", "sampu"],
          })
        : { class: ["valsi", "zbalermorna", "segerna", "sampu"], textContent }
    );
  }
  //</xuzganalojudri|lojbo>

  const heading = h("heading", { class: "heading" });

  if (stateLeijufra.lojbo) {
    let arrRenderedFamymaho: HTMLElement[] = [];
    for (const key in listFamymaho) {
      if (
        listFamymaho[key as keyof typeof listFamymaho]
          .split(" ")
          .includes(def.w)
      ) {
        arrRenderedFamymaho.push(
          h("a", {
            class: ["selmaho"],
            href: `#seskari=${seskari}&versio=selmaho&sisku=${encodeUrl(
              key
            )}&bangu=${bangu}`,
            innerText: key,
          })
        );
      }
    }
    if (arrRenderedFamymaho.length !== 0) {
      const inDefElement = h(
        "div",
        {
          class: ["valsi"],
        },
        h(
          "i",
          h(
            "sup",
            ...arrRenderedFamymaho,
            h("span", { class: ["selmaho"], innerText: " ..." })
          )
        )
      );
      if (inDefElement) heading.appendChild(inDefElement);
    }
  }

  heading.appendChild(word);

  let translateButton;
  if (hasTranslateButton) {
    translateButton = h("button", {
      class: ["xp-btn", "tutci", "tutci-pixra"],
      style: { "background-image": "url(/assets/pixra/terdi.svg)" },
      click: function () {
        state.displaying.seskari = "fanva";
      },
    });
  }

  const banguEl = h("div", {
    class: "segerna sampu noselect",
    innerText:
      def.bangu && supportedLangs[def.bangu as keyof typeof supportedLangs].n
        ? supportedLangs[def.bangu as keyof typeof supportedLangs].n
        : def.bangu || "",
  });

  const famymahos =
    typeof def.s === "string" &&
    listFamymaho[def.s as keyof typeof listFamymaho]
      ? listFamymaho[def.s as keyof typeof listFamymaho].split(" ")
      : undefined;
  if (typeof famymahos !== "undefined") {
    let innerHTML = "";
    for (const famymaho of famymahos) {
      innerHTML += `&nbsp;&nbsp;<i><sup>[&nbsp;...&nbsp;&nbsp;&nbsp;<a href="#seskari=${seskari}&sisku=${encodeUrl(
        famymaho
      )}&bangu=${bangu}&versio=masno">${escHtml(famymaho)}</a>]</sup></i>`;
    }
    const inDefElement = h("h4", { class: "tfm", innerHTML });
    heading.appendChild(inDefElement);
  }

  if (jvs) {
    const inDefElement = h("div", { class: "sampu noselect" });
    inDefElement.appendChild(jvs);
    jvs = inDefElement;
  }

  //<xuzganalojudri|lojbo>
  let jvo;

  //todo: restore
  // if (
  //   def.t === "lujvo" &&
  //   (def.rfs || []).length > 0 &&
  //   prettifiedDefinition.hasExpansion
  // ) {
  //   jvo = h("button", {
  //     style: { "background-image": "url(../pixra/shuffle.svg)" },
  //     class: [
  //       "tutci",
  //       "tutci-pixra",
  //       "xp-btn",
  //       "jvo_plumber",
  //       state.jvoPlumbsOn ? "tutci-hover" : null,
  //     ],
  //     click: addJvoPlumbs,
  //   });
  // }

  //</xuzganalojudri|lojbo>

  let whoIsFirstLine = [];

  if (zbalermorna && !selms && def.w.length < 10 && !jvo) {
    whoIsFirstLine.push("zbalermorna");
    heading.appendChild(zbalermorna);
  }

  heading.appendChild(h("heading", { style: { flex: 1 } }));

  if (!selms) {
    heading.appendChild(banguEl);
    whoIsFirstLine.push("banguEl");
    if (jvs) {
      heading.appendChild(jvs);
      whoIsFirstLine.push("jvs");
    }
  }

  if (translateButton && def.w.length < 20) {
    heading.appendChild(translateButton);
    whoIsFirstLine.push("translateButton");
  }

  //<xuzganalojudri|lojbo>
  if (jvo) heading.appendChild(jvo);
  //</xuzganalojudri|lojbo>

  if (selms) heading.appendChild(selms);

  const copy = h("input", {
    type: "button",
    class: ["tutci", "tutci-pixra", "xp-btn"],
    style: { "background-image": "url(../assets/pixra/fukpi.svg)" },
  });
  copy.addEventListener("click", function () {
    copyToClipboard([def.w, def.d, def.n].filter(Boolean).join("\r\n"));
  });
  heading.appendChild(copy);

  if (def.semMaxDistance ?? Infinity <= 1) {
    const distance = h("div", {
      innerText: `${Math.round(
        parseFloat((def.semMaxDistance ?? Infinity).toPrecision(2)) * 100
      )}%`,
      class: ["tutci", "tutci-sampu", "xp-btn", "klesi", "noselect"],
    });
    distance.addEventListener("click", function () {
      stateLoading.innerText = interpolate(stateLeijufra.distance || "", {
        distance: distance.innerText,
      });
      stateLoading.hideProgress = true;
      stateLoading.loading = true;
      //   setTimeout(() => {
      //     stateLoading.loading = true;
      // }, 4000);
    });
    heading.appendChild(distance);
  }

  out.appendChild(heading);
  //new line buttons
  const heading2 = h("heading", { class: "heading heading2" });
  //<xuzganalojudri|lojbo>
  if (zbalermorna && !whoIsFirstLine.includes("zbalermorna"))
    heading2.appendChild(zbalermorna);
  //</xuzganalojudri|lojbo>
  heading2.appendChild(h("heading", { style: { flex: 1 } }));
  if (!whoIsFirstLine.includes("banguEl")) heading2.appendChild(banguEl);
  if (jvs && !whoIsFirstLine.includes("jvs")) heading2.appendChild(jvs);
  if (translateButton && !whoIsFirstLine.includes("translateButton"))
    heading2.appendChild(translateButton);
  out.appendChild(heading2);

  if (bangu.indexOf("muplis") === 0) {
    const row = h("button", {
      class: "xp-btn tutci tutci-sampu klesi align-right",
      //todo: add feedback button
      // onclick: () => window.send_muplis_feedback(def),
      innerText: stateLeijufra.report_feedback,
    });
    out.appendChild(row);
  }

  if (seskari !== "arxivo" && def.d) {
    if (def?.nasezvafahi) {
      if (!(!def.t && (def.rfs || []).length === 0)) {
        out.appendChild(
          h("div", {
            innerText: stateLeijufra.nasezvafahi,
            class: ["nasezvafahi", "noselect", "definition", "valsi"],
          })
        );
      } else {
        out.appendChild(h("div", { class: "definition valsi" }));
      }
    } else {
      out.appendChild(
        h("div", {
          class: "definition valsi",
          innerHTML: prettifiedDefinition.tergeha,
        })
      );
    }
  }
  if (seskari === "arxivo" && typeof def?.d === "string") {
    const inDefElement1 = h("div", {
      class: "definition valsi pointer",
      innerHTML: ConstructArxivoValsiExtract(def.d, query, 50),
    });
    // inDefElement1.addEventListener("click", () => {
    //   h(inDefElement1, {
    //     "update!": true,
    //     style: { display: "none" },
    //   });
    //   h(inDefElement1.nextElementSibling, {
    //     "update!": true,
    //     style: { display: "block" },
    //   });
    // });
    out.appendChild(inDefElement1);

    const inDefElement = h("div", {
      class: (def?.nasezvafahi ? ["nasezvafahi", "noselect"] : []).concat([
        "definition",
        "valsi",
      ]),
      innerHTML: def?.nasezvafahi
        ? stateLeijufra.nasezvafahi
        : `${basna({
            def: def.d.replace(/([a-z0-9])\/([a-z0-9])/gi, "$1 / $2"),
            query: [query],
          })} `,
      style: { display: "none" },
      click: () => {
        // h(inDefElement, {
        //   "update!": true,
        //   style: { display: "none" },
        // });
        // h(inDefElement.previousElementSibling, {
        //   "update!": true,
        //   style: { display: "block" },
        // });
        // inDefElement.parentElement.scrollIntoView();
      },
    });
    out.appendChild(inDefElement);
    //add two divs. first is hidden. on click hide and display the other
  }
  if (def.n) {
    out.appendChild(
      h("div", {
        class: ["notes", "valsi"],
        innerHTML: melbi_uenzi({
          text: def.n,
          fullDef: def,
          query: state.embeddings.length > 0 ? state.embeddings : [query],
          type: "n",
          index,
          stringifiedPlaceTags,
        }).tergeha,
      })
    );
  }
  if ((def.r || []).length > 0) {
    const tanxe_leirafsi = h("div", { class: "rafsi noselect" });

    const rafcme = h("div", {
      class: "tanxe zunle_tanxe",
      innerText: stateLeijufra.rafsi || "rafsi",
    });
    tanxe_leirafsi.appendChild(rafcme);

    const rafsi = h("div", { class: "tanxe pritu_tanxe" });
    for (const el of def.r ?? []) {
      const rafElem = h("span", {
        class: "pamei",
        innerHTML: basna({
          def: el,
          query: [query],
        }),
      });
      rafsi.appendChild(rafElem);
    }
    tanxe_leirafsi.appendChild(rafsi);
    out.appendChild(tanxe_leirafsi);
  }
  if (def.b) {
    const tanxe_leirafsi = h("div", { class: "rafsi noselect hue_rotate" });

    const rafcme = h("div", {
      class: "tanxe zunle_tanxe kurfa_tanxe",
      innerText: "BAI",
    });
    tanxe_leirafsi.appendChild(rafcme);

    const rafsi = h("div", { class: "tanxe pritu_tanxe kurfa_tanxe" });
    for (const el of def.b) {
      const rafElem = h("span", {
        class: "pamei",
        innerHTML: `</span><a class="hue_rotate_back a-${seskari}" href="#seskari=${seskari}&sisku=${encodeUrl(
          el
        )}&bangu=${bangu}&versio=masno">${basna({
          def: escHtml(el, true),
          query: [query],
        })}</a><span>`,
      });
      rafsi.appendChild(rafElem);
    }
    tanxe_leirafsi.appendChild(rafsi);
    out.appendChild(tanxe_leirafsi);
  }

  const subDefs = h("div", {
    class: ["definition", "subdefinitions"],
  });
  for (const [i, subdef] of (def.rfs || []).entries()) {
    const html = await skicu_paledovalsi({
      def: subdef,
      inner: true,
      index: `${index}_${i}`,
      stringifiedPlaceTags,
    });
    if (html) subDefs.appendChild(html);
  }
  out.appendChild(subDefs);

  out.addEventListener("click", clicked);
  return out;
}

function copyToClipboard(value: string) {
  const myTemporaryInputElement = h("textarea", { value });
  document.body.appendChild(myTemporaryInputElement);

  myTemporaryInputElement.select();
  document.execCommand("Copy");

  document.body.removeChild(myTemporaryInputElement);
  stateLoading.innerText = stateLeijufra.copied;
  stateLoading.hideProgress = true;
}

function interpolate(str: string, params: Dict) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${str}\`;`)(...vals);
}

function getMatchIndices(query: string, d: string) {
  const regex = new RegExp(query, "g");
  const result = [];
  let match;
  while ((match = regex.exec(d))) result.push(match.index);
  return result;
}

function onlyUnique(value: any, index: number, self: any[]) {
  return self.indexOf(value) === index;
}

function ConstructArxivoValsiExtract(d: string, query: string, range: number) {
  let locs: any[];
  locs = getMatchIndices(query, d);
  locs = locs.map((i_) => {
    const i = [i_ - range, i_ + range];
    if (i[0] < 0) i[0] = 0;
    if (i[0] >= d.length) i[0] = d.length - 1;
    return i;
  });
  for (let i = 0; i < locs.length - 1; i++) {
    if (locs[i][1] > locs[i + 1][0]) {
      locs[i][1] = locs[i + 1][1];
      locs[i + 1][0] = locs[i][0];
    }
  }
  locs = locs.map((i) => JSON.stringify(i));
  if (locs.length > 0) {
    locs = locs.filter(onlyUnique).map((i) => {
      i = JSON.parse(i);
      let n = d.substr(i[0], i[1] - i[0]);
      n = basna({
        def: n,
        query: [query],
      });
      if (i[0] > 3) n = `...${n}`;
      if (i[1] < d.length - 4) n = `${n}...`;
      return n;
    });
    return locs.join("<br/>");
  } else {
    let n = d.substr(0, Math.min(100, d.length));
    if (n.length < d.length) n = `${n}...`;
    n = basna({
      def: n,
      query: [query],
    });
    return n;
  }
}

function clicked({ target }: any) {
  if (target?.nodeName === "A") {
    const el = target;
    if (el.ctrlKey || el.metaKey) return;
    let href = el.getAttribute("href");
    setStateFromUrl(href);
  }
  return;
}

function generateStateFromUrl(href?: string) {
  let newState: Dict = {};
  if (href) {
    href = href.substring(href.indexOf("#") + 1);
  }
  let params = parseQuery(href || window.location.hash) || {};
  let newSearch;
  if (params?.sisku) {
    newSearch = decodeUrl(params.sisku);
  } else {
    href = href || window.location.search;
    href = href.substring(href.indexOf("?") + 1);
    const search = new URLSearchParams(href);
    newSearch = decodeUrl(search.get("focus") || "");
    if (newSearch) params = { sisku: newSearch, seskari: "cnano" };
  }
  if (
    ["velcusku", "cnano", "catni", "rimni", "arxivo", "fanva"].includes(
      params.seskari
    )
  )
    newState.seskari = params["seskari"];

  if (["selmaho"].includes(params.versio)) newState.versio = params.versio;
  else newState.versio = "masno";

  if (Object.keys(supportedLangs).includes(params.bangu))
    newState.bangu = params.bangu;

  if (params.sisku) newState.query = newSearch;
  return newState;
}
function setStateFromUrl(href: string) {
  const newState = generateStateFromUrl(href);
  for (const i in newState) {
    state.displaying[i as keyof typeof state.displaying] = newState[i];
  }
  postQuery();
}

function decodeUrl(urli: string) {
  return decodeURIComponent(
    urli.replace(/&amp;/g, "&").replace(/%27/g, "'")
  ).replace(/[_]/g, " ");
}

function parseQuery(queryString: string) {
  if (queryString === "") return;
  const query: Dict = {};
  let pairs = [];
  //legacy support:
  if (queryString.search(/^#sisku\//) === 0) {
    pairs = [queryString.replace(/#sisku\/(.*)/, "sisku=$1")];
  } else {
    pairs = (
      queryString[0] === "#" ? queryString.substr(1) : queryString
    ).split("&");
  }
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split("=");
    if (pair[1])
      query[decodeURIComponent(pair[0])] = decodeURIComponent(
        pair[1].replace(/[\+]/g, " ") || ""
      );
  }
  return query;
}

async function skicu_roledovalsi({
  appendToSearch,
}: {
  appendToSearch: boolean;
}): Promise<(HTMLDivElement | undefined)[]> {
  if (!appendToSearch) {
    // removePlumbs();
    // state.jimte = state.displaying.seskari === "velcusku" ? 201 : 30;
    // state.resultCount = 0;
  } else {
    // newResultsDiv = document.getElementById("outp").cloneNode(true);
    // state.jimte += 10;
  }

  const displayUpTo = Math.min(state.jimte, stateRAM.results.length);
  let resultCount = 0;

  return await Promise.all(
    stateRAM.results.slice(0, displayUpTo).reduce(
      (acc, resultEl) => {
        const htmlTermBlock = skicu_paledovalsi({
          def: JSON.parse(JSON.stringify(resultEl as Def)),
          // length: state.results.length,
          inner: false,
          stringifiedPlaceTags: [],
          index: resultCount.toString(),
        });
        if (htmlTermBlock) acc.push(htmlTermBlock);

        return acc;
      },
      [] as Promise<HTMLDivElement | undefined>[]
    )
  );
}
