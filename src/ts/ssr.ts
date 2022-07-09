import { render } from "@sutysisku/renderer";

//SSR rendering test
const htmlElement = render("h1", {
  className: "rendered_elem",
  style: { fontSize: "200%" },
  innerText: `Hello world, I'm SSR rendered at ${new Date()}`,
});

document.getElementById("root")?.appendChild(htmlElement);
