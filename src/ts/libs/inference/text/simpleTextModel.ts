import { ModelType } from "./modeType";
import { FeatureExtractionModel } from "./featureExtractionModel";
import { TextMetadata } from "./metadata";

export interface InitTextModelResult {
  model: SimpleTextModel;
  elapsed: number;
}

export class SimpleTextModel {
  static create = async (
    modelMetadata: TextMetadata,
    proxy = true
  ): Promise<InitTextModelResult> => {
    const model = new FeatureExtractionModel(modelMetadata);
    const elapsed = await model.init(proxy);
    return {
      model: model,
      elapsed: elapsed,
    };
  };
}
