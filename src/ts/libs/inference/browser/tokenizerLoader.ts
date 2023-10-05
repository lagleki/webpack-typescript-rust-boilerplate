import { Tokenizer } from "./tokenizer";

export const loadTokenizer = async (
  tokenizerPath: string,
): Promise<Tokenizer> => {
  const tokenizer = new Tokenizer(tokenizerPath);
  await tokenizer.init();
  return tokenizer;
};
