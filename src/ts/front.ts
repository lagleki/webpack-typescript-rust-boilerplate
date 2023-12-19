import { component, store, h, s } from "../../../renderer/src";
import { rows } from "./utils/pronunciation";
import tejufra from "./worker/template/tejufra.json";
import * as ceha from "./utils/ceha";
import { getBoxToBoxArrow } from "./libs/arrows";
import { log } from "./libs/logger";
import to from "await-to-js";

import katex from "katex";

// import io from "socket.io-client";
import {
  // listFamymaho,
  // modes,
  supportedLangs,
  initState,
  positionScrollTopToggleBtn,
  listFamymaho,
  initStateLoading,
  initStateOutsideComponents,
  regexTeX,
  regexIntraLink,
  regexImageLink,
  regexHyperLink,
  regexTeXQuotation,
  cisn_default,
  tiles,
  secondarySeskari,
  lei_morna,
} from "./consts";
import {
  BasnaMemoized,
  Def,
  DefRenderedElement,
  Dict,
  RegexFlavours,
  State,
} from "./types";
import {
  cloneObject,
  fetchTimeout,
  getRandomValueFromArray,
} from "./utils/fns";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

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
const stateOutsideComponents = store(initStateOutsideComponents, {
  eventKey: "RAM",
});

let state = store(
  {
    ...initState,
    displaying: { ...initState.displaying, ...generateStateFromUrl() },
  },
  { eventKey: "sutysisku-state", localCacheKey: "sutysisku-state" }
);

const stateLoading = store(initStateLoading, { eventKey: "sutysisku-loading" });
ninynaha();

const tejufraCustom = getTejufra();
const stateLeijufra = store(tejufraCustom ?? { ...tejufra.en, name: "en" }, {
  eventKey: "sutysisku-jufra",
});

// //worker
const worker = new Worker(new URL("./worker/worker", import.meta.url));
onLoad();

async function onLoad() {
  if ("serviceWorker" in navigator) {
  } else if (location.protocol === "https:") {
    alert(
      "Your browser is not supported. Please, upgrade to the latest Chrome / Firefox / Safari and don't use the app in incognito / private browsing mode (it needs to save dictionary data to disk to work successfully)."
    );
  } else {
    alert("HTTP protocol, la sutysisku won't work.");
    log("http protocol, service worker won't work");
  }
  await fetchAndSaveCachedListValues({ mode: "co'a" });
  log({ crossOriginIsolated: window.crossOriginIsolated });

  worker.postMessage({
    kind: "fancu",
    cmene: "ningau_lesorcu",
    ...state.displaying,
    leijufra: cloneObject(stateLeijufra),
  });
}

function ningau_lepasorcu(url: string, bangu: string) {
  stateLoading.showDesktop = false;
  postQuery();
  if (url.indexOf("http") === 0) return;
  worker.postMessage({
    kind: "fancu",
    cmene: "ningau_lepasorcu",
    ...state.displaying,
    bangu,
    leijufra: cloneObject(stateLeijufra),
  });
}

async function getCachedListKeys() {
  return await (await getCacheStore(cacheObj)).keys();
}

