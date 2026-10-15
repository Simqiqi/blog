/* 柒柒的博客 · Service Worker
 * 策略：导航 network-first（带回退到缓存首页），静态资源 cache-first。
 * 注意：本文件位于 /blog/ 子路径，scope 已固定为 /blog/。
 */
const CACHE = 'qigi-blog-v1';
const PRECACHE = [
  '/blog/',
  '/blog/index.html',
  '/blog/css/style.css',
  '/blog/css/widgets.css',
  '/blog/js/main.js',
  '/blog/js/article.js',
  '/blog/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 第三方资源不拦截

  // 导航请求：优先网络，失败回退缓存
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/blog/index.html')))
    );
    return;
  }

  // 静态资源：缓存优先，缺失则网络并写入缓存
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
