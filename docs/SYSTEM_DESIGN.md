# Linky Platform 시스템 설계 문서

> 작성일: 2025-01-23
> 
> Linky Platform의 전체 시스템 아키텍처, 프로젝트 구조, 데이터베이스 설계를 정의합니다.

## 📐 1. 시스템 아키텍처

### 1.1 전체 구조
```
┌─────────────────────────────────────────────────────────────┐
│                         Linky Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                    Frontend (SPA)                    │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │                                                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│  │  │ Business │  │ Partner  │  │ Landing  │         │  │
│  │  │  Pages   │  │  Pages   │  │   Page   │         │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘         │  │
│  │       │             │             │                │  │
│  │       └─────────────┼─────────────┘                │  │
│  │                     │                              │  │
│  │            ┌────────▼────────┐                     │  │
│  │            │  Shared Layer   │                     │  │
│  │            │  (Auth & API)   │                     │  │
│  │            └────────┬────────┘                     │  │
│  └─────────────────────┼───────────────────────────────┘  │
│                        │                                   │
│  ┌─────────────────────▼───────────────────────────────┐  │
│  │                  Supabase Backend                    │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │                                                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│  │  │   Auth   │  │ Database │  │ Storage  │         │  │
│  │  │          │  │  (PgSQL) │  │          │         │  │
│  │  └──────────┘  └──────────┘  └──────────┘         │  │
│  │                                                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│  │  │   RLS    │  │ Realtime │  │Functions │         │  │
│  │  │ Policies │  │          │  │  (Edge)  │         │  │
│  │  └──────────┘  └──────────┘  └──────────┘         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 기술 스택
| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | HTML5, CSS3, Vanilla JS | 사용자 인터페이스 |
| Auth | Supabase Auth | 인증 및 세션 관리 |
| Database | PostgreSQL (Supabase) | 데이터 저장 |
| Storage | Supabase Storage | 파일 저장 (이미지 등) |
| Security | Row Level Security | 데이터 접근 제어 |
| Realtime | Supabase Realtime | 실시간 업데이트 (예정) |

### 1.3 사용자 플로우
```
Business User Flow:
Landing → Business Login → Dashboard → [Spaces/Jobs/Profile]

Partner User Flow:
Landing → Partner Login → Dashboard → [Jobs/Earnings/Profile]
```

## 📂 2. 프로젝트 구조 설계

### 2.1 디렉토리 구조
```
linky-platform/
│
├── 📁 src/                          # 소스 코드
│   ├── 📁 business/                 # 비즈니스 사용자 전용
│   │   ├── 📄 index.html           # 로그인 페이지
│   │   ├── 📄 dashboard.html       # 대시보드
│   │   ├── 📄 spaces.html          # 공간 관리
│   │   ├── 📄 jobs.html            # 작업 관리
│   │   ├── 📄 job-create.html      # 작업 생성
│   │   ├── 📄 job-detail.html      # 작업 상세
│   │   ├── 📄 profile.html         # 프로필 관리
│   │   └── 📄 reports.html         # 리포트
│   │
│   ├── 📁 partner/                  # 파트너 사용자 전용
│   │   ├── 📄 index.html           # 로그인 페이지
│   │   ├── 📄 dashboard.html       # 대시보드
│   │   ├── 📄 jobs.html            # 작업 목록
│   │   ├── 📄 job-detail.html      # 작업 상세
│   │   ├── 📄 earnings.html        # 수익 관리
│   │   ├── 📄 schedule.html        # 일정 관리
│   │   └── 📄 profile.html         # 프로필 관리
│   │
│   ├── 📁 shared/                   # 공통 리소스
│   │   ├── 📁 css/
│   │   │   ├── 📄 base.css        # 기본 스타일
│   │   │   ├── 📄 components.css  # 컴포넌트
│   │   │   └── 📄 themes.css      # 테마
│   │   ├── 📁 js/
│   │   │   ├── 📄 config.js       # 설정
│   │   │   ├── 📄 auth.js         # 인증 관리
│   │   │   ├── 📄 api.js          # API 클라이언트
│   │   │   ├── 📄 utils.js        # 유틸리티
│   │   │   └── 📄 validators.js   # 검증 함수
│   │   └── 📁 components/
│   │       ├── 📄 header.js       # 헤더
│   │       ├── 📄 footer.js       # 푸터
│   │       ├── 📄 modal.js        # 모달
│   │       └── 📄 toast.js        # 토스트 알림
│   │
│   └── 📁 landing/                  # 랜딩 페이지
│       └── 📄 index.html
│
├── 📁 database/                     # 데이터베이스
│   ├── 📁 schema/                   # 스키마 정의
│   ├── 📁 migrations/               # 마이그레이션
│   └── 📁 seeds/                    # 시드 데이터
│
├── 📁 tests/                        # 테스트
│   ├── 📄 dummy-data.js           # 더미 데이터
│   └── 📄 test-scenarios.js       # 테스트 시나리오
│
├── 📁 docs/                         # 문서
│   ├── 📄 SYSTEM_DESIGN.md        # 이 문서
│   ├── 📄 DATABASE_SCHEMA.md      # DB 스키마
│   └── 📄 API_REFERENCE.md        # API 문서
│
└── 📄 README.md                     # 프로젝트 설명
```

### 2.2 모듈 구조
```javascript
// 계층 구조
UI Layer (HTML)
    ↓
