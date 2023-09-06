import { component, store, h, s } from "../../../renderer/src";
import { rows } from "./utils/pronunciation";
import tejufra from "./worker/template/tejufra.json";

import katex from "katex";

export function get_mathjax_svg(math: string, span: HTMLElement): void {
  katex.render(math.replace(/^\$/, "").replace(/\$$/, ""), span);
}

// import io from "socket.io-client";
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
  regexTeXQuotation,
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
let cacheObj: Cache;
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
// window.addEventListener("load", () => {
onLoad();
// });
// worker.postMessage({
//   kind: "parse",
//   operation: "audioLink",
//   tegerna: "coi",
//   queryLanguage: "en",
// });

async function onLoad() {
  if ("serviceWorker" in navigator) {
  } else if (location.protocol === "https:") {
    alert(
      "Your browser is not supported. Please, upgrade to the latest Chrome / Firefox / Safari and don't use the app in incognito / private browsing mode (it needs to save dictionary data to disk to work successfully)."
    );
  } else {
    alert("HTTP protocol, la sutysisku won't work.");
    console.log("http protocol, service worker won't work");
  }
  await fetchAndSaveCachedListValues({ mode: "co'a" });
  console.log({ crossOriginIsolated: window.crossOriginIsolated });

  worker.postMessage({
    kind: "fancu",
    cmene: "ningau_lesorcu",
    ...state.displaying,
  });
}

async function getCachedListKeys() {
  return await (await getCacheObject(cacheObj)).keys();
}

async function fetchAndSaveCachedListValues({ mode }: { mode: string }) {
  const cachedList = await getCachedListKeys();
  const initialCacheListLength = cachedList.length;

  const response = await fetch(
    `/data/tcini.json?sisku=${new Date().getTime()}`
  );
  if (!response.ok) {
    if (initialCacheListLength === 0)
      alert("Are you offline? We can't fetch the source.");
    return false;
  }
  const vreji = (await response.json()).vreji.map(
    (v: string) =>
      new URL(v, window.location.origin + window.location.pathname).href
  );
  let cacheUpdated = false;
  const objCache = await getCacheObject(cacheObj);
  for (let i = 0; i < vreji.length; i++) {
    const url = vreji[i];
    if (mode === "co'a" && !/((\.(js|wasm|html|css))|\/)$/.test(url)) continue;
    const isInCache = await objCache.match(url);
    if (!isInCache) {
      await objCache.add(url);
      cacheUpdated = true;
      if (mode === "co'a") {
        stateLoading.completedRows = i;
        stateLoading.totalRows = vreji.length;
        stateLoading.innerText = `📦 💾 📁 🛠️`;
      }
    }
  }

  for (const key of cachedList) {
    if (!vreji.includes(key.url)) {
      await objCache.delete(key.url, { ignoreMethod: true, ignoreVary: true });
      console.log({ event: "removing cache", url: key.url });
    }
  }
  if (cacheUpdated) {
    for (const url of [
      new URL("", window.location.origin + window.location.pathname).href,
      new URL("index.html", window.location.origin + window.location.pathname)
        .href,
    ]) {
      await objCache.delete(url, { ignoreMethod: true, ignoreVary: true });
      await objCache.add(url);
      console.log({ event: "adding cache", url });
    }
  }
  stateLoading.loading = false;

  if (mode === "co'a" && cacheUpdated) {
    window.location.reload();
  }
  //  else if (!window.crossOriginIsolated) {
  //   alert("la sutysisku will likely not work. Please, use Chrome/Chromium browser.")
  //   return false
  // }
  return true;
}

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

function removePlumbs() {
  document.body
    .querySelectorAll(".arrow")
    .forEach((element) => element?.parentNode?.removeChild(element));
}

function kahe_sezgana(el: Element) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 42 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function addPlumbs(root = document.body) {
  //plumbs for in-terbri interactions
  root.querySelectorAll("[data-target]").forEach((target) => {
    if (kahe_sezgana(target)) {
      const start = target.getAttribute("data-color") ?? "";
      const from = document?.getElementById(start);
      if (!from) return;
      let color = from.getAttribute("data-color");
      color = `hsla(${color},100%,70%,0.62)`;
      const arrow = generateArrow({
        from,
        to: target as HTMLElement,
        arrowHeadSize: 5,
        color,
      });

      document.body?.appendChild(arrow);
    }
  });
}

