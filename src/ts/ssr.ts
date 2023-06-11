import { render } from "@sutysisku/renderer/src";

//SSR rendering test
const htmlElement = render("h1", {
  className: "rendered_elem",
  innerText: `This is SSR-rendered when running in production`,
});

document.getElementById("root")?.replaceChildren(htmlElement);
