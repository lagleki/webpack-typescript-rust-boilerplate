export type Dict = { [x: string]: any };

export type DumpRow = (string | string[])[];

export type Def = {
  semMaxDistance?: number;
  n?: string;
  s?: string | string[];
  r?: string[];
  t?: string | Dict;
  date?: string;
  q?: string;
  b?: string[];
  bangu: string;
  w: string;
  z?: string;
  rfs?: Def[];
  g?: string;
  d?: string | Dict;
  ot?: string;
  nasezvafahi?: true;
};

export type Searching = {
  query: string;
  seskari?: string;
  bangu: string;
  versio?: string;
  leijufra?: any;
  loadingState?: boolean;
};

export type State = {
  query: string;
  seskari: string;
  bangu: string;
  versio: string;
};

export type DefRenderedElementType =
  | "simple"
  | "math"
  | "veljvocmiterjonmaho"
  | "link"
  | "image_link"
  | "hilite"
  | "intralink";

export type DefRenderedElement = {
  type: DefRenderedElementType;
  value: string;
  meta?: Dict;
};

export type BasnaMemoized = { arrQuery: string[]; regex: string };

export type RegexFlavours = { full: RegExp; partial: RegExp; tagName: string };

export type EmbeddingsFile = {
  vocabulary: string[];
  centroids: string;
  codes: string;
};