async function fetchAndSaveCachedListValues({ mode }: { mode: string }) {
  const cachedList = await getCachedListKeys();
  const initialCacheListLength = cachedList.length;

  let [, response]: [unknown, Response | undefined] = await to(
    fetchTimeout(`/data/tcini.json?sisku=${new Date().getTime()}`)
  );
  if (!response?.ok) {
    if (initialCacheListLength === 0)
      alert("Are you offline? We can't fetch the source.");
    stateLoading.loading = false;
    return false;
  }
  const vreji = (await response.json()).vreji.map(
    (v: string) =>
      new URL(v, window.location.origin + window.location.pathname).href
  );
  let cacheUpdated = false;
  const objCache = await getCacheStore(cacheObj);
  for (let i = 0; i < vreji.length; i++) {
    const url = vreji[i];
    if (mode === "co'a" && !/((\.(js|wasm|html|css))|\/)$/.test(url)) continue;
    const isInCache = await objCache.match(url);
    if (!isInCache) {
      try {
        await objCache.add(url);
      } catch (error) {}
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
      log({ event: "removing cache", url: key.url });
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
      log({ event: "adding cache", url });
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

function dispatchCitri() {
  if (
    ["fanva", "velcusku"].includes(state.displaying.seskari) ||
    state.displaying.query === ""
  )
    return;
  const citri = cloneObject(state.citri);
  let i = 0;
  for (i = 0; i < citri.length; i++) {
    if (
      citri[i].query === state.displaying.query &&
      citri[i].seskari === state.displaying.seskari
    ) {
      citri.splice(i, 1);
      break;
    }
  }
  citri.unshift({ ...state.displaying });
  state.citri = citri.slice(0, 10);
}

function updateState(src: any, trg: any) {
  Object.keys(src).forEach((key) => {
    trg[key] = src[key];
  });
}

function getTejufra() {
  const tejufraCustom = (tejufra as any)[state.displaying.bangu] ?? {};
  if (state.displaying.bangu === "en") return { ...tejufraCustom, name: "en" };
  const target = structuredClone(tejufra.en);
  updateState(tejufraCustom, target);
  return { ...target, name: state.displaying.bangu };
}

function postQuery() {
  console.log(
    "ppp",
    state.displaying.query,
    twoJsonsAreEqual(state.displaying, stateOutsideComponents.fetched),
    state.displaying,
    stateOutsideComponents.fetched
  );
  if (state.displaying.bangu !== stateLeijufra.name) {
    const tejufraCustom = getTejufra();
    updateState(tejufraCustom, stateLeijufra);
  }
  if (
    state.displaying.query &&
    !twoJsonsAreEqual(state.displaying, stateOutsideComponents.fetched) &&
    !twoJsonsAreEqual(state.displaying, stateOutsideComponents.sent)
  ) {
    console.log(
      "posty",
      new Date().getTime(),
      state.displaying.query,
      stateOutsideComponents.fetched.query
    );
    removePlumbs();
    stateOutsideComponents.sent = cloneObject(state.displaying);
    worker.postMessage({
      kind: "newSearch",
      ...state.displaying,
      leijufra: cloneObject(stateLeijufra),
    });
    dispatchCitri();
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

function cahojapuhosezgana(el: Element) {
  const rect = el.getBoundingClientRect();
  const height = window.innerHeight || document.documentElement.clientHeight;
  return (
    rect.top >= height * -1 &&
    rect.left >= 0 &&
    rect.bottom <= height * 2 &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
function addPlumbs(root = document.body) {
  //plumbs for in-terbri interactions
  root.querySelectorAll("[data-from]").forEach((target) => {
    const targetPrefix = target.id.split("_").slice(0, -1).join("_");
    if (kahe_sezgana(target)) {
      Array.from(
        root.querySelectorAll(`[data-arr=${target.getAttribute("data-from")}]`)
      )
        .slice(0, 1)
        .forEach((from) => {
          if (from.id.split("_").slice(0, -1).join("_") === targetPrefix) {
            let color = from.getAttribute("data-color");
            color = `hsla(${color},100%,70%,0.62)`;
            const arrow = generateArrow({
              from: from as HTMLElement,
              to: target as HTMLElement,
              arrowHeadSize: 5,
              color,
              height: "100%",
            });
            document.body?.appendChild(arrow);
          }
        });
    }
  });
}

function generateArrow({
  from,
  to,
  arrowHeadSize = 10,
  color = "color",
  height,
}: {
  from: HTMLElement;
  to: HTMLElement;
  arrowHeadSize: number;
  color: string;
  height?: string;
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
      height: height ?? `${from.offsetTop + from.offsetHeight}px`,
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

async function scrollNearBottom({ target }: Event) {
  const content = target as HTMLElement;
  const btnScrollToTop = document.getElementById("scrollToTop") as HTMLElement;
  btnScrollToTop.className =
    content.scrollTop > positionScrollTopToggleBtn
      ? "d-block"
      : "d-block dizlo";
  if (state.displaying.query === "") return;
  // if (scrollTimer !== null) {
  //   clearTimeout(scrollTimer)
  // }
  // if (stateRAM.scrollJvoTimer !== null) {
  //   clearTimeout(stateRAM.scrollJvoTimer)
  // }
  addJvoPlumbs();
  setTimeout(() => {
    addAudioLinks();
  }, 250);
  const element = target as HTMLElement;

  const scrollTop = element.scrollTop;
  const scrollHeight = element.scrollHeight;
  const clientHeight = element.clientHeight;

  const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

  if (scrollPercentage >= 90) {
    if (stateOutsideComponents.results.length > state.jimte) state.jimte += 10;
  }
}

type AudioCache = { [key: string]: { audio: string; date: number } };

function retainLatestRecords(obj: AudioCache, trimUpTo = 10): AudioCache {
  // Convert the object to an array of tuples
  const entries = Object.entries(obj);

  // Sort the tuples by the `date` field in descending order
  const sorted = entries.sort((a, b) => b[1].date - a[1].date);

  // Take the first 10 tuples
  const latest = sorted.slice(0, trimUpTo);

  // Convert the tuples back to an object
  const result: AudioCache = {};
  for (const [key, value] of latest) {
    result[key] = value;
  }

  return result;
}

function encodeValsiForWeb(v: string) {
  return encodeURIComponent(v).replace(/ /g, "_");
}

function setAudio(text: string, audio: string) {
  const cache: AudioCache = JSON.parse(
    localStorage.getItem("cachedAudio") ?? "{}"
  );

  cache[text] = { audio, date: new Date().getTime() };
  const trimmedCache = retainLatestRecords(cache, 50);
  localStorage.setItem("cachedAudio", JSON.stringify(trimmedCache));
}

function extractFromJson(jsonObj: Dict, keys: string[]): Dict {
  return Object.keys(jsonObj)
    .filter((key) => keys.includes(key))
    .reduce((obj: Dict, key) => {
      obj[key] = jsonObj[key];
      return obj;
    }, {});
}

async function getAudio(valsis: string[]): Promise<Dict> {
  const audios: Dict = JSON.parse(localStorage.getItem("cachedAudio") ?? "{}");
  return extractFromJson(audios, valsis);
}

async function addAudioLinks() {
  const els = Array.from(
    document.querySelectorAll(":not(.na_eisesance)[data-valsi]")
  );

  let valsis = [];
  for (let el of els) {
    if (!cahojapuhosezgana(el)) continue;
    const valsi = el.getAttribute("data-valsi");
    if (valsi) valsis.push(valsi);
  }

  const sanceDict = await getAudio(valsis);

  for (const valsi of valsis) {
    if (sanceDict[valsi]) continue;
    const urli = `${process.env.DUMPS_URL_ROOT}/data/sance/${encodeValsiForWeb(
      valsi
    )}.ogg`;
    let [, res]: [unknown, Response | undefined] = await to(
      fetchTimeout(urli, 5000, { cache: "no-store" })
    );
    if (!res?.ok) continue;
    const blob = await res.blob();
    const base64: string = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        const base64data = reader.result;
        resolve(base64data as string);
      };
    });
    sanceDict[valsi] = base64;
    setAudio(valsi, base64);
  }
  state.lei_sance = sanceDict;
}

function addJvoPlumbs() {
  clearTimeout(stateOutsideComponents.timers.scrollJvoTimer);
  removePlumbs();
  stateOutsideComponents.timers.scrollJvoTimer = setTimeout(() => {
    window.requestAnimationFrame(() => {
      if (!state.jvoPlumbsOn) return;
      addPlumbs();
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
        targetedEls.forEach((startElement) => {
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
  }, 100) as unknown as number;
}

worker.onmessage = (ev) => {
  console.log("res", new Date().getTime());

  const { data } = ev;
  const { kind, cmene } = data;
  if (kind == "searchResults") {
    state.jimte = initState.jimte;
    stateOutsideComponents.results = data.results;
    state.displaying = data.req;
    console.log(
      "res+state0",
      data.results.length,
      data.req.query,
      new Date().getTime()
    );
    stateOutsideComponents.fetched = structuredClone(data.req);
    stateOutsideComponents.morna = stateLoading.loading
      ? lei_morna[0]
      : getRandomValueFromArray(lei_morna);

    state.embeddings = data.embeddings ?? [];
    stateLoading.showDesktop = false;
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
      stateLoading.dbUpdated = true;
      fetchAndSaveCachedListValues({ mode: "ca'o" });
      postQuery();
    } else if (cmene === "bootingDb") {
      stateLoading.completedRows = 1;
      stateLoading.totalRows = 3;
      stateLoading.innerText = "🗃️ " + stateLeijufra.booting;
    }
  }
};

function buildURLParams(
  params: State,
  options: { retainSeskariFromFallingBack: boolean } = {
    retainSeskariFromFallingBack: false,
  }
) {
  if (
    !options.retainSeskariFromFallingBack &&
    secondarySeskari.includes(params.seskari)
  )
    params.seskari = "cnano";

  const { query, ...rest } = params;
  return "#" + new URLSearchParams({ ...rest, sisku: query }).toString();
}

function encodeUrl(uenzi: string) {
  //for bookmarkable urls
  return encodeURIComponent((uenzi || "").replace(/ /g, "_")).replace(
    /'/g,
    "%27"
  );
}

function debounce<F extends (...params: any[]) => void>(
  fn: F,
  delay: number,
  obj: any,
  key: string
) {
  return function (this: any, ...args: any[]) {
    clearTimeout(obj[key]);
    obj[key] = window.setTimeout(() => fn.apply(this, args), delay);
  } as F;
}

function setDocumentTitle(state: Dict) {
  document.title = [state.query, "la sutysisku"].filter(Boolean).join(" - ");
}

function setStateFromInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  state.displaying.query = input.value;
  postQuery();
  const urlState = generateStateFromUrl();
  if (
    urlState.query !== state.displaying.query ||
    urlState.bangu !== state.displaying.bangu
  ) {
    history.pushState("", "", buildURLParams(state.displaying));
  }
}

window.addEventListener("hashchange", () => setStateFromUrl());
window.addEventListener("resize", () => {
  addJvoPlumbs();
  addAudioLinks();
});
window.addEventListener("keyup", handlerFocus);
function handlerFocus({ key }: KeyboardEvent) {
  if (key === "/") document.getElementById("ciska")?.focus();
}

//always show dasri thats all
component(
  "#root",
  async () => {
    const inFetching =
      !twoJsonsAreEqual(state.displaying, stateOutsideComponents.fetched) &&
      state.displaying.query !== "";
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
            `${
              stateLoading.showDesktop ? "cnano" : state.displaying.seskari
            }-dasri`,
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
            h("input#ciska", {
              class: inFetching ? ["granim-css", "in-fetching"] : [],
              "aria-label": stateLeijufra.seskari.cnano,
              required: true,
              placeholder: stateLeijufra.bangusisku,
              spellcheck: "false",
              autocapitalize: "off",
              autocomplete: "off",
              type: "text",
              name: "focus",
              value:
                stateLoading.loading && state.displaying.query !== ""
                  ? null
                  : state.displaying.query,
              focus: () => {
                stateOutsideComponents.focused = 1;
                if (state.displaying.query !== "")
                  stateLoading.showDesktop = false;
              },
              input: (event: Event) => {
                debounce(
                  setStateFromInput,
                  1000,
                  stateOutsideComponents.timers,
                  "typing"
                )(event);
              },
            }),
            h("button#clear", {
              "aria-label": "clear",
              type: "reset",
              click: () => {
                state.displaying.query = "";
              },
              class: inFetching ? ["pulsate-css", "in-fetching"] : [],
            })
          ),
          h(
            "div#leitutci.xp-btn-list",
            ...["cnano", "catni", "rimni"].map((seskari) =>
              h(
                `a#${seskari}`,
                {
                  href: buildURLParams(
                    {
                      ...state.displaying,
                      versio: "masno",
                      seskari,
                    },
                    { retainSeskariFromFallingBack: true }
                  ),
                  click: () => {
                    stateLoading.showDesktop = false;
                    addPyro();
                  },
                  class: [
                    // "osx",
                    // "primary",
                    "xp-btn",
                    "ralju-tutci",
                    `${seskari}-ralju-tutci`,
                    ...(state.displaying.seskari === seskari &&
                    !stateLoading.showDesktop
                      ? ["tutci-hover"]
                      : []),
                  ],
                },
                h("span", { textContent: stateLeijufra.seskari[seskari] })
              )
            )
          ),
          stateLoading.pyro && h("div", { class: ["pyro"] }),
          h(
            "span.hat-button",
            {
              click: () => {
                stateLoading.showDesktop = true;
                stateOutsideComponents.focused = 0;
                removePlumbs();
                addPyro();
              },
              "aria-label": "la sutysisku",
              class: [
                `${
                  stateLoading.showDesktop
                    ? `desktop`
                    : `${state.displaying.seskari}-search`
                }-mode-title-color`,
              ],
            },
            h("div.terdi", {
              class: inFetching ? [] : ["deha"],
              style:
                state.displaying.seskari === "rimni"
                  ? { filter: "sepia(1.0)" }
                  : {},
              alt: "language-switch",
            })
            // h("span", {
            //   style: { color: "#fff" },
            //   "data-jufra": "titlelogo-inner",
            //   textContent: "la sutysisku",
            // })
          ),
          stateLoading.pyro && h("div", { class: ["pyro"] })
        )
      ),
      h(
        "div.loading.noselect",
        h("span", {
          class: "romoi_lehiseciska",
          innerText: state.citri.length > 0 ? stateLeijufra.purc : null,
        }),
        ...state.citri.map(({ seskari, versio, query, bangu }) => {
          if (seskari === "velcusku") return;
          const curState = {
            seskari,
            versio,
            query,
            bangu,
          };
          const isCurrentQuery = twoJsonsAreEqual(curState, state.displaying);
          const class_ = [
            "citrycmi",
            isCurrentQuery
              ? ["a-cabna"]
              : `a-${versio !== "masno" ? versio : seskari}`,
          ];
          if (isCurrentQuery)
            return h("span", { innerText: query, class: class_ });
          if (query.length > 13)
            return h("span", {
              class: class_.concat("pointer"),
              innerText: query,
              attributes: {
                "data-id": `citrycmi_coclani_${query}`,
              },
              click: () => {
                hideNotificationInAWhile(() => {
                  stateLoading.innerText = query;
                  stateLoading.href = buildURLParams(curState, {
                    retainSeskariFromFallingBack: true,
                  });
                  stateLoading.hideProgress = true;
                });
              },
            });
          return h("a", {
            class: class_,
            attributes: {
              href: buildURLParams(curState, {
                retainSeskariFromFallingBack: true,
              }),
            },
            innerText: query,
          });
        })
      ),
      stateLoading.loading &&
        h(
          "div#loading.loading.noselect",
          h(
            "div.loading_container",
            stateLoading.innerText &&
              (stateLoading.href
                ? h("a.bangu_loading.loading_elems", {
                    innerText: stateLoading.innerText,
                    href: stateLoading.href,
                    click: () => {
                      stateLoading.loading = false;
                    },
                  })
                : h("div.bangu_loading.loading_elems", {
                    innerText: stateLoading.innerText,
                  })),
            !stateLoading.hideProgress &&
              h(
                "div#cpacu.loading_elems",
                h("span#kernelo_lo_cpacu", {
                  style: {
                    width: `${Math.min(
                      100,
                      Math.max(
                        10,
                        (stateLoading.completedRows * 100) /
                          stateLoading.totalRows
                      )
                    )}%`,
                  },
                })
              )
          )
        ),
      // stateLoading.loading === false &&
      //   state.displaying.seskari === "cnano" &&
      //   (supportedLangs as any)[state.displaying.bangu as any]
      //     .semanticSearchPossible &&
      //   h(
      //     "div.loading.noselect",
      //     { class: ["d-inline-flex"] },
      //     h("span.bangu_loading.loading_elems.noselect.nasezvafahi", {
      //       innerText: stateLeijufra.alerts.semanticSearchAlert,
      //     })
      //   ),
      // stateLoading.loading === false &&
      //   state.displaying.seskari === "rimni" &&
      //   stateLeijufra.alerts?.rhymesSearchAlert &&
      //   h(
      //     "div.loading.noselect",
      //     { class: ["d-inline-flex"] },
      //     h("span.bangu_loading.loading_elems.noselect.nasezvafahi", {
      //       innerText: stateLeijufra.alerts.rhymesSearchAlert,
      //     })
      //   ),
      h(
        "div#contentWrapper",
        {
          style: {
            paddingBottom: stateLoading.loading ? "28px" : 0,
          },
          scroll: (event: Event) => {
            removePlumbs();
            debounce(
              scrollNearBottom,
              250,
              stateOutsideComponents.timers,
              "scroll"
            )(event);
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
              "div#rectu",
              ...(stateLoading.showDesktop
                ? [
                    h("div.drata", ...links()),
                    h(
                      "div.descr",
                      // {
                      //   class: stateLoading.showDesktop ? ["d-block"] : ["d-none"],
                      // },
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
                                            audio.pause();
                                            audio.src = `/assets/sance/lerfu/${encodeURIComponent(
                                              col.replace(
                                                /.*<b>(.*?)<\/b>.*/g,
                                                "$1"
                                              )
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
                  ]
                : [await outpBlock({ inFetching })])
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
      ),
      sihesle()
    );
  },
  {
    eventKeys: ["sutysisku-state", "sutysisku-loading", "sutysisku-jufra"],
    afterRender: ({ newStateAmendments, previousState, eventKey }) => {
      // console.warn("afterrr", { newStateAmendments, previousState, eventKey });
      if (
        Object.keys(newStateAmendments ?? {}).length === 1 &&
        newStateAmendments.lei_sance
      )
        return;

      if (
        eventKey === "sutysisku-state" &&
        newStateAmendments?.displaying !== undefined &&
        // !twoJsonsAreEqual(
        //   newStateAmendments.displaying,
        //   previousState.displaying
        // )
        // &&
        twoJsonsAreEqual(state.displaying, stateOutsideComponents.fetched)
      ) {
        const content = document.getElementById("contentWrapper");
        if (content) content.scrollTop = 0;
      }
      if (stateLoading.dbUpdated) {
        addJvoPlumbs();
        addAudioLinks();
      }

      document
        .getElementById("ciska")
        ?.[stateOutsideComponents.focused ? "focus" : "blur"]();
    },
  }
);

async function ninynaha() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  if (day >= 340 || day < 10) {
    stateLoading.ninynaha = true;
  } else {
    stateLoading.ninynaha = false;
  }
}

const rnd = (max: number, min = 1) => ((Math.random() * max) / min).toFixed(2);

function addPyro() {
  if (stateLoading.ninynaha && Math.random() > 0.618) {
    stateLoading.pyro = true;
    setTimeout(() => {
      stateLoading.pyro = false;
    }, 2900);
  }
}

const rnds = Array.from({ length: 6 }, () => [rnd(100), rnd(30), rnd(3)]);
function sihesle() {
  if (!stateLoading.ninynaha) return;
  return h(
    "div#sihesle",
    {
      class: ["leisihesle"],
      attributes: {
        "aria-hidden": true,
      },
    },
    ...Array(3)
      .fill(["❅", "❆"])
      .flat()
      .map((_, index) =>
        h(`div`, {
          class: ["sihesle"],
          style: {
            left: `${rnds[index][0]}%`,
            "animation-delay": `${rnds[index][1]}s, ${rnds[index][2]}s`,
          },
          innerText: _,
        })
      )
  );
}

const outpBlock = async ({ inFetching }: { inFetching: boolean }) => {
  console.log("skicu", new Date().getTime());

  let results = await skicu_roledovalsi();
  console.log("after skicu", new Date().getTime(), "aft");

  setDocumentTitle(state.displaying);

  const messageAlert = (stateLeijufra as any).alerts?.[
    state.displaying.seskari
  ];
  return h(
    "div#outp",
    {
      class: stateLoading.showDesktop ? ["d-none"] : ["d-block"],
    },
    // !inFetching &&
    messageAlert &&
      h(
        `div.term.noselect.nasezvafahi.alert-${state.displaying.seskari}.alert-block`,
        {
          innerText: messageAlert,
        }
      ),
    h("div", ...results)
  );
};

const links = () =>
  cloneObject(stateLeijufra.custom_links ?? [])
    .concat(["hr", ...tiles])
    .map((elem: Dict | string) => {
      if (typeof elem === "string")
        return h("div.term.noselect.nasezvafahi.centero", {
          innerText: stateLeijufra.alerts.bauledrata,
        });
      const name = Object.keys(elem)[0];
      if (!elem[name].url) {
        elem[name].url = buildURLParams({
          ...state.displaying,
          bangu: name,
          versio: "masno",
        });
      } else {
        elem[name].url = elem[name].url.replace(
          /{lastQuery}/g,
          encodeUrl(state.displaying.query)
        );
      }

      return tile({
        ...elem[name],
        name,
        isUrl: (elem.url || "").indexOf("http") === 0,
        height: (elem.height || 1) * cisn_default + "px",
        width: (elem.width ?? 1) * cisn_default + "px",
      });
    });

function tile({
  title,
  name,
  url,
  picture,
  isUrl,
  height,
  width,
}: {
  title: string;
  name: string;
  url: string;
  picture: string;
  isUrl: boolean;
  height: string;
  width: string;
}) {
  return h(
    "div",
    {
      class: "DIV_1",
      style: { height, width },
    },
    h(
      "div",
      {
        class: "DIV_2",
        style: {
          height,
          width,
        },
      },

      h(
        "span",
        {
          class: "SPAN_3",
          style: { width: "auto" },
        },
        h("b", { class: "B_4", innerHTML: title })
      ),
      h(
        "a",
        {
          rel: isUrl ? "noreferrer" : "",
          target: isUrl ? "_blank" : "",
          "aria-label": title.replace(/<[^>]+?>/g, ""),
          click: () => ningau_lepasorcu(url, name),
          href: url,
          class: "A_7",
        },
        h("div", {
          class: "DIV_8",
          style: { "background-image": `url(${picture})` },
        })
      )
    )
  );
}

async function getCacheStore(cacheObj: Cache): Promise<Cache> {
  if (!cacheObj) cacheObj = await caches.open("sutysisku");

  return cacheObj;
}

async function getOrFetchResource(url: string) {
  const match = await (await getCacheStore(cacheObj)).match(url);
  if (match) return true;
  let [, response]: [unknown, Response | undefined] = await to(fetch(url));
  if (!response?.ok) return false;
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
  let arrQuery = [
    ...new Set(
      query
        .concat(query.map((i) => i.replace(/'/g, "h")))
        .map((i) => escapeRegExp(i.trim().replace(/[\|\(\)\{\}<>]/g, ".")))
        .filter((i) => i.length > 2)
    ),
  ];
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
  const { arrQuery } = getMemoizedBasna(query);

  if ((arrQuery ?? []).length === 0) return [h("span", { innerText: text })];

  return hilite([{ value: text, type: "simple" }], arrQuery).map(
    (el: DefRenderedElement) => {
      if (el.type === "hilite") {
        return h("span", {
          class: ["basna"],
          innerText: el.value,
        });
      } else if (el.type === "simple") {
        return h("span.tergeha", { innerText: el.value });
      } else {
        return h("span", { innerText: el.value });
      }
    }
  );
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
    replacement: `\$${replacingPlaceTag}\$`,
  };
}

function getStringifiedPlacetag({
  fullDef,
  placeTag,
  dataArrAdded,
}: {
  fullDef: Def;
  placeTag: string;
  dataArrAdded: string[];
}): string {
  const clearedPlaceTag = placeTag.replace(/[^a-zA-Z0-9]/g, "");
  const isHead = (fullDef.rfs || []).length > 0;

  const objectVeljvoReplacement = getVeljvoString({
    isHead,
    placeTag,
    fullDef,
    dataArrAdded,
    clearedPlaceTag,
  });
  return objectVeljvoReplacement.stringifiedPlaceTag;
}

function convertMathStringToHtml({
  iterTerbricmiId,
  index,
  fullDef,
  jsonIds,
  type,
  placeTag,
  dataArrAdded,
  stringifiedPlaceTags,
  stringifiedSubDefPlaceTags,
  moreAttributes,
}: {
  iterTerbricmiId: number;
  index: string;
  fullDef: Def;
  jsonIds: Dict[];
  type: string;
  placeTag: string;
  dataArrAdded: string[];
  stringifiedPlaceTags: string[];
  stringifiedSubDefPlaceTags: string[];
  moreAttributes?: Dict;
}): {
  span: HTMLSpanElement;
  stringifiedPlaceTags: string[];
  stringifiedSubDefPlaceTags: string[];
  iterTerbricmiId: number;
} {
  iterTerbricmiId++;
  const combInd = `${index}_${iterTerbricmiId}`;
  const level = combInd.split("_").length;
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
  let newPlacetagType = false;
  let newSubPlacetagType = false;
  if (!stringifiedPlaceTags.includes(stringifiedPlaceTag)) {
    stringifiedPlaceTags.push(stringifiedPlaceTag);
    newPlacetagType = true;
  }
  if (level > 2 && !stringifiedSubDefPlaceTags.includes(stringifiedPlaceTag)) {
    stringifiedSubDefPlaceTags.push(stringifiedPlaceTag);
    newSubPlacetagType = true;
  }
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
        objectVeljvoReplacement.dataArr &&
        type === "d" &&
        (newPlacetagType || newSubPlacetagType)
          ? stringifiedPlaceTag
          : null,
      "data-color": !isHead ? number2ColorHue(number) : null,
      ...moreAttributes,
    },
  });
  katex.render(replacementTag.replace(/^\$/, "").replace(/\$$/, ""), span);
  return {
    span,
    iterTerbricmiId,
    stringifiedPlaceTags,
    stringifiedSubDefPlaceTags,
  };
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
  stringifiedSubDefPlaceTags,
}: {
  text: string | Dict;
  fullDef: Def;
  query: string[];
  type: string;
  index: string;
  stringifiedPlaceTags: string[];
  stringifiedSubDefPlaceTags: string[];
}): {
  tergeha: HTMLElement;
  hasExpansion: boolean;
  stringifiedPlaceTags?: string[];
  stringifiedSubDefPlaceTags?: string[];
} {
  const { bangu, seskari } = state.displaying;
  let hasExpansion = false;
  if (typeof text === "object") {
    if (fullDef.bangu.indexOf("-cll") >= 0) {
      const url =
        stateLeijufra.custom_links?.filter((i: any) => !!i.uncll)?.[0]?.uncll
          ?.url || "/";
      return {
        tergeha: h(
          "ul",
          {
            class: "uoldeliste",
            style: {
              "list-style-image": "url(/assets/pixra/cukta.svg)",
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
        stateLeijufra.custom_links?.filter((i: any) => !!i.introbook)?.[0]
          ?.introbook?.url || "/";
      return {
        tergeha: h(
          "ul",
          {
            class: "uoldeliste",
            style: {
              "list-style-image": "url(/assets/pixra/certu.svg)",
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

  const structuredDefinition = [
    { type: "simple", value: text } as DefRenderedElement,
  ]
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
        } else if (
          index < renewed.length - 2 &&
          renewed[index].type === "math" &&
          renewed[index + 1].value.trim() === "(property of" &&
          renewed[index + 2].type === "math"
        ) {
          const newEl = {
            ...el,
            meta: {
              from: renewed[index + 2].value,
            },
          } as DefRenderedElement;
          return acc.concat([newEl]);
        }
        return acc.concat([el]);
      },
      [] as DefRenderedElement[]
    )
    //convert to HTML
    .map((el: DefRenderedElement) => {
      if (el.type === regexTeX.tagName) {
        const moreAttributes: Dict = {};
        if (el.meta?.from) {
          moreAttributes["data-from"] = getStringifiedPlacetag({
            dataArrAdded,
            fullDef,
            placeTag: el.meta.from,
          });
        }
        const convertedChunk = convertMathStringToHtml({
          dataArrAdded,
          fullDef,
          index,
          iterTerbricmiId,
          jsonIds,
          placeTag: el.value,
          stringifiedPlaceTags,
          stringifiedSubDefPlaceTags,
          type,
          moreAttributes,
        });
        iterTerbricmiId = convertedChunk.iterTerbricmiId;
        stringifiedPlaceTags = convertedChunk.stringifiedPlaceTags;
        stringifiedSubDefPlaceTags = convertedChunk.stringifiedSubDefPlaceTags;
        return convertedChunk.span;
      } else if (el.type === regexTeXQuotation.tagName) {
        return h("code", { innerText: el.value.replace(/``(.*?)''/g, "$1") });
      } else if (el.type === "veljvocmiterjonmaho") {
        return h("span", { class: ["veljvocmiterjonmaho"], innerText: "=" });
      } else if (el.type === regexIntraLink.tagName) {
        const intralink = el.value.substring(1, el.value.length - 1);
        const curState = {
          seskari: curSeskari,
          query: intralink,
          bangu,
          versio: "masno",
        };
        return twoJsonsAreEqual(curState, state.displaying) &&
          !secondarySeskari.includes(state.displaying.seskari)
          ? h("b", { class: ["deitegerna"], innerText: intralink })
          : h("a", {
              class: `a-${curSeskari}`,
              href: buildURLParams(curState),
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
        return h("span", {
          class: ["basna"],
          innerText: el.value,
        });
      } else {
        return h("span", { innerText: el.value.replace(/\//g, " / ") });
      }
    });

  // TODO: list of placetags
  return {
    tergeha: h("div", ...structuredDefinition),
    hasExpansion,
    stringifiedPlaceTags,
    stringifiedSubDefPlaceTags,
  };
}

async function skicu_paledovalsi({
  def,
  inner,
  index,
  stringifiedPlaceTags = [],
  stringifiedSubDefPlaceTags = [],
}: {
  def: Def;
  inner: boolean;
  index: string;
  stringifiedPlaceTags: string[];
  stringifiedSubDefPlaceTags: string[];
}) {
  if (
    def.bangu === "en-pixra" &&
    !(typeof def.d === "string"
      ? await getOrFetchResource(
          def.d?.indexOf("../") === 0
            ? def.d
            : `/assets/pixra/xraste/${encodeURIComponent(def.d ?? "")}`
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
          "a",
          {
            href: buildURLParams(
              {
                ...state.displaying,
                query: selmaho,
                seskari: "selmaho",
                versio: "selmaho",
              },
              { retainSeskariFromFallingBack: true }
            ),
            class: "xp-btn tutci tutci-sampu",
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
    //TODO what is this?
    children = [
      h(
        "a",
        {
          class: "valsi",
          attributes: {
            href: buildURLParams({
              seskari,
              query: def.w,
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

  let zbalermorna;
  if (
    stateLeijufra.lojbo &&
    !(typeof def.t === "object" && def.t?.k === 0) &&
    (seskari !== "fanva" || index === "0")
  ) {
    const textContent = (ceha as any)[stateOutsideComponents.morna.fancu](
      def.w
    );
    zbalermorna = (supportedLangs[bangu as keyof typeof supportedLangs] as any)
      .zbalermorna_defined
      ? h("a", {
          attributes: {
            href: buildURLParams({
              seskari,
              query: stateOutsideComponents.morna.valsi,
              bangu,
              versio,
            }),
          },
          innerText: textContent,
          class: [
            "valsi",
            stateOutsideComponents.morna.valsi,
            "segerna",
            "sampu",
          ],
        })
      : h("span", {
          class: [
            "valsi",
            stateOutsideComponents.morna.valsi,
            "segerna",
            "sampu",
          ],
          textContent,
        });
  }

  const word = h(
    "h4",
    {
      class: ["valsi"],
      attributes: def.d && !def.nasezvafahi ? { "data-valsi": def.w } : {},
    },
    ...children,
    state.lei_sance[def.w as string]?.audio &&
      h("button", {
        class: ["sance"],
        click: () => {
          const audioNode: HTMLAudioElement = new Audio();
          audioNode.src = state.lei_sance[def.w as string].audio;
          audioNode.crossOrigin = "anonymous";
          audioNode.play();
        },
        innerText: "▶",
      }),
    zbalermorna
  );

  let jvs;
  if (typeof def.t === "string") {
    def.t = def.t === "bangudecomp" ? stateLeijufra.bangudecomp : def.t;
    const txt = encodeUrl(def.w).replace(/_/g, "%20");

    //TODO  what is this?
    jvs = h("a", {
      class: ["klesi", "link"],
      href: stateLeijufra.judri
        ? stateLeijufra.judri + txt
        : buildURLParams({
            seskari: seskari === "catni" ? "catni" : "cnano",
            query: def.w,
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
    stringifiedSubDefPlaceTags: string[];
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
        stringifiedSubDefPlaceTags,
      });
    } else {
      prettifiedDefinition = {
        tergeha: h("img", {
          src:
            def.d.indexOf("../") === 0
              ? def.d
              : `/assets/pixra/xraste/${encodeURIComponent(
                  typeof def.d === "string" ? def.d : ""
                )}`,
        }),
        hasExpansion: false,
        stringifiedPlaceTags,
        stringifiedSubDefPlaceTags,
      };
    }
  if (prettifiedDefinition?.stringifiedPlaceTags)
    stringifiedPlaceTags = prettifiedDefinition.stringifiedPlaceTags;
  if (prettifiedDefinition?.stringifiedSubDefPlaceTags)
    stringifiedSubDefPlaceTags =
      prettifiedDefinition.stringifiedSubDefPlaceTags;

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
            href: buildURLParams(
              {
                bangu,
                versio: "selmaho",
                seskari,
                query: key,
              },
              { retainSeskariFromFallingBack: true }
            ),
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
    translateButton = h("a", {
      class: ["xp-btn", "tutci", "tutci-pixra"],
      style: { "background-image": "url(/assets/pixra/seskari/fanva.svg)" },
      href: buildURLParams(
        {
          ...state.displaying,
          seskari: "fanva",
          versio: "masno",
        },
        { retainSeskariFromFallingBack: true }
      ),
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
              href: buildURLParams({
                seskari,
                query: child,
                bangu,
                versio: "masno",
              }),
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
      style: { "background-image": "url(/assets/pixra/shuffle.svg)" },
      class: [
        "tutci",
        "tutci-pixra",
        "xp-btn",
        "jvo_plumber",
        state.jvoPlumbsOn ? "tutci-hover" : null,
      ],
      click: () => {
        state.jvoPlumbsOn = !state.jvoPlumbsOn;
        addJvoPlumbs();
      },
    });
  }

  let whoIsFirstLine = [];

  heading.appendChild(h("div", { style: { flex: 1 } }));

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
      style: { "background-image": "url(/assets/pixra/fukpi.svg)" },
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
          hideNotificationInAWhile(() => {
            stateLoading.innerText = interpolate(stateLeijufra.distance, {
              distance: innerText,
            });
            stateLoading.hideProgress = true;
          });
        },
      })
    );
  }

  out.appendChild(heading);
  //new line buttons
  const heading2 = h("heading", { class: "heading heading2" });
  //<xuzganalojudri|lojbo>
  // if (zbalermorna && !whoIsFirstLine.includes("zbalermorna"))
  //   heading2.appendChild(zbalermorna);
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
          stringifiedSubDefPlaceTags,
        }).tergeha
      )
    );
  }
  def.r = def.r ?? [];
  if (def.r.length > 0 && !(def.r.length === 1 && def.r[0].length > 15)) {
    //if it's the only rafsi and the word is long dont show the rafsi
    const tanxe_leirafsi = h("div", { class: "rafsi noselect" });

    const rafcme = h("div", {
      class: "tanxe zunle_tanxe",
      innerText: stateLeijufra.rafsi,
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
        class: "tanxe zunle_tanxe",
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
                href: buildURLParams({
                  seskari,
                  query: el,
                  bangu,
                  versio: "masno",
                }),
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

  if ((def.rfs || []).length > 0) {
    const subDefs = h("div", {
      class: ["definition", "subdefinitions"],
    });
    for (const [i, subdef] of (def.rfs || []).entries()) {
      const htmlElement = await skicu_paledovalsi({
        def: subdef,
        inner: true,
        index: `${index}_${i}`,
        stringifiedPlaceTags,
        stringifiedSubDefPlaceTags,
      });
      if (htmlElement) subDefs.appendChild(htmlElement);
    }
    out.appendChild(subDefs);
  }

  out.addEventListener("click", clicked);
  return out;
}

function hideNotificationInAWhile(fn = () => {}, timeout = 4000) {
  fn();
  stateLoading.loading = true;
  clearTimeout(stateOutsideComponents.timers.notification);
  stateOutsideComponents.timers.notification = setTimeout(() => {
    stateLoading.loading = false;
  }, timeout) as unknown as number;
}

function copyToClipboard(value: string) {
  navigator.clipboard.writeText(value);
  stateLoading.innerText = stateLeijufra.copied;
  stateLoading.hideProgress = true;
  hideNotificationInAWhile();
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
  if (["cnano", "catni", "rimni", "fanva", "selmaho"].includes(params.seskari))
    newState.seskari = params["seskari"];

  if (["selmaho"].includes(params.versio)) newState.versio = params.versio;
  else newState.versio = "masno";

  if (Object.keys(supportedLangs).includes(params.bangu))
    newState.bangu = params.bangu;

  if (params.sisku) newState.query = newSearch;
  return newState;
}

function setStateFromUrl(href?: string) {
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

async function skicu_roledovalsi(): Promise<(HTMLDivElement | undefined)[]> {
  const displayUpTo = Math.min(
    state.jimte,
    stateOutsideComponents.results.length
  );

  return await Promise.all(
    stateOutsideComponents.results.slice(0, displayUpTo).reduce(
      (acc, resultEl, index) => {
        const htmlTermBlock = skicu_paledovalsi({
          def: cloneObject(resultEl as unknown as Def),
          // length: state.results.length,
          inner: false,
          stringifiedPlaceTags: [],
          stringifiedSubDefPlaceTags: [],
          index: index.toString(),
        });
        if (htmlTermBlock) acc.push(htmlTermBlock);

        return acc;
      },
      [] as Promise<HTMLDivElement | undefined>[]
    )
  );
}
