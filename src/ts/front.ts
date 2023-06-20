import { component, store } from "../../../renderer/src";
// import io from 'socket.io-client'
// import arrowCreate, { HEAD } from 'arrows-svg'
// import {
//   listFamymaho,
//   modes,
//   supportedLangs,
//   initState,
//   initStateLoading,
// } from './worker/template/utils/consts'
// import { rows } from './worker/template/utils/pronunciation.js'
// import { UNICODE_START, lerfu_index } from './worker/template/utils/zlm.js'

// //global vars:
// let resultCount
// let typingTimer //search after timeout
// let cacheObj
// let scrollTimer = null
// let scrollJvoTimer = null
// const timers = {
//   vh: null,
//   typing: null,
// }
// let socket, socket1Chat, socket1Chat_connected

// //stores
// const stateLeijufra = store({ custom_links: [] })
// let state = store(initState)
// const loadingState = store(initStateLoading)

const storeOptions = { localCacheKey: "test", eventKey: 'test2' }
const state = store(
  { loading: true, sub: { x: "john", y: "mary" } },
  storeOptions
);
// //simple console logging test
// const log = (arg: { [key: string]: string }) => console.log(arg);

// log({ event: "Logging into console", status: "ok" });

component("#root", () => {
  const div = document.createElement("div");
  div.textContent = `Hello, ${state.sub.x} !`;
  return div;
}, storeOptions);

setTimeout(() => {
  state.sub.x = "maarr";
}, 3000);

//HTML templating engine test
// const htmlElement = render("h3", {
//   style: { color: "red", fontSize: "200%" },
//   textContent:
//     "This is a text",
// });

// document.getElementById("subtitle")?.replaceChildren(htmlElement);
