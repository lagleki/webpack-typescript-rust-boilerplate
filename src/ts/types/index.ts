export type Dict = { [x: string]: any };

export type Def = {
  semMaxDistance?: number;
  n?: string;
  s?: string | string[];
  r?: string[];
  t?: string | Dict;
  date?: string;
  q?: string;
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