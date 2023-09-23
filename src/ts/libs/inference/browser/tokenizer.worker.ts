import * as Comlink from "comlink";
import { Tokenizer } from "./tokenizer";

if (typeof self !== "undefined") {
  Comlink.expose(Tokenizer);
}
