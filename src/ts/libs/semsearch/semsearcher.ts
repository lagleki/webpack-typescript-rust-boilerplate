import { typedArrayToBuffer } from "../../utils/fns";
import {
  SearchResult,
  Sisku,
} from "@sutysisku/tokenizer/pkg/web/sutysisku_tokenizer.js";
// await initSem();
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { decompress } from "brotli-compress/js";

export class SemSearcher {
  private tutci: Sisku | undefined;

  fetchData = async (resp: Response): Promise<any> => {
    let blob: any = await resp.arrayBuffer();
    blob = await decompress(Buffer.from(blob));
    blob = Buffer.from(typedArrayToBuffer(blob)).toString();
    blob = blob.split("\n").map((line: string) => {
      line = line.replace(/-/g, ",-").replace(/\t,-/g, "\t-");
      const line_ = line.split("\t");
      const embeddings = line_[1].split(",").map((i) => parseInt(i) / 10 ** 2);
      const title = line_[0];
      return { title, embeddings };
    });

    this.tutci = new Sisku({ embeddings: blob });
  };

  search = async (vector: number[], topK = 10) => {
    if (!this.tutci) return [] as SearchResult[];
    const result = this.tutci?.search(new Float32Array(vector), topK);
    return result?.neighbors;
  };
}
