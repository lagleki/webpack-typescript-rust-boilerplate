import { RecursiveObject } from "../../../renderer/src/common/types";
import { RegexFlavours, Searching, State } from "./types";

export const modes = ["velcusku", "arxivo", "cnano", "rimni", "catni", "fanva"];
export const supportedLangs = {
  "en-embeddings": { n: "English word embeddings" },
  en: { n: "English", zbalermorna_defined: true },
  muplis: { n: "la muplis" },
  "en-cll": { n: "The Book" },
  "en-pixra": { n: "🎨🖼️📸", pictureDictionary: true },
  "en-ll": { n: "Learn Lojban" },
  jbo: { n: "lojbo" },
  ru: { n: "русский" },
  eo: { n: "esperanto" },
  es: { n: "español" },
  "fr-facile": { n: "français" },
  ja: { n: "日本語" },
  zh: { n: "中文" },
  loglan: { n: "Loglan" },
};

export const tiles = [
  {
    en: {
      title: "English-Lojban",
      picture: "/assets/pixra/selsku_lanci_eng.svg",
    },
  },
  {
    jbo: {
      title: "fanva fi le'e lojbo ri",
      picture: "/assets/pixra/lanci_jbo.svg",
    },
  },
  {
    ja: {
      title: '日本 - <span style="white-space:pre;">ロジバン</span>',
      picture: "/assets/pixra/selsku_lanci_jpn.svg",
    },
  },
  {
    "fr-facile": {
      title: "français facile - lojban",
      picture: "/assets/pixra/selsku_lanci_fra.svg",
    },
  },
  {
    ru: {
      title: "русский - ложбан",
      picture: "/assets/pixra/selsku_lanci_rus.svg",
    },
  },
  {
    eo: {
      title: "Esperanto - Loĵbano",
      picture: "/assets/pixra/lanci_epo.svg",
    },
  },
  {
    es: {
      title: "español - lojban",
      picture: "/assets/pixra/selsku_lanci_spa.svg",
    },
  },
  {
    zh: {
      title: "中文 - 逻辑语",
      picture: "/assets/pixra/selsku_lanci_zho.svg",
    },
  },
  { loglan: { title: "Loglan", picture: "/assets/pixra/loglan.svg" } },
];

export const listFamymaho = {
  GA: "gi",
  GUhA: "gi",
  BE: "bei be'o",
  BEI: "be'o",
  BY: "boi",
  COI: "do'u",
  DOI: "do'u",
  FIhO: "fe'u",
  FUhE: "fu'o",
  GIhA: "vau",
  GOI: "ge'u",
  JOhI: "te'u",
  KE: "ke'e",
  LAhE: "lu'u",
  LA: "ku",
  LE: "ku",
  LI: "lo'o",
  LOhU: "le'u",
  LU: "li'u",
  ME: "me'u",
  "NAhE+BO": "lu'u",
  NOI: "ku'o",
  NUhI: "nu'u",
  NU: "kei",
  PA: "boi",
  PEhO: "ku'e",
  SEI: "se'u",
  SOI: "se'u",
  TO: "toi",
  TUhE: "tu'u",
  VEI: "ve'o",
  LOhAI: "sa'ai",
  SAhAI: "le'ai",
  LOhOI: "ku'au",
  NAhU: "te'u",
  NIhE: "te'u",
  MOhE: "te'u",
};

export const initState = {
  displaying: {
    seskari: "cnano",
    versio: "masno",
    query: "",
    bangu: "en",
  } as State,
  citri: [] as State[],
  jvoPlumbsOn: true,
  embeddings: [],
  memoizedValues: {} as RecursiveObject,
  jimte: 100,
};

export const initStateOutsideComponents = {
  results: [] as RecursiveObject[],
  focused: 1,
  scrollTop: 0,
  scrollJvoTimer: 0,
  typing: 0,
  scroll: 0,
  fetched: {
    seskari: "cnano",
    versio: "masno",
    query: "",
    bangu: "en",
  } as State,
  sent: {
    seskari: "cnano",
    versio: "masno",
    query: "",
    bangu: "en",
  } as State,
};

export const initStateLoading = {
  showDesktop: true as boolean,
  loading: true,
  completedRows: 37,
  totalRows: 100,
  innerText: "",
  href: "",
  hideProgress: false,
  firstRun: true,
  mathRendered: false,
  localesLoaded: false,
  displaying: {
    seskari: "cnano",
    versio: "masno",
    query: "",
    bangu: "en",
  } as State,
};

export const positionScrollTopToggleBtn = 200;

export const regexImageLink: RegexFlavours = {
  full: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&//=]*)\.(?:jpg|png)$/,
  partial:
    /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&//=]*)\.(?:jpg|png))/,
  tagName: "imageLink",
};
export const regexHyperLink: RegexFlavours = {
  full: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*$/,
  partial:
    /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
  tagName: "hyperLink",
};
export const regexIntraLink: RegexFlavours = {
  full: /^\{.*?\}$/,
  partial: /(\{.*?\})/,
  tagName: "intraLink",
};
export const regexTeX: RegexFlavours = {
  full: /^\$.*?\$$/,
  partial: /(\$.*?\$)/,
  tagName: "math",
};

export const regexTeXQuotation: RegexFlavours = {
  full: /^``.*?''$/,
  partial: /(``.*?'')/,
  tagName: "TeX-quote",
};

export const blobChunkDefaultLength = 5;

export const cisn_default = 100;

export const secondarySeskari = ["fanva", "selmaho"];