function generateArrow({
  from,
  to,
  arrowHeadSize = 10,
  color = "color",
}: {
  from: HTMLElement;
  to: HTMLElement;
  arrowHeadSize: number;
  color: string;
}): SVGSVGElement {
  const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae, as] = getBoxToBoxArrow(
    from.offsetLeft,
    from.offsetTop,
    from.offsetWidth,
    from.offsetHeight,
    to.offsetLeft,
    to.offsetTop,
    to.offsetWidth,
    to.offsetHeight,
    {
      padStart: 0,
      padEnd: arrowHeadSize * 0.5,
      prefer: "vertical",
    }
  );

  const top = document?.getElementById("contentWrapper")?.scrollTop ?? 0;
  return s(
    "svg",
    {
      class: "arrow",
      width: "100%",
      // height: "100%",
      height: `${from.offsetTop + from.offsetHeight}px`,
      xmlns: "http://www.w3.org/2000/svg",
      style: `top: ${-top}px;`,
    },
    s("path", {
      d: `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`,
      stroke: color,
      // "stroke-width": arrowHeadSize / 2,
    }),
    s("polyline", {
      points: [
        `${-arrowHeadSize * 0.7},${-arrowHeadSize * 0.9}`,
        `${arrowHeadSize * 0.5},0`,
        `${-arrowHeadSize * 0.7},${arrowHeadSize * 0.9}`,
      ].join(" "),
      transform: `translate(${ex}, ${ey}) rotate(${ae})`,
      stroke: color,
    })
  );
}

async function checkScrolledNearBottom({ target }: Event) {
  if (state.displaying.query === "") return;
  removePlumbs();
  addJvoPlumbs(true);
  // if (scrollTimer !== null) {
  //   clearTimeout(scrollTimer)
  // }
  // if (scrollJvoTimer !== null) {
  //   clearTimeout(scrollJvoTimer)
  // }
  // if (
  //   state.displaying.seskari !== 'velcusku' &&
  //   target.scrollTop + window.innerHeight >=
  //     document.getElementById('outp').clientHeight - 700
  // ) {
  //   skicu_roledovalsi({ ...state.displaying, appendToSearch: true })
  // } else {
  //   window.requestAnimationFrame(() => {
  //     addJvoPlumbs(true)
  //   })
  //   addAudioLinks()
  // }
}

function addJvoPlumbs(force = false) {
  stateRAM.scrollJvoTimer = setTimeout(
    () => {
      window.requestAnimationFrame(() => {
        removePlumbs();
        addPlumbs();
        if (force !== true) {
          state.jvoPlumbsOn = !state.jvoPlumbsOn;
        }
        const targetedEls =
          Array.from(document.body.querySelectorAll("[data-arr]")) ?? [];
        for (
          let targetedElIndex = 0;
          targetedElIndex < targetedEls.length;
          targetedElIndex++
        ) {
          const target = targetedEls[targetedElIndex];
          const targetVeljvoElements: string[] =
            target?.getAttribute("data-arr")?.split(",") ?? [];
          const targetIdComponents = target.id.split("_");
          const targetFinalIndex = targetIdComponents.slice(0, -1);
          const WeCanSeeThisElement = kahe_sezgana(target);
          targetedEls.filter((startElement) => {
            const startElIdComponents = startElement.id.split("_");
            const startElFinalIndexes = startElIdComponents.slice(0, -2);
            const startElVeljvoElements =
              startElement?.getAttribute("data-arr")?.split(",") ?? [];
            const startVeljvoElementComponents =
              startElVeljvoElements?.[0]?.split(/(?=[0-9]+)/) ?? [];
            if (
              startElVeljvoElements?.length === 1 &&
              startElFinalIndexes.length === targetFinalIndex.length &&
              startElFinalIndexes.join("_") === targetFinalIndex.join("_") &&
              targetVeljvoElements.filter((targetVeljvoElement) => {
                const targetVeljvoElementComponents =
                  targetVeljvoElement.split(/(?=[0-9])/);
                return (
                  startVeljvoElementComponents[0].indexOf(
                    targetVeljvoElementComponents[0]
                  ) === 0 &&
                  startVeljvoElementComponents[1] ===
                    targetVeljvoElementComponents[1]
                );
              }).length > 0 &&
              (WeCanSeeThisElement || kahe_sezgana(startElement))
            ) {
              let color = startElement?.getAttribute("data-color");
              color = `hsla(${color},100%,70%,0.62)`;

              const arrow = generateArrow({
                from: startElement as HTMLElement,
                to: target as HTMLElement,
                arrowHeadSize: 5,
                color,
              });

              document.body?.appendChild(arrow);
            }
          });
        }
      });
    },
    force === true ? 450 : 0
  ) as unknown as number;
}

