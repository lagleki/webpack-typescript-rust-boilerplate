import { fetchTimeout } from "../../utils/fns";

export async function fetchFromAppCache({
  url,
  cacheName,
  noCache,
}: {
  url: string;
  cacheName: string;
  noCache: boolean;
}) {
  const cache = await caches.open(cacheName);
  const response = noCache ? undefined : await cache.match(url);
  if (response) {
    return response;
  } else {
    const response = await fetch(url);
    cache.put(url, response.clone());
    return response;
  }
}
