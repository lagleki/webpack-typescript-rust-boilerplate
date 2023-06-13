import { render } from "@sutysisku/renderer";

//simple console logging test
const log = (arg: { [key: string]: string }) => console.log(arg);

log({ event: "Logging into console", status: "ok" });

//HTML templating engine test
const htmlElement = render("h3", {
  style: { color: "red", fontSize: "200%" },
  textContent:
    "This is a text",
});

document.getElementById("subtitle")?.replaceChildren(htmlElement);
