const importPromise = import("../../pkg");
import { Machine } from "../../pkg";

//Rust main function test
importPromise.catch(console.error);

//Rust specific functions test
const valueA = 1,
  valueB = 2;
const machine = Machine.new(valueA, valueB);
const textExpression = `${valueA} + ${valueB}`;
console.log({
  event: "JS (from WASM Rust) response",
  textExpression,
  result: machine.add().toString(),
});
