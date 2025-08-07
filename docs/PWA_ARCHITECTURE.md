# 🚀 Linky Platform PWA 아키텍처 문서

## 📋 개요

이 문서는 Linky Platform을 Progressive Web App(PWA)으로 전환하기 위한 상세한 아키텍처와 구현 가이드를 제공합니다.

### 현재 상태
- **구조**: 전통적인 멀티페이지 애플리케이션 (MPA)
- **페이지 수**: 40+ HTML 파일
- **기술 스택**: Vanilla JavaScript, Supabase, HTML/CSS
- **PWA 지원**: 없음

### 목표
- ✅ 오프라인 지원
- ✅ 푸시 알림
- ✅ 홈 화면 설치
- ✅ 네이티브 앱 경험
- ✅ 빠른 로딩 속도

## 🏗️ PWA 아키텍처

### 1. 전체 구조
```
┌─────────────────────────────────────────────────┐
│                   사용자 기기                     │
├─────────────────────────────────────────────────┤
│  PWA Shell                                      │
│  ├── manifest.json (앱 메타데이터)               │
│  ├── Service Worker (sw.js)                    │
│  │   ├── 캐시 관리                             │
│  │   ├── 오프라인 처리                         │
│  │   └── 푸시 알림                             │
│  └── 웹 앱 (기존 HTML/JS/CSS)                  │
├─────────────────────────────────────────────────┤
│              백엔드 서비스                        │
│  ├── Supabase (데이터베이스, 인증)              │
│  ├── Edge Functions (서버리스)                  │
│  └── 알림 서비스 (웹 푸시, 카카오)              │
└─────────────────────────────────────────────────┘
```

### 2. 핵심 컴포넌트

#### 2.1 Web App Manifest (manifest.json)
```json
{
  "name": "Linky Platform",
  "short_name": "Linky",
  "description": "무인공간 운영자와 정리 파트너를 연결하는 온디맨드 매칭 플랫폼",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#22c55e",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/assets/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "/assets/screenshots/home.png",
      "sizes": "1080x1920",
      "type": "image/png"
    },
    {
      "src": "/assets/screenshots/dashboard.png",
      "sizes": "1080x1920",
      "type": "image/png"
    }
  ],
  "categories": ["business", "productivity"],
  "shortcuts": [
    {
      "name": "새 작업 생성",
      "url": "/business/create-job.html",
      "icons": [{"src": "/assets/icons/create-job.png", "sizes": "96x96"}]
    },
    {
      "name": "대시보드",
      "url": "/business/dashboard.html",
      "icons": [{"src": "/assets/icons/dashboard.png", "sizes": "96x96"}]
    }
  ]
}
```

#### 2.2 Service Worker 아키텍처
```javascript
// sw.js 구조
const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  static: `static-cache-${CACHE_VERSION}`,
  dynamic: `dynamic-cache-${CACHE_VERSION}`,
  images: `image-cache-${CACHE_VERSION}`,
  api: `api-cache-${CACHE_VERSION}`
};

// 캐싱 전략
const CACHING_STRATEGIES = {
  networkFirst: ['/api/', '/auth/'],      // 실시간 데이터
  cacheFirst: ['/css/', '/js/', '/fonts/'], // 정적 자산
  staleWhileRevalidate: ['/images/'],    // 이미지
  networkOnly: ['/admin/']                // 관리자 페이지
};
```

### 3. 캐싱 전략 상세

#### 3.1 정적 자산 (Cache First)
```
요청 → 캐시 확인 → 있으면 캐시 반환
                  ↓ 없으면
                  네트워크 요청 → 캐시 저장 → 반환
```
- CSS, JavaScript, 폰트 파일
- 버전 관리로 업데이트

#### 3.2 API 응답 (Network First)
```
요청 → 네트워크 시도 → 성공시 캐시 업데이트 → 반환
                    ↓ 실패시
                    캐시 확인 → 있으면 캐시 반환
                             ↓ 없으면
                             오프라인 페이지
```
- 작업 목록, 사용자 정보
- 5분간 캐시 유지

#### 3.3 이미지 (Stale While Revalidate)
```
요청 → 캐시 반환 (즉시)
     ↓ 동시에
     백그라운드에서 네트워크 요청 → 캐시 업데이트
```
- 빠른 로딩 + 최신 상태 유지

### 4. 오프라인 지원 전략

#### 4.1 필수 페이지 사전 캐싱
```javascript
const ESSENTIAL_FILES = [
  '/',
  '/offline.html',
  '/css/common.css',
  '/js/auth-utils.js',
  '/assets/logo.png'
];

// Service Worker 설치 시 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then(cache => cache.addAll(ESSENTIAL_FILES))
  );
});
```

#### 4.2 동적 페이지 캐싱
- 사용자가 방문한 페이지 자동 캐싱
- LRU (Least Recently Used) 정책으로 관리
- 최대 50개 페이지 유지

#### 4.3 오프라인 폴백
```javascript
// 네트워크 실패 시 처리
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline.html'))
    );
  }
});
```

### 5. 푸시 알림 아키텍처

#### 5.1 알림 흐름
```
서버 이벤트 발생
     ↓
Supabase Edge Function
     ↓
     ├── 웹 푸시 서버 → Service Worker → 알림 표시
     └── 카카오 API → 카카오톡 알림
```

#### 5.2 구독 관리
```javascript
// 푸시 알림 구독
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  
  // VAPID 키로 구독
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });
  
  // 서버에 구독 정보 저장
  await saveSubscription(subscription);
}
```

