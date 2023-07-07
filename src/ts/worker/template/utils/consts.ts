import { RecursiveObject } from "../../../../../../renderer/src/common/types"

export const modes = ['velcusku', 'arxivo', 'cnano', 'rimni', 'catni', 'fanva']
export const supportedLangs = {
  en: { n: 'English', zbalermorna_defined: true, semanticSearchPossible: true },
  muplis: { n: 'la muplis' },
  'en-cll': { n: 'The Book' },
  'en-pixra': { n: '🎨🖼️📸', pictureDictionary: true },
  'en-ll': { n: 'Learn Lojban' },
  jbo: { n: 'lojbo' },
  ru: { n: 'русский' },
  eo: { n: 'esperanto' },
  es: { n: 'español' },
  'fr-facile': { n: 'français' },
  ja: { n: '日本語' },
  zh: { n: '中文' },
  loglan: { n: 'Loglan' },
}

export const listFamymaho = {
  GA: 'gi',
  GUhA: 'gi',
  BE: "bei be'o",
  BEI: "be'o",
  BY: 'boi',
  COI: "do'u",
  DOI: "do'u",
  FIhO: "fe'u",
  FUhE: "fu'o",
  GIhA: 'vau',
  GOI: "ge'u",
  JOhI: "te'u",
  KE: "ke'e",
  LAhE: "lu'u",
  LA: 'ku',
  LE: 'ku',
  LI: "lo'o",
  LOhU: "le'u",
  LU: "li'u",
  ME: "me'u",
  'NAhE+BO': "lu'u",
  NOI: "ku'o",
  NUhI: "nu'u",
  NU: 'kei',
  PA: 'boi',
  PEhO: "ku'e",
  SEI: "se'u",
  SOI: "se'u",
  TO: 'toi',
  TUhE: "tu'u",
  VEI: "ve'o",
  LOhAI: "sa'ai",
  SAhAI: "le'ai",
  LOhOI: "ku'au",
  NAhU: "te'u",
  NIhE: "te'u",
  MOhE: "te'u",
}

export const initState = {
  searching: {
    seskari: 'cnano',
    versio: 'masno',
    query: '',
    bangu: 'en',
  },
  displaying: {
    seskari: 'cnano',
    versio: 'masno',
    query: '',
    bangu: 'en',
  },
  citri: [],
  jvoPlumbsOn: true,
  results: [],
  embeddings: [],
  memoizedValues: {} as RecursiveObject,
}
export const initStateLoading = {
  loading: true,
  firstRun: true,
  mathRendered: false,
  localesLoaded: false,
}

export const positionScrollTopToggleBtn = 200