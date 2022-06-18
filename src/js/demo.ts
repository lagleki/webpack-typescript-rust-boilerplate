const importPromise = import('../../pkg');
import { Machine } from "../../pkg";
const demo = () =>
  "Webpack Boilerplate v5.14.0 - SASS/PostCSS, ES6/7, browser sync, source code listing and more.";

// eslint-disable-next-line no-console
console.log(demo());

const worker = new Worker(new URL("./deep-thought", import.meta.url));
worker.postMessage({
  question:
    "The Answer to the Ultimate Question of Life, The Universe, and Everything.",
});
worker.onmessage = ({ data: { problem } }) => {
  console.log(problem);
};

importPromise.catch(console.error);
const valueA = 1,
  valueB = 2;
const machine = Machine.new(valueA, valueB);
// const textExpression = `${valueA} + ${valueB}`;
console.log({ answer: machine.add().toString() });
