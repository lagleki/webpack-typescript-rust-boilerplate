const importPromise = import("../../pkg");
import { Machine } from "../../pkg";

//simple console logging test
const demo = () =>
  "Webpack Boilerplate v5.14.0 - SASS/PostCSS, ES6/7, browser sync, source code listing and more.";
// eslint-disable-next-line no-console
console.log(demo());

//Workers' test
const worker = new Worker(new URL("./worker", import.meta.url));
worker.postMessage({
  question:
    "The Answer to the Ultimate Question of Life, The Universe, and Everything.",
});
worker.onmessage = ({ data: { problem } }) => {
  console.log({ event: "Worker response", ...problem });
};

//Rust main function test
importPromise.catch(console.error);

//Rust specific functions test
const valueA = 1,
  valueB = 2;
const machine = Machine.new(valueA, valueB);
const textExpression = `${valueA} + ${valueB}`;
console.log({
  event: "WASM Rust calc response",
  textExpression,
  result: machine.add().toString(),
});

//SSR test for index.html
const div = document.createElement("div");
div.classList.add("rendered_elem")
div.style.fontSize = "200%";
div.innerText = `Hello world, I'm SSR rendered at ${new Date()}`;
document.getElementById("root")?.appendChild(div);