worker.onmessage = (ev) => {
  console.log("res", new Date().getTime());

  const { data } = ev;
  const { kind, cmene } = data;
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
  } else if (kind == "loader") {
    if (
      [
        "startLanguageDirectionUpdate",
        "completeChunkInsertion",
        "completeLanguageDirectionUpdate",
      ].includes(cmene)
    ) {
      // if (
      //   [
      //     "completeChunkInsertion",
      //   ].includes(cmene)
      // )
      //   try {
      //     console.log('in flight!');
      //     worker.postMessage({
      //       kind: "newSearch",
      //       ...JSON.parse(JSON.stringify(state.displaying)),
      //       versio: "masno",
      //       loadingState: JSON.parse(JSON.stringify(stateLoading)),
      //     });
      //   } catch (error) {
      //     console.log(error, state.displaying);
      //   }
      if (
        data.banguRaw === state.displaying.bangu ||
        data.completedRows === 0 ||
        data.completedRows === data.totalRows
      ) {
        if (
          data.completedRows === data.totalRows ||
          !twoJsonsAreEqual(stateLoading.displaying, state.displaying)
        ) {
          stateLoading.loading = true;
          stateLoading.displaying = { ...state.displaying };
        }
      }
      stateLoading.completedRows = data.completedRows;
      stateLoading.totalRows = data.totalRows;
      stateLoading.innerText =
        "🗃️ " + ((supportedLangs as any)[data.bangu]?.n ?? data.bangu);
    } else if (cmene === "loaded") {
      fetchAndSaveCachedListValues({ mode: "ca'o" });
      postQuery();
    } else if (cmene === "bootingDb") {
      stateLoading.completedRows = 1;
      stateLoading.totalRows = 3;
      stateLoading.innerText = "🗃️ " + stateLeijufra.booting;
    }
    //todo: resize
    // calcVH();
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
            checkScrolledNearBottom(event);
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
              // ...rectuResults(),
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

      addJvoPlumbs(true);
    },
  }
);

