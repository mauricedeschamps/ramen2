const CACHE_NAME = 'ramen-guide-v1';
const urlsToCache = [
  'index.html',
  'manifest.json',
  // 画像はキャッシュしない（外部ドメインのため）が、オフライン時のフォールバックとして同じドメインに置く場合は追加
  // ここでは外部画像が多いため、キャッシュはHTMLとマニフェストのみにしておく
];

// インストール時にキャッシュを追加
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// リクエストに対するレスポンスをキャッシュから返す（キャッシュファースト）
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュがあればそれを返す
        if (response) {
          return response;
        }
        // キャッシュがなければネットワークへフェッチ
        return fetch(event.request).then(
          networkResponse => {
            // 有効なレスポンチかチェック（今回は画像などはキャッシュしない）
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // 必要に応じてキャッシュに追加（今回はHTML以外は追加しない）
            // ここではシンプルにネットワークレスポンスを返す
            return networkResponse;
          }
        );
      })
  );
});

// 古いキャッシュの削除
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});