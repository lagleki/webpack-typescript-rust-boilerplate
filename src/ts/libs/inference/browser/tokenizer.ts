import init, { WasmTokenizer } from "@visheratin/tokenizers";
import { SessionParams } from "./sessionParams";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { decompress } from "brotli-compress/js";

export class Tokenizer {
  instance: WasmTokenizer | undefined;
  private tokenizerPath: string;

  constructor(tokenizerPath: string) {
    this.tokenizerPath = tokenizerPath;
  }

  fetchData = async (modelPath: string): Promise<ArrayBuffer> => {
    const extension = modelPath.split(".").pop();
    let blob = await fetch(modelPath).then((resp) => resp.arrayBuffer());
    if (extension === "brotli") {
      return await decompress(Buffer.from(blob));
    }
    return blob;
  };

  async init() {
    await init(SessionParams.tokenizersPath);
    const blob = await this.fetchData(this.tokenizerPath);
    const tokenizerData = JSON.parse(new TextDecoder().decode(blob));
    tokenizerData["padding"] = null;
    this.instance = new WasmTokenizer(JSON.stringify(tokenizerData));
  }

  decode(ids: Uint32Array, skip_special_tokens: boolean): string {
    if (this.instance === undefined) {
      throw new Error("Tokenizer is not initialized");
    }
    return this.instance.decode(ids, skip_special_tokens);
  }

  encode(text: string, add_special_tokens: boolean): Uint32Array {
    if (this.instance === undefined) {
      throw new Error("Tokenizer is not initialized");
    }
    return this.instance.encode(text, add_special_tokens);
  }
}
