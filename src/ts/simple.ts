import { render } from "@sutysisku/renderer/src";

//simple console logging test
const log = (arg: { [key: string]: string }) => console.log(arg);

log({ event: "Logging into console", status: "ok" });

//HTML templating engine test
const htmlElement = render("h3", {
  style: { color: "red", fontSize: "200%" },
  textContent:
    "But this is a runtime-rendered text replacing the text rendered here in SSR mode",
});

document.getElementById("subtitle")?.replaceChildren(htmlElement);
