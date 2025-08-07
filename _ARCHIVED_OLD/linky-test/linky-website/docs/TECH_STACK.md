# 🔧 Linky Platform - 기술 스택 문서

## 📋 기술 스택 개요

**아키텍처**: 모노리스 웹 애플리케이션  
**개발 방식**: Vanilla JavaScript (프레임워크 없음)  
**배포 환경**: Vercel (정적 호스팅 + 서버리스)  
**데이터베이스**: Supabase (PostgreSQL)

---

## 🎨 Frontend

### Core Technologies

#### HTML5
- **버전**: HTML5
- **특징**:
  - 시맨틱 마크업 사용
  - 폼 유효성 검사 (내장 validation)
  - Local Storage 활용
  - Meta 태그 최적화 (SEO, Open Graph)

#### CSS3
- **버전**: CSS3
- **특징**:
  - Flexbox & Grid 레이아웃
  - CSS 변수 (커스텀 프로퍼티)
  - 반응형 디자인 (미디어 쿼리)
  - 애니메이션 & 트랜지션
- **디자인 시스템**:
  ```css
  :root {
    --linky-primary: #22c55e;  /* 링키 그린 */
    --text-primary: #1a1a1a;
    --text-secondary: #666;
    --border-radius: 8px;
  }
  ```

#### JavaScript (Vanilla)
- **버전**: ES6+ (ES2015+)
- **특징**:
  - 모듈 시스템 (ES6 Modules)
  - async/await 비동기 처리
  - Fetch API 사용
  - DOM 조작 (querySelector)
  - 이벤트 위임 패턴

### UI/UX

#### 폰트
- **주 폰트**: Pretendard
  ```html
  <link rel="stylesheet" as="style" crossorigin 
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  ```
- **특징**: 한글/영문 최적화, 가독성 우수

#### 아이콘
- **방식**: SVG 인라인 또는 이미지
- **파비콘**: 
  - favicon.ico (브라우저 호환)
  - icon-512x512.png (PWA)
  - apple-touch-icon.png (iOS)

#### 색상 체계
| 용도 | 색상 | HEX |
|-----|------|-----|
| Primary | 링키 그린 | #22c55e |
| Success | 에메랄드 | #10b981 |
| Warning | 앰버 | #f59e0b |
| Error | 레드 | #ef4444 |
| Background | 화이트 | #ffffff |
| Text Primary | 다크 그레이 | #1a1a1a |

---

## 🗄️ Backend

### Supabase (BaaS - Backend as a Service)

#### PostgreSQL Database
- **버전**: PostgreSQL 15
- **특징**:
  - Row Level Security (RLS)
  - 실시간 구독 (Realtime)
  - 외래 키 제약조건
  - JSONB 데이터 타입
  - 전문 검색 (Full-text search)

#### Supabase Auth
- **인증 방식**: 
  - 이메일/비밀번호
  - JWT 토큰 기반
  - 세션 관리
- **보안**:
  - bcrypt 암호화
  - Rate limiting
  - 2FA 지원 (예정)

#### Supabase Storage
- **용도**: 이미지 저장 (작업 사진)
- **특징**:
  - CDN 통합
  - 이미지 변환 API
  - 액세스 제어

#### Supabase Realtime
- **프로토콜**: WebSocket
- **용도**:
  - 작업 상태 실시간 업데이트
  - 새 작업 알림
  - 채팅 (예정)

### API Architecture

#### RESTful API
- **엔드포인트 구조**: `/table_name/action`
- **HTTP 메서드**: GET, POST, PUT, DELETE
- **응답 형식**: JSON
- **인증**: Bearer Token (JWT)

#### JavaScript SDK
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mzihuflrbspvyjknxlad.supabase.co',
  'anon-key'
)
```

---

## 🚀 Infrastructure

### Hosting - Vercel

#### 정적 호스팅
- **배포 방식**: Git 연동 자동 배포
- **빌드**: 정적 파일 서빙
- **CDN**: Global Edge Network
- **SSL**: Let's Encrypt (자동)

#### 도메인
- **주 도메인**: linkykorea.com
- **SSL 인증서**: 자동 갱신
- **DNS**: Vercel DNS

#### 환경 변수
```javascript
// vercel.json
{
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### 모니터링 & 분석

#### Google Analytics 4
- **추적 ID**: G-RYYX6LYN2B
- **추적 항목**:
  - 페이지뷰
  - 사용자 행동
  - 전환율
  - 이벤트 추적

#### Vercel Analytics
- **Web Vitals**: 
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)
- **실시간 모니터링**

---

## 🛠️ Development Tools

