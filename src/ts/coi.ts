export default null;
declare let self: ServiceWorkerGlobalScope;

const CACHE_NAME: string = "sutysisku";

function getOrFetch(response: Response | undefined): Response | undefined {
  if (!response) return;

  if (response.status === 0) return response;

  const extension: string | undefined = response.url.split(".").pop();
  const newHeaders: Headers = new Headers(response.headers);
  newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
  newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

  if (extension === "wasm") newHeaders.set("content-type", "application/wasm");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

if (typeof window === "undefined") {
  self.addEventListener("install", () => self.skipWaiting());

  self.addEventListener("activate", function (event: ExtendableEvent) {
    event.waitUntil(self.clients.claim());

    event.waitUntil(
      caches
        .keys()
        .then((keys: string[]) =>
          Promise.all(
            keys.map((key) => {
              if (CACHE_NAME !== key) {
                return caches.delete(key);
              }
              return;
            })
          )
        )
        .then(() => {
          self.clients.matchAll().then(function (clients) {});
        })
    );
  });

  self.addEventListener("message", (ev) => {
    if (ev.data && ev.data.type === "deregister") {
      self.registration.unregister().then(() => {
        return self.clients.matchAll();
      });
      // .then((clients) => {
      //   clients.forEach((client) => client.navigate(client.url));
      // });
    }
  });

  self.addEventListener("fetch", function (event: FetchEvent) {
    if (
      event.request.cache === "only-if-cached" &&
      event.request.mode !== "same-origin"
    ) {
      return;
    }

    event.respondWith(
      caches.open(CACHE_NAME).then(async function (cache) {
        let response;
        try {
          response = getOrFetch(await cache.match(event.request));
        } catch (error) {}
        if (response) return response;
        try {
          response = getOrFetch(await fetch(event.request));
        } catch (error) {}
        if (response) return response;
        return unableToResolve();
      })
    );
  });
} else {
  (() => {
    const coi = {
      shouldRegister: () => true,
      shouldDeregister: () => false,
      doReload: () => true,
      quiet: false,
    };

    const n: Navigator = navigator;
    if (
      coi.shouldDeregister() &&
      n.serviceWorker &&
      n.serviceWorker.controller
    ) {
      n.serviceWorker.controller.postMessage({ type: "deregister" });
    }

    if (window.crossOriginIsolated !== false || !coi.shouldRegister()) return;

    if (!window.isSecureContext) {
      !coi.quiet &&
        console.log(
          "COOP/COEP Service Worker not registered, a secure context is required."
        );
      return;
    }

    const currentScript = window.document.currentScript as HTMLScriptElement;
    if (n.serviceWorker && currentScript.src) {
      n.serviceWorker.register(currentScript.src).then(
        (registration) => {
          !coi.quiet &&
            console.log(
              "COOP/COEP Service Worker registered",
              registration.scope
            );

          registration.addEventListener("updatefound", () => {
            !coi.quiet &&
              console.log(
                "Reloading page to make use of updated COOP/COEP Service Worker."
              );
            coi.doReload();
          });

          if (registration.active && !n.serviceWorker.controller) {
            !coi.quiet &&
              console.log(
                "Reloading page to make use of COOP/COEP Service Worker."
              );
            coi.doReload();
          }
        },
        (err) => {
          !coi.quiet &&
            console.error("COOP/COEP Service Worker failed to register:", err);
        }
      );
    }
  })();
}

function unableToResolve(): Response {
  return new Response("<h1>Service Unavailable</h1>", {
    status: 503,
    statusText: "Service Unavailable",
    headers: new Headers({
      "Content-Type": "text/html",
    }),
  });
}
