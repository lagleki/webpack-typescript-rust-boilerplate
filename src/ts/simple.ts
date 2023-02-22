import { render } from "@sutysisku/renderer";

//simple console logging test
const log = (arg: { [key: string]: string }) =>
  console.log(arg);

log({ event: "Logging into console", status: 'ok' });

//HTML templating engine test
const htmlElement = render("div", {
  className: "testFrom",
  children: [render("h3", { textContent: "Hello world. This is a title" })],
});

document.body.appendChild(htmlElement);
