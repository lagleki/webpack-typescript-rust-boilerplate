import * as ort from "onnxruntime-common";
import * as ortWeb from "onnxruntime-web";
import { TokenizerWasm } from "@sutysisku/tokenizer/pkg/web/sutysisku_tokenizer.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { decompress } from "brotli-compress/js";

type InferenceResult = {
  countTokens: number;
  vectors: number[][];
};

type Metadata = {
  id: string;
  title?: string;
  readmeUrl?: string;
  encoderPath: string;
  outputEncoderName: string;
  tokenizerPath: string;
  padTokenID: number;
};

type ValueMapType = {
  [name: string]: ort.OnnxValue;
};

export class TextEmbeddingModel {
  metadata!: Metadata;
  tokenizer: TokenizerWasm | undefined;
  ortSession: ortWeb.InferenceSession | undefined;
  ortTensor!: ort.Tensor;

  initOrtSession = async (path: string) => {
    let buffer: Buffer = await this.getBlob(path);
    const session = await ortWeb.InferenceSession.create(buffer, {
      graphOptimizationLevel: "all",
      executionMode: "parallel",
    });
    this.ortSession = session;
  };

  async getBlob(path: string) {
    //TODO: add cache handling
    let blob: ArrayBuffer;

    blob = await fetch(path).then((resp) => resp.arrayBuffer());

    const array = await decompress(Buffer.from(blob));
    return Buffer.from(
      array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset)
    );
  }

  async initTokenizer() {
    const buffer = await this.getBlob(this.metadata.tokenizerPath);
    let json = JSON.parse(buffer.toString());
    json = JSON.parse(json);
    json["padding"] = null;
    this.tokenizer = new TokenizerWasm(JSON.stringify(json));
  }

  async initialize(modelMetadata: Metadata) {
    this.metadata = modelMetadata;

    if (ortWeb.env) ortWeb.env.wasm.proxy = false;
    await this.initOrtSession(this.metadata.encoderPath);

    await this.initTokenizer();
  }

  async encode(
    inputs: ort.Tensor,
    attentionMask: ort.Tensor
  ): Promise<ort.Tensor> {
    const encoderFeeds: ValueMapType = {
      input_ids: inputs,
      attention_mask: attentionMask,
      ...(this.ortSession!.inputNames.includes("token_type_ids")
        ? {
            token_type_ids: new ort.Tensor(
              "int64",
              new BigInt64Array(inputs.data.length).fill(0n),
              [inputs.dims[0], inputs.dims[1]]
            ),
          }
        : {}),
    };

    const output = await this.ortSession!.run(encoderFeeds);
    return output[this.metadata.outputEncoderName];
  }

  async prepareTextTensors(
    inputs: string[],
    addSpecialTokens: boolean,
    padTokenID: number,
    bosTokenID?: number
  ): Promise<ort.TypedTensor<"int64">[]> {
    const inputIDs: number[][] = [];
    const attentionMasks: number[][] = [];
    let maxLen = 0;

    inputs.forEach((input) => {
      const tokensUintArray: Uint32Array = this.tokenizer!.encode(
        input,
        addSpecialTokens
      ).input_ids;
      const tokens: number[] = Array.from(tokensUintArray);
      let len = tokens.length + (bosTokenID ? 1 : 0);

      let currentInputIDs: number[] = [];
      if (bosTokenID) {
        currentInputIDs.push(bosTokenID);
        currentInputIDs = currentInputIDs.concat(tokens);
      } else {
        currentInputIDs = tokens;
      }
      inputIDs.push(currentInputIDs);

      const currentAttentionMask: number[] = Array(len).fill(1);
      attentionMasks.push(currentAttentionMask);

      maxLen = Math.max(maxLen, len);
    });

    // Padding all sequences to the maximum length
    inputIDs.forEach((ids, i) => {
      const currentLen = ids.length;
      const padCount = maxLen - currentLen;
      inputIDs[i] = ids.concat(Array(padCount).fill(padTokenID));
      attentionMasks[i] = attentionMasks[i].concat(Array(padCount).fill(0));
    });

    const flattenedInputIDs = inputIDs.flat();
    const flattenedAttentionMasks = attentionMasks.flat();

    const inputIDsData = new BigInt64Array(
      flattenedInputIDs.map((id) => BigInt(id))
    );
    const attentionMasksData = new BigInt64Array(
      flattenedAttentionMasks.map((mask) => BigInt(mask))
    );

    const inputIDsTensor = new ort.Tensor("int64", inputIDsData, [
      inputs.length,
      maxLen,
    ]);
    const attentionMaskTensor = new ort.Tensor("int64", attentionMasksData, [
      inputs.length,
      maxLen,
    ]);
    return [inputIDsTensor, attentionMaskTensor];
  }

  tensorPosition(indices: number[]): number {
    const index = indices.reduce((acc, currentIndex, i) => {
      const skipSize = this.ortTensor.dims
        .slice(i + 1)
        .reduce((a: number, b: number) => a * b, 1);
      return acc + currentIndex * skipSize;
    }, 0);
    return this.ortTensor.data[index] as number;
  }

  async infer(sentences: string[]): Promise<InferenceResult> {
    const textTensors = await this.prepareTextTensors(
      sentences,
      true,
      this.metadata.padTokenID
    );
    const attentionMask: ort.Tensor = textTensors[1];
    const lastHiddenState: ort.Tensor = await this.encode(
      textTensors[0],
      attentionMask
    );
    this.ortTensor = lastHiddenState;
    const output = Array.from({ length: lastHiddenState.dims[0] }, () =>
      Array.from({ length: lastHiddenState.dims[2] }, () => 0)
    ).map((_, idx, result) => {
      const numRows = lastHiddenState.dims[1];
      const row = result[idx].map((_, j) => {
        let rowAggregate = (lastHiddenState.data as never[])
          .slice(idx * numRows, (idx + 1) * numRows)
          .reduce(
            (acc: { sum: number; count: number }, _: never, i: number) => {
              const attnValue = attentionMask.data[idx * numRows + i];
              return {
                sum: attnValue
                  ? acc.sum + (attnValue ? this.tensorPosition([idx, i, j]) : 0)
                  : acc.sum,
                count: acc.count + (attnValue ? 1 : 0),
              };
            },
            { sum: 0, count: 0 }
          );
        return rowAggregate.sum / rowAggregate.count;
      });

      const sum = Math.sqrt(row.reduce((acc, val) => acc + val * val, 0));
      return row.map((value) => value / sum);
    });

    return {
      vectors: output,
      countTokens: textTensors[0].data.length,
    };
  }

  static async create(modelMetadata: Metadata) {
    const o = new TextEmbeddingModel();
    await o.initialize(modelMetadata);
    return o;
  }
}