Component Layer (JS Components)
    ↓
Business Logic Layer (API Client)
    ↓
Data Layer (Supabase)
```

## 💾 3. 데이터베이스 설계

### 3.1 ERD (Entity Relationship Diagram)
```
┌─────────────────┐        ┌─────────────────┐
│ business_users  │        │ partner_users   │
├─────────────────┤        ├─────────────────┤
│ PK: id         │        │ PK: id          │
│ FK: auth_uid   │        │ FK: auth_uid    │
│ business_name  │        │ name            │
│ business_type  │        │ work_areas[]    │
│ ...            │        │ rating          │
└────────┬───────┘        └────────┬────────┘
         │                          │
         │ 1:N                      │ 1:N
         ↓                          ↓
┌─────────────────┐        ┌─────────────────┐
│     spaces      │        │      jobs       │
├─────────────────┤        ├─────────────────┤
│ PK: id         │    1:N │ PK: id          │
│ FK: owner_id   ├────────→ FK: business_id  │
│ name           │        │ FK: partner_id  │
│ type           │        │ FK: space_id    │
│ area           │        │ status          │
└─────────────────┘        └────────┬────────┘
                                    │
                          ┌─────────┴─────────┐
                          ↓         ↓         ↓
                ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
                │job_status_   │ │job_          │ │   ratings    │
                │history       │ │applications  │ │              │
                └──────────────┘ └──────────────┘ └──────────────┘
```

### 3.2 주요 테이블 설계

#### 3.2.1 사용자 테이블
```sql
-- Business Users (비즈니스 고객)
business_users {
    id: UUID [PK]
    auth_uid: UUID [FK -> auth.users]
    email: TEXT [UNIQUE]
    phone: TEXT
    business_name: TEXT
    business_type: ENUM
    status: ENUM (pending/approved/suspended)
    -- 통계 필드
    -- 메타데이터
}

-- Partner Users (청소 파트너)
partner_users {
    id: UUID [PK]
    auth_uid: UUID [FK -> auth.users]
    email: TEXT [UNIQUE]
    phone: TEXT
    name: TEXT
    work_areas: TEXT[]
    rating: DECIMAL(2,1)
    level: ENUM (bronze/silver/gold/platinum)
    -- 실적 필드
    -- 메타데이터
}
```

#### 3.2.2 핵심 비즈니스 테이블
```sql
-- Spaces (청소 공간)
spaces {
    id: UUID [PK]
    owner_id: UUID [FK -> business_users.auth_uid]
    name: TEXT
    type: ENUM (office/store/warehouse/factory)
    area: INTEGER
    address: TEXT
    cleaning_frequency: ENUM
}

-- Jobs (작업)
jobs {
    id: UUID [PK]
    business_id: UUID [FK -> business_users.auth_uid]
    partner_id: UUID [FK -> partner_users.auth_uid]
    space_id: UUID [FK -> spaces.id]
    title: TEXT
    status: ENUM
    scheduled_date: DATE
    scheduled_time: TIME
    base_price: DECIMAL
}
```

### 3.3 데이터 흐름
```
1. Business 작업 생성 플로우:
   Business → Create Job → jobs 테이블 INSERT → status: 'pending'

2. Partner 작업 지원 플로우:
   Partner → Apply for Job → job_applications INSERT

3. 작업 배정 플로우:
   Business → Accept Application → jobs UPDATE (partner_id) → status: 'assigned'

4. 작업 완료 플로우:
   Partner → Complete Job → jobs UPDATE → status: 'completed'
   Business → Verify → ratings INSERT
```

## 🔌 4. API 설계

### 4.1 API 구조
```javascript
API
├── BaseAPI (기본 CRUD)
│   ├── select()
│   ├── insert()
│   ├── update()
│   └── delete()
│
├── BusinessAPI extends BaseAPI
│   ├── getDashboardStats()
│   ├── getSpaces()
│   ├── createSpace()
│   ├── updateSpace()
│   ├── deleteSpace()
│   ├── getJobs()
│   ├── createJob()
│   └── assignPartner()
│
└── PartnerAPI extends BaseAPI
    ├── getDashboardStats()
    ├── getAvailableJobs()
    ├── getMyJobs()
    ├── applyForJob()
    ├── updateJobStatus()
    └── updateProfile()
