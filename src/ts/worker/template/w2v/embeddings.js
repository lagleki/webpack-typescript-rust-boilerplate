import * as lzstring from 'lz-string';

// import * as tf from '@tensorflow/tfjs-core';
// import '@tensorflow/tfjs-backend-webgl';
// import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';

import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-backend-wasm';

const unpackVectors = function (data, type) {
  var jsonData = JSON.parse(lzstring.decompressFromBase64(data));
  var array = tf.tensor(jsonData.vectors, jsonData.shape, type);
  return array;
};

export class WordEmbeddings {
  constructor(codes, centroids, vocabulary) {
    this.vocabulary = vocabulary;
    this.centroids = centroids;
    this.codes = codes;
  }

  // _getVector returns the vector representation of a word as a tensor
  _getVector(word) {
    const index = this.vocabulary.indexOf(word);
    if (index === -1) {
      return tf.zeros([this.codes.shape[1] * this.centroids.shape[2]]);
    }
    const codes = this._getSearchVector(index);
    const indices = tf.range(0, this.codes.shape[1], 1, 'int32');
    const search = tf.stack([indices, codes], -1);
    const vector = tf.gatherND(this.centroids, search).flatten();
    return vector;
  }

  _getSearchVector(index) {
    return this.codes.gather([index]).as1D();
  }

  transformSequence(words, sequenceLength) {
    const vectors = words.map((word) => this._getVector(word));
    let sequence = tf.stack(vectors);
    sequence = sequence.pad([
      [sequenceLength - words.length, 0],
      [0, 0],
    ]);
    return sequence;
  }

  // _getVector returns a Promise the vector representation of a word as a float array
  getVector(word) {
    return this._getVector(word).dataSync();
  }

  // getCosineDistance returns the cosine distance between two word vectors
  getCosineDistance(word1, word2) {
    const vec1 = this._getVector(word1);
    const vec2 = this._getVector(word2);
    var dotProduct = vec1.dot(vec2).asScalar();
    const abs1 = vec1.norm(2);
    const abs2 = vec2.norm(2);
    const cosineDistance = dotProduct.div(abs1).div(abs2);
    return cosineDistance.dataSync()[0];
  }

  // getNearestNeighbors returns the closest k words from a given word
  async getNearestNeighbors(word, k = 5) {
    const vector = this._getVector(word);
    return this._getNearestNeighbors(vector, k);
  }

  async _getNearestNeighbors(vector, k) {
    var neighbors = tf.tensor1d([]);
    var abs = vector.norm(2).asScalar();
    // Precompute distances
    var lookupTable = this._computeDistances(vector);
    await tf.nextFrame();

    // Calculate distance for each word vector
    const subdims = this.centroids.shape[0];
    const searchIndices = tf
      .range(0, subdims, 1, 'int32')
      .tile([this.vocabulary.length]);
    const searchVectors = this.codes.flatten();
    const search = tf.stack([searchIndices, searchVectors], -1);
    let dotProducts = tf
      .gatherND(lookupTable[0], search)
      .reshape([this.vocabulary.length, -1]);
    let abs1 = tf
      .gatherND(lookupTable[1], search)
      .reshape([this.vocabulary.length, -1]);
    dotProducts = dotProducts.sum([1]);
    abs1 = abs1.sum([1]);
    neighbors = dotProducts.div(abs.mul(abs1.sqrt()));
    await tf.nextFrame();

    // Get top K distances
    let { values, indices } = tf.topk(neighbors, k + 1);
    await tf.nextFrame();
    values = values.dataSync();
    indices = indices.dataSync();
    const nearestNeighbors = [];
    for (const i in indices) {
      nearestNeighbors.push({
        word: this.vocabulary[indices[i]],
        distance: values[i],
      });
    }
    return nearestNeighbors;
  }

  async wordAnalogy(word1, word2, word3, k = 5) {
    var vector1 = this._getVector(word1);
    var vector2 = this._getVector(word2);
    var vector3 = this._getVector(word3);
    vector1 = vector1.div(vector1.norm());
    vector2 = vector2.div(vector2.norm());
    vector3 = vector3.div(vector3.norm());
    const vector = vector1.add(vector2).sub(vector3);
    return this._getNearestNeighbors(vector, k);
  }

  // _computeDistances computes the partial dot products and l2 distances of an embedding
  // from all the centres
  _computeDistances(vector) {
    const subdims = this.centroids.shape[0];
    const reshapedVector = vector.reshape([subdims, -1]);
    const squareSums = this.centroids.norm(2, 2).square();
    let dotProducts = [];
    for (let i = 0; i < subdims; i++) {
      const codeword = reshapedVector.gather([i]).squeeze();
      const centers = this.centroids.gather([i]).squeeze();
      const dotProduct = codeword.dot(centers.transpose());
      dotProducts.push(dotProduct);
    }
    dotProducts = tf.stack(dotProducts);
    return [dotProducts, squareSums];
  }
}

export const loadModel = async function (model) {
  // setWasmPaths('/sutysisku/lojban/w2v/');
  // await tf.setBackend('wasm');
  console.log({ event: 'Unpacking codes' });
  const codes = unpackVectors(model.codes, 'int32');
  await tf.nextFrame();
  console.log({ event: 'Unpacking centroids' });
  const centroids = unpackVectors(model.centroids, 'float32');
  await tf.nextFrame();
  console.log({ event: 'Embeddings ready' });
  return new WordEmbeddings(codes, centroids, model.vocabulary);
};
