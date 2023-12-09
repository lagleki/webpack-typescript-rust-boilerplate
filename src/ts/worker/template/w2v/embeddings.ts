// import * as lzstring from 'lz-string'

// // import * as tf from '@tensorflow/tfjs-core';
// // import '@tensorflow/tfjs-backend-webgl';
// // import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';

// import * as tf from '@tensorflow/tfjs'
// import { EmbeddingsFile } from '../../../types'
// import { log } from '../../../libs/logger'
// // import '@tensorflow/tfjs-backend-wasm';

// const unpackVectors = function (
//   codes: EmbeddingsFile['codes'],
//   type: 'int32' | 'float32',
// ): tf.Tensor<tf.Rank> {
//   const jsonData = JSON.parse(lzstring.decompressFromBase64(codes))
//   return tf.tensor(jsonData.vectors, jsonData.shape, type)
// }

// class WordEmbeddings {
//   private codes: tf.Tensor<tf.Rank>
//   private centroids: tf.Tensor<tf.Rank>
//   private vocabulary: string[]
//   constructor(
//     codes: tf.Tensor<tf.Rank>,
//     centroids: tf.Tensor<tf.Rank>,
//     vocabulary: string[],
//   ) {
//     this.codes = codes
//     this.centroids = centroids
//     this.vocabulary = vocabulary
//   }

//   // return the vector representation of a word as a tensor
//   private getVector(word: string) {
//     const index = this.vocabulary.indexOf(word)
//     if (index === -1) {
//       return tf.zeros(
//         this.codes.shape[1] && this.centroids.shape[2]
//           ? [this.codes.shape[1] * this.centroids.shape[2]]
//           : [],
//       )
//     }
//     const searchVector = this.codes.gather([index]).as1D()
//     const indices = tf.range(0, this.codes.shape[1] ?? 1, 1, 'int32')
//     const search = tf.stack([indices, searchVector], -1)
//     return tf.gatherND(this.centroids, search).flatten()
//   }

//   // return the closest k words to a given word
//   async getNearestNeighbors(word: string, k = 5) {
//     const vector = this.getVector(word)
//     let neighbors = tf.tensor1d([])
//     const abs = vector.norm(2).asScalar()
//     // Precompute distances
//     const lookupTable = this._computeDistances(vector)
//     await tf.nextFrame()
  
//     // Calculate distance for each word vector
//     const subdims = this.centroids.shape[0]
//     const searchIndices = tf
//       .range(0, subdims, 1, 'int32')
//       .tile([this.vocabulary.length])
//     const searchVectors = this.codes.flatten()
//     const search = tf.stack([searchIndices, searchVectors], -1)
//     let dotProducts = tf
//       .gatherND(lookupTable[0], search)
//       .reshape([this.vocabulary.length, -1])
//     let abs1 = tf
//       .gatherND(lookupTable[1], search)
//       .reshape([this.vocabulary.length, -1])
//     dotProducts = dotProducts.sum([1])
//     abs1 = abs1.sum([1])
//     neighbors = dotProducts.div(abs.mul(abs1.sqrt()))
//     await tf.nextFrame()
  
//     // Get top K distances
//     let { values, indices } = tf.topk(neighbors, k + 1)
//     await tf.nextFrame()
//     const values_ = values.dataSync()
//     const indices_ = indices.dataSync()
//     const nearestNeighbors = []
//     for (const i in indices_) {
//       nearestNeighbors.push({
//         word: this.vocabulary[indices_[i]],
//         distance: values_[i],
//       })
//     }
//     return nearestNeighbors
//   }

//   // computes the partial dot products and l2 distances of an embedding from all the centres
//   private _computeDistances(vector: tf.Tensor<tf.Rank>) {
//     const subdims = this.centroids.shape[0]
//     const reshapedVector = vector.reshape([subdims, -1])
//     const squareSums = this.centroids.norm(2, 2).square()
//     let dotProducts = []
//     for (let i = 0; i < subdims; i++) {
//       const codeword = reshapedVector.gather([i]).squeeze()
//       const centers = this.centroids.gather([i]).squeeze()
//       const dotProduct = codeword.dot(centers.transpose())
//       dotProducts.push(dotProduct)
//     }
//     return [tf.stack(dotProducts), squareSums]
//   }
// }

// export const loadModel = async function ({
//   codes,
//   centroids,
//   vocabulary,
// }: EmbeddingsFile) {
//   // setWasmPaths('/sutysisku/lojban/w2v/');
//   // await tf.setBackend('wasm');
//   log({ event: 'unpacking codes' })
//   const codes_ = unpackVectors(codes, 'int32')
//   await tf.nextFrame()
//   log({ event: 'unpacking centroids' })
//   const centroids_ = unpackVectors(centroids, 'float32')
//   await tf.nextFrame()
//   log({ event: 'embeddings ready' })
//   return new WordEmbeddings(codes_, centroids_, vocabulary)
// }