const outpBlock = async () => {
  console.log("skicu", new Date().getTime());

  let reses = await skicu_roledovalsi({ appendToSearch: false });
  const content = document.getElementById("contentWrapper");
  if (content) content.scrollTop = 0;
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

async function getCacheObject(cacheObj: Cache): Promise<Cache> {
  if (!cacheObj) cacheObj = await caches.open("sutysisku");

  return cacheObj;
}

async function getOrFetchResource(url: string) {
  const match = await (await getCacheObject(cacheObj)).match(url);
  if (match) return true;
  const response = await fetch(url);
  if (!response.ok) return false;
  cacheObj?.put(url, response);
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

function basna({
  text,
  query,
}: {
  text: string;
  query: string[];
}): HTMLElement[] {
  if (query.length === 0 || (query.length === 1 && query[0].length <= 2))
    return [h("span", { innerText: text })];
  const { arrQuery, regex } = getMemoizedBasna(query);

  if ((arrQuery ?? []).length === 0) return [h("span", { innerText: text })];

  return hilite([{ value: text, type: "simple" }], arrQuery).map(
    (el: DefRenderedElement, index: number) => {
      // console.log(el);
      if (el.type === "hilite") {
        return h("mark", {
          class: ["basna"],
          innerText: el.value,
        });
      } else {
        return h("span", { innerText: el.value });
      }
    }
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
import { getBoxToBoxArrow } from "./libs/arrows";

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
  index: string;
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

function hilite(els: DefRenderedElement[], query: string[]) {
  return els.reduce((acc: DefRenderedElement[], el: DefRenderedElement) => {
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
}): {
  tergeha: HTMLElement;
  hasExpansion: boolean;
  stringifiedPlaceTags?: string[];
} {
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
        ),
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
              "list-style-image": "url(../assets/pixra/certu.svg)",
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
        ),
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

  const renewed = [{ type: "simple", value: text } as DefRenderedElement]
    .reduce((acc: DefRenderedElement[], el: DefRenderedElement) => {
      return acc.concat(
        hilite(
          textToTaggedArray(el, [
            regexTeX,
            regexTeXQuotation,
            regexIntraLink,
            regexImageLink,
            regexHyperLink,
          ]),
          query
        )
      );
    }, [] as DefRenderedElement[])
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
    .map((el: DefRenderedElement) => {
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
      } else if (el.type === regexTeXQuotation.tagName) {
        return h("code", { innerText: el.value.replace(/``(.*?)''/g, "$1") });
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

  // TODO
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

  // TODO: list of placetags
  return {
    tergeha: h("div", ...renewed),
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
            : `../assets/pixra/xraste/${encodeURIComponent(def.d ?? "")}`
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
        const inDefSelmahoElement = h(
          "button",
          {
            class: "xp-btn tutci tutci-sampu",
            click: () => {
              state.displaying.versio = "selmaho";
              state.displaying.query = selmaho;
            },
          },
          ...basna({ text: selmaho, query: [query] })
        );
        selms.appendChild(inDefSelmahoElement);
      }
    }
  }
  let hasTranslateButton = false;
  let children: HTMLElement[];
  if (
    stateLeijufra.lojbo &&
    def.t !== stateLeijufra.bangudecomp &&
    seskari !== "fanva" &&
    (plukaquery(def.w) == query || seskari == "velcusku")
  ) {
    hasTranslateButton = true;
    children = basna({
      text: def.q || def.w,
      query: [query],
    });
  } else {
    children = [
      h(
        "a",
        {
          class: "valsi",
          attributes: {
            href: buildURLParams({
              seskari: seskari === "fanva" ? "catni" : seskari,
              sisku: encodeUrl(def.w),
              bangu,
              versio: "masno",
            }),
          },
        },
        ...basna({
          text: def.w,
          query: [query],
        })
      ),
    ];
  }

  const word = h(
    "h4",
    {
      class: ["valsi"],
      attributes:
        def.d && !def.nasezvafahi
          ? { "data-valsi": encodeValsiForWeb(def.w) }
          : {},
    },
    ...children
  );

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
    tergeha: HTMLElement;
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
        tergeha: h("img", {
          src:
            def.d.indexOf("../") === 0
              ? def.d
              : `../assets/pixra/xraste/${encodeURIComponent(
                  typeof def.d === "string" ? def.d : ""
                )}`,
        }),
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
      : [];
  if (famymahos.length > 0)
    heading.appendChild(
      h(
        "h4",
        { class: "tfm" },
        ...famymahos.map((child) =>
          h(
            "span",
            { class: ["italic", "sup"] },
            h("a", {
              href: `#seskari=${seskari}&sisku=${encodeUrl(
                child
              )}&bangu=${bangu}&versio=masno`,
              innerText: child,
            })
          )
        )
      )
    );

  if (jvs) {
    const inDefElement = h("div", { class: "sampu noselect" });
    inDefElement.appendChild(jvs);
    jvs = inDefElement;
  }

  let jvo;

  if (
    def.t === "lujvo" &&
    (def.rfs || []).length > 0 &&
    prettifiedDefinition.hasExpansion
  ) {
    jvo = h("button", {
      style: { "background-image": "url(../assets/pixra/shuffle.svg)" },
      class: [
        "tutci",
        "tutci-pixra",
        "xp-btn",
        "jvo_plumber",
        state.jvoPlumbsOn ? "tutci-hover" : null,
      ],
      click: addJvoPlumbs,
    });
  }

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

  heading.appendChild(
    h("button", {
      class: ["tutci", "tutci-pixra", "xp-btn"],
      style: { "background-image": "url(../assets/pixra/fukpi.svg)" },
      click: () => {
        copyToClipboard([def.w, def.d, def.n].filter(Boolean).join("\r\n"));
      },
    })
  );

  if (def.semMaxDistance ?? Infinity <= 1) {
    const innerText = `${Math.round(
      parseFloat((def.semMaxDistance ?? Infinity).toPrecision(2)) * 100
    )}%`;
    heading.appendChild(
      h("div", {
        innerText,
        class: ["tutci", "tutci-sampu", "xp-btn", "klesi", "noselect"],
        click: () => {
          stateLoading.innerText = interpolate(stateLeijufra.distance || "", {
            distance: innerText,
          });
          stateLoading.hideProgress = true;
          stateLoading.loading = true;
          //   setTimeout(() => {
          //     stateLoading.loading = true;
          // }, 4000);
        },
      })
    );
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
      // click: () => window.send_muplis_feedback(def),
      innerText: stateLeijufra.report_feedback,
    });
    out.appendChild(row);
  }

  if (def.d) {
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
        h(
          "div",
          {
            class: "definition valsi",
          },
          prettifiedDefinition.tergeha
        )
      );
    }
  }

  if (def.n) {
    out.appendChild(
      h(
        "div",
        {
          class: ["notes", "valsi"],
        },
        melbi_uenzi({
          text: def.n,
          fullDef: def,
          query: state.embeddings.length > 0 ? state.embeddings : [query],
          type: "n",
          index,
          stringifiedPlaceTags,
        }).tergeha
      )
    );
  }
  if ((def.r || []).length > 0) {
    const tanxe_leirafsi = h("div", { class: "rafsi noselect" });

    const rafcme = h("div", {
      class: "tanxe zunle_tanxe",
      innerText: stateLeijufra.rafsi || "rafsi",
    });
    tanxe_leirafsi.appendChild(rafcme);

    const children = (def.r ?? []).map((el) => {
      return h(
        "span",
        {
          class: "pamei",
        },
        ...basna({
          text: el,
          query: [query],
        })
      );
    });
    const rafsi = h("div", { class: "tanxe pritu_tanxe" }, ...children);

    tanxe_leirafsi.appendChild(rafsi);
    out.appendChild(tanxe_leirafsi);
  }
  if (def.b) {
    const tanxe_leirafsi = h(
      "div",
      { class: "rafsi noselect hue_rotate" },
      h("div", {
        class: "tanxe zunle_tanxe kurfa_tanxe",
        innerText: "BAI",
      }),
      h(
        "div",
        { class: "tanxe pritu_tanxe kurfa_tanxe" },
        ...(def.b ?? []).map((el) => {
          const rafElem = h(
            "span",
            {
              class: "pamei",
            },
            h(
              "a",
              {
                class: `hue_rotate_back a-${seskari}`,
                href: `#seskari=${seskari}&sisku=${encodeUrl(
                  el
                )}&bangu=${bangu}&versio=masno"`,
              },
              ...basna({
                text: el,
                query: [query],
              })
            )
          );
          return rafElem;
        })
      )
    );

    out.appendChild(tanxe_leirafsi);
  }

  const subDefs = h("div", {
    class: ["definition", "subdefinitions"],
  });
  for (const [i, subdef] of (def.rfs || []).entries()) {
    const htmlElement = await skicu_paledovalsi({
      def: subdef,
      inner: true,
      index: `${index}_${i}`,
      stringifiedPlaceTags,
    });
    if (htmlElement) subDefs.appendChild(htmlElement);
  }
  out.appendChild(subDefs);

  out.addEventListener("click", clicked);
  return out;
}

function copyToClipboard(value: string) {
  navigator.clipboard.writeText(value);
  stateLoading.innerText = stateLeijufra.copied;
  stateLoading.hideProgress = true;
}

function interpolate(str: string, params: Dict) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${str}\`;`)(...vals);
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
  if (["velcusku", "cnano", "catni", "rimni", "fanva"].includes(params.seskari))
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
  for (const i in newState)
    state.displaying[i as keyof typeof state.displaying] = newState[i];

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

  return await Promise.all(
    stateRAM.results.slice(0, displayUpTo).reduce(
      (acc, resultEl, index) => {
        const htmlTermBlock = skicu_paledovalsi({
          def: JSON.parse(JSON.stringify(resultEl as Def)),
          // length: state.results.length,
          inner: false,
          stringifiedPlaceTags: [],
          index: index.toString(),
        });
        if (htmlTermBlock) acc.push(htmlTermBlock);

        return acc;
      },
      [] as Promise<HTMLDivElement | undefined>[]
    )
  );
}
