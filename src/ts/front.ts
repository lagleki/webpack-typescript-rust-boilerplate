import { component, store } from "../../../renderer/src";

const state = store({ loading: true, x: "john", y: "mary" });
//simple console logging test
const log = (arg: { [key: string]: string }) => console.log(arg);

log({ event: "Logging into console", status: "ok" });

log({ state: JSON.stringify(state) });

component("#root", function () {
  const div = document.createElement("div");
  div.textContent = `Hello, ${state.x} !`;
  return div;
});

setTimeout(() => {
  state.x = "maarr";
}, 3000);

//HTML templating engine test
// const htmlElement = render("h3", {
//   style: { color: "red", fontSize: "200%" },
//   textContent:
//     "This is a text",
// });

// document.getElementById("subtitle")?.replaceChildren(htmlElement);
