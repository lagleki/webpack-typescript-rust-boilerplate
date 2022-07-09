//Workers' test
const worker = new Worker(new URL("./worker/worker", import.meta.url));
worker.postMessage({
  question:
    "The Answer to the Ultimate Question of Life, The Universe, and Everything.",
});
worker.onmessage = ({ data: { problem } }) => {
  console.log({ event: "Worker response", ...problem });
};