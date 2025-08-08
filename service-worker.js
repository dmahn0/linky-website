/**
 * Linky Platform Service Worker
 * PWA 오프라인 지원 및 캐싱 전략
 */

const CACHE_NAME = 'linky-v1.1.0-job-system';
const urlsToCache = [
  '/',
  '/src/landing/index.html',
  '/src/business/index.html',
  '/src/partner/index.html',
  '/src/shared/css/base.css',
  '/src/shared/css/components.css',
  '/src/shared/css/ui-core.css',
  '/src/shared/js/ui-components.js',
  '/manifest.json'
];

// 설치 이벤트
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 열기 완료');
        return cache.addAll(urlsToCache);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 페치 이벤트 (네트워크 우선, 캐시 폴백)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 유효한 응답이면 캐시에 저장
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 가져오기
        return caches.match(event.request);
      })
  );
});

// 백그라운드 동기화
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // 오프라인 중 저장된 데이터 동기화
  console.log('데이터 동기화 시작');
}