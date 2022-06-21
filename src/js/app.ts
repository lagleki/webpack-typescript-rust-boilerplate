import '../scss/app.scss';

/* Your JS Code goes here */

/* Demo JS */
// import './demo';

//SSR test for index.html
const div = document.createElement("div");
div.style.fontSize = "200%";
div.innerText = "Hello world, I'm SSR rendered";
document.body.appendChild(div);