```

### 4.2 API 호출 예시
```javascript
// Business API 사용
const spaces = await businessAPI.getSpaces(userId);
const newJob = await businessAPI.createJob(userId, {
    title: '정기 청소',
    space_id: spaceId,
    scheduled_date: '2025-01-25',
    base_price: 50000
});

// Partner API 사용
const availableJobs = await partnerAPI.getAvailableJobs();
const application = await partnerAPI.applyForJob(jobId, partnerId);
```

## 📋 5. 페이지별 기능 명세

### 5.1 Business 페이지

| 페이지 | 주요 기능 | API 호출 |
|--------|----------|----------|
| dashboard.html | 통계 표시, 최근 작업 | getDashboardStats(), getJobs() |
| spaces.html | 공간 목록, CRUD | getSpaces(), createSpace(), updateSpace(), deleteSpace() |
| jobs.html | 작업 목록, 필터링 | getJobs(), updateJob() |
| job-create.html | 작업 생성 폼 | getSpaces(), createJob() |
| job-detail.html | 작업 상세, 파트너 관리 | getJob(), assignPartner() |

### 5.2 Partner 페이지

| 페이지 | 주요 기능 | API 호출 |
|--------|----------|----------|
| dashboard.html | 통계, 대기 작업 | getDashboardStats(), getAvailableJobs() |
| jobs.html | 작업 검색, 지원, 내 작업 | getAvailableJobs(), getMyJobs(), applyForJob() |
| job-detail.html | 작업 상세, 상태 업데이트 | getJob(), updateJobStatus() |
| earnings.html | 수익 통계, 정산 내역 | getEarnings(), getPayments() |

## 🔐 6. 보안 설계

### 6.1 인증 플로우
```
1. 로그인:
   Email/Password → Supabase Auth → JWT Token → Session Storage

2. 세션 확인:
   Page Load → Check Session → Valid? → Continue : Redirect to Login

3. API 호출:
   Request + JWT Token → Supabase → RLS Check → Response
```

### 6.2 권한 관리 (RLS)
```sql
-- Business users는 자신의 데이터만
CREATE POLICY "Business own data" ON spaces
    FOR ALL USING (owner_id = auth.uid());

-- Partners는 pending jobs 조회 + 자신의 jobs
CREATE POLICY "Partner job access" ON jobs
    FOR SELECT USING (
        status = 'pending' OR 
        partner_id = auth.uid()
    );
```

## 🚀 7. 구현 우선순위

### Phase 1: Core (현재 완료)
- ✅ 프로젝트 구조 설정
- ✅ 인증 시스템
- ✅ Business/Partner 로그인
- ✅ 대시보드

### Phase 2: Business Features (다음)
- ⬜ Spaces CRUD
- ⬜ Jobs 생성/관리
- ⬜ Partner 선택

### Phase 3: Partner Features
- ⬜ Job 검색/지원
- ⬜ Job 수행
- ⬜ 수익 관리

### Phase 4: Advanced
- ⬜ 실시간 알림
- ⬜ 채팅
- ⬜ 결제 시스템
- ⬜ 리포트/분석

## 📊 8. 성능 고려사항

### 8.1 최적화 전략
- 인덱스: 자주 조회되는 컬럼에 인덱스 생성
- 캐싱: 정적 데이터는 로컬 스토리지 활용
- 페이지네이션: 대량 데이터는 페이지 단위 로드
- Lazy Loading: 이미지 지연 로딩

### 8.2 확장성
- Stateless 설계로 수평 확장 가능
- Supabase Edge Functions로 서버리스 확장
- CDN 활용한 정적 리소스 배포

## 🎯 9. 개발 가이드라인

### 9.1 코딩 컨벤션
```javascript
// 네이밍
- HTML: kebab-case (job-detail.html)
- CSS: kebab-case (.stat-card)
- JS: camelCase (getDashboardStats)
- DB: snake_case (business_users)

// 파일 구조
- 1 페이지 = 1 HTML 파일
- 공통 로직은 shared/js에 분리
- 컴포넌트는 재사용 가능하게 작성
```

### 9.2 Git 브랜치 전략
```
main
├── feature/business-spaces
├── feature/partner-jobs
└── fix/auth-redirect
```

## 📝 10. 테스트 전략

### 10.1 테스트 시나리오
1. **Business Flow**
   - 회원가입 → 로그인 → 공간 등록 → 작업 생성 → 파트너 배정 → 완료 확인

2. **Partner Flow**
   - 회원가입 → 로그인 → 작업 검색 → 지원 → 수락 → 작업 수행 → 완료

3. **Integration Test**
   - Business-Partner 상호작용
   - 평가 시스템
   - 알림 시스템

### 10.2 더미 데이터
```javascript
// tests/dummy-data.js
- Business 계정 2개
- Partner 계정 2개
- Spaces 3개
- Jobs 4개 (다양한 상태)
```

---

> 📌 이 설계 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.