#### 5.3 알림 타입별 처리
```javascript
// Service Worker에서 푸시 이벤트 처리
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: getActionsForType(data.type)
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

function getActionsForType(type) {
  switch(type) {
    case 'new_job':
      return [
        {action: 'view', title: '자세히 보기'},
        {action: 'apply', title: '지원하기'}
      ];
    case 'job_completed':
      return [
        {action: 'review', title: '리뷰 작성'},
        {action: 'view', title: '확인'}
      ];
    default:
      return [];
  }
}
```

### 6. 성능 최적화

#### 6.1 App Shell 모델
```
┌─────────────────────────┐
│    App Shell (캐시됨)    │
│  ├── 헤더              │
│  ├── 네비게이션         │
│  └── 푸터              │
├─────────────────────────┤
│   동적 콘텐츠 영역       │
│   (API로 로드)          │
└─────────────────────────┘
```

#### 6.2 리소스 우선순위
1. **Critical**: HTML, 핵심 CSS/JS
2. **High**: 폰트, 로고
3. **Medium**: 이미지, 아이콘
4. **Low**: 분석 스크립트, 타사 위젯

#### 6.3 번들 최적화
```javascript
// 코드 분할 예시
const loadDashboard = () => import('./modules/dashboard.js');
const loadJobManager = () => import('./modules/job-manager.js');

// 라우트별 동적 로딩
if (location.pathname.includes('/dashboard')) {
  loadDashboard().then(module => module.init());
}
```

### 7. 설치 유도 전략

#### 7.1 설치 프롬프트 타이밍
```javascript
let deferredPrompt;
let visitCount = localStorage.getItem('visitCount') || 0;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // 3번째 방문 이후 표시
  if (visitCount >= 3) {
    showInstallPromotion();
  }
});
```

#### 7.2 사용자 타입별 전략
- **비즈니스 사용자**: 첫 로그인 후 즉시
- **파트너**: 첫 작업 완료 후
- **방문자**: 3번 방문 후

### 8. 멀티페이지 앱(MPA)에서의 PWA 구현

#### 8.1 공통 컴포넌트
```javascript
// pwa-init.js - 모든 페이지에 포함
class PWAManager {
  constructor() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.checkNotificationPermission();
  }
  
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered:', registration);
      } catch (error) {
        console.error('SW registration failed:', error);
      }
    }
  }
}

// 모든 페이지에서 초기화
window.addEventListener('load', () => {
  new PWAManager();
});
```

#### 8.2 페이지별 캐싱 규칙
```javascript
// 페이지 타입별 캐싱 정책
const PAGE_CACHE_RULES = {
  '/business/dashboard.html': {
    strategy: 'networkFirst',
    ttl: 5 * 60 * 1000  // 5분
  },
  '/partners/jobs.html': {
    strategy: 'networkFirst',
    ttl: 2 * 60 * 1000  // 2분 (자주 업데이트)
  },
  '/about.html': {
    strategy: 'cacheFirst',
    ttl: 24 * 60 * 60 * 1000  // 24시간
  }
};
```

### 9. 테스트 전략

#### 9.1 PWA 체크리스트
- [ ] Lighthouse PWA 점수 90+ 달성
- [ ] 오프라인 시 기본 기능 작동
- [ ] 3G 네트워크에서 3초 내 로딩
- [ ] 모든 주요 브라우저 호환
- [ ] iOS/Android 설치 가능

#### 9.2 성능 메트릭
- **FCP** (First Contentful Paint): < 1.8s
- **TTI** (Time to Interactive): < 3.8s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### 10. 보안 고려사항

#### 10.1 HTTPS 필수
- Service Worker는 HTTPS에서만 작동
- localhost는 예외

#### 10.2 CSP (Content Security Policy)
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://*.supabase.co;">
```

#### 10.3 푸시 알림 보안
- VAPID 키 관리
- 구독 정보 암호화
- 사용자별 권한 검증

## 📱 구현 예제

### 기본 HTML 구조
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- PWA 메타 태그 -->
    <meta name="theme-color" content="#22c55e">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    
    <!-- 매니페스트 -->
    <link rel="manifest" href="/manifest.json">
    
    <!-- 아이콘 -->
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/icon-32x32.png">
    <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
    
    <title>Linky Platform</title>
    
    <!-- PWA 초기화 스크립트 -->
    <script src="/js/pwa/pwa-init.js" defer></script>
</head>
<body>
    <!-- 콘텐츠 -->
</body>
</html>
```

## 🚀 구현 로드맵

### Phase 1: 기본 PWA (1주)
1. manifest.json 생성
2. 아이콘 세트 제작
3. 기본 Service Worker
4. 설치 가능하게 만들기

### Phase 2: 오프라인 지원 (1주)
1. 캐싱 전략 구현
2. 오프라인 페이지
3. 동적 캐싱

### Phase 3: 푸시 알림 (1주)
1. 웹 푸시 구현
2. 알림 권한 UI
3. 서버 연동

### Phase 4: 최적화 (1주)
1. 성능 측정
2. 번들 최적화
3. 이미지 최적화

### Phase 5: 고급 기능 (2주)
1. 백그라운드 동기화
2. 카카오 알림톡 연동
3. A/B 테스트

## 📚 참고 자료

- [Web.dev PWA 가이드](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/ko/docs/Web/API/Service_Worker_API)
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)

---

작성일: 2025-08-06
작성자: Claude Code