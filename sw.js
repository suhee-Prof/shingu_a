const CACHE_NAME = "shingu-a-v2"; // ← 버전 올려야 캐시 갱신됨

const URLS_TO_CACHE = [
  "/shingu_a/",
  "/shingu_a/index.html",
  "/shingu_a/manifest.json",
  "/shingu_a/icon.png",
  "/shingu_a/og.png"
];

// 설치
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 활성화 (이전 캐시 제거)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 요청 처리
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // HTML 요청 → 네트워크 우선
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => {
          return caches.match("/shingu_a/index.html");
        })
    );
    return;
  }

  // 나머지 → 캐시 우선
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
      );
    })
  );
});
