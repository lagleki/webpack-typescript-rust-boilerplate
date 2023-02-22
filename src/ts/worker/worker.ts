self.onmessage = ({ data: { question } }) => {
  self.postMessage({
    problem: { question, answer: 42 },
  });
};
