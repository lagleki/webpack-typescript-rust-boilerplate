import { render } from "@sutysisku/renderer";

//SSR rendering test
const htmlElement = render("h1", {
  className: "rendered_elem",
  style: { fontSize: "200%" },
  innerText: `Hello world, this text is only SSR rendered when running in production`,
});

document.getElementById("root")?.appendChild(htmlElement);