### 코드 에디터
- **VS Code** (권장)
- **확장 프로그램**:
  - Live Server
  - Prettier
  - ESLint
  - Thunder Client (API 테스트)

### 버전 관리
- **Git**: 소스 코드 관리
- **GitHub**: 원격 저장소
- **브랜치 전략**: Git Flow

### 패키지 관리
- **npm**: 개발 도구 관리 (필요시)
- **CDN**: 프로덕션 라이브러리
  ```html
  <!-- Supabase SDK -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  ```

### 개발 환경
```bash
# 로컬 서버 실행
python -m http.server 8000
# 또는
npx live-server
```

---

## 📦 주요 라이브러리 & SDK

### 필수 라이브러리

#### Supabase JavaScript Client
- **버전**: 2.x
- **용도**: 데이터베이스, 인증, 스토리지
- **로드 방식**: CDN
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 선택적 라이브러리 (예정)

#### Chart.js
- **용도**: 통계 차트 (대시보드)
- **버전**: 4.x

#### Day.js
- **용도**: 날짜 처리
- **특징**: Moment.js 대체, 경량

#### DOMPurify
- **용도**: XSS 방지
- **특징**: HTML 살균

---

## 🔒 보안 기술

### 클라이언트 보안
- **Content Security Policy (CSP)**
- **XSS 방지**: 입력값 검증
- **HTTPS 전용**

### API 보안
- **JWT 토큰**: 만료 시간 설정
- **Rate Limiting**: API 호출 제한
- **CORS 설정**: 도메인 제한

### 데이터베이스 보안
- **Row Level Security (RLS)**: 행 수준 보안
- **SQL Injection 방지**: Prepared Statements
- **암호화**: bcrypt (비밀번호)

---

## 🎯 성능 최적화

### 프론트엔드 최적화
- **코드 스플리팅**: 페이지별 JS 분리
- **이미지 최적화**:
  - WebP 형식 사용
  - Lazy Loading
  - srcset 반응형 이미지
- **캐싱 전략**:
  - 브라우저 캐시
  - Service Worker (PWA)

### 데이터베이스 최적화
- **인덱싱**: 자주 조회하는 컬럼
- **쿼리 최적화**: EXPLAIN ANALYZE
- **연결 풀링**: Supabase 자동 관리

---

## 📱 PWA (Progressive Web App) - 예정

### 계획된 기능
- **오프라인 지원**: Service Worker
- **설치 가능**: Web App Manifest
- **푸시 알림**: Web Push API

### manifest.json (예정)
```json
{
  "name": "Linky Platform",
  "short_name": "Linky",
  "theme_color": "#22c55e",
  "background_color": "#ffffff",
  "display": "standalone",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

---

## 🔄 CI/CD Pipeline

### 현재 구성
```
GitHub (Push) → Vercel (Build) → Production
```

### 배포 프로세스
1. **개발**: 로컬 개발 환경
2. **커밋**: Git commit & push
3. **빌드**: Vercel 자동 빌드
4. **배포**: 프로덕션 배포
5. **모니터링**: Analytics 확인

---

## 📊 기술 스택 선택 이유

### Vanilla JavaScript 선택
✅ **장점**:
- 학습 곡선 없음
- 빠른 개발 속도
- 의존성 최소화
- 번들 크기 작음

❌ **단점**:
- 컴포넌트 재사용성 낮음
- 상태 관리 복잡
- 대규모 확장 어려움

### Supabase 선택
✅ **장점**:
- Firebase 대비 저렴
- PostgreSQL 사용
- 오픈소스
- RLS 지원

❌ **단점**:
- 한국 리전 없음
- 커뮤니티 작음

### Vercel 선택
✅ **장점**:
- 무료 티어 충분
- 자동 배포
- 글로벌 CDN
- Analytics 제공

❌ **단점**:
- 서버리스 한계
- 커스터마이징 제한

---

## 🚀 향후 기술 스택 계획

### 단기 (3개월)
- TypeScript 도입
- 테스트 프레임워크 (Jest)
- Tailwind CSS

### 중기 (6개월)
- React/Next.js 전환
- Redis 캐싱
- Docker 컨테이너화

### 장기 (1년)
- React Native 모바일 앱
- GraphQL API
- Kubernetes 오케스트레이션

---

## 📚 참고 문서

### 공식 문서
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [MDN Web Docs](https://developer.mozilla.org)

### 내부 문서
- [프로젝트 개요](./PROJECT_OVERVIEW.md)
- [데이터베이스 스키마](./DATABASE_SCHEMA.md)
- [API 문서](./API_DOCUMENTATION.md)

---

**최종 업데이트**: 2025-01-23  
**문서 버전**: 1.0  
**작성자**: Claude Code