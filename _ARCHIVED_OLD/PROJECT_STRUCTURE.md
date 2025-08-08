# 🔗 Linky Platform - 전체 프로젝트 구조 문서

## 📋 프로젝트 개요

**프로젝트명**: Linky Platform (링키 플랫폼)  
**설명**: 무인공간 운영자와 정리 파트너를 연결하는 온디맨드 매칭 플랫폼  
**현재 상태**: Supabase 마이그레이션 완료, 웹 플랫폼 운영 중  
**주요 기술**: Supabase, PostgreSQL, HTML/JS/CSS  

## 🏗️ 전체 시스템 아키텍처

### 웹 플랫폼 상세 구조

```
웹 플랫폼 (linky-test/linky-website)
├── 🌐 공개 페이지 (인증 불필요)
│   ├── index.html                    # 메인 랜딩 페이지
│   ├── business/index.html           # 비즈니스 서비스 소개
│   ├── partners/index.html           # 파트너 모집 페이지
│   └── business/contract.html        # 온라인 계약서 작성
│
├── 💼 비즈니스 전용 페이지 (business_users 인증)
│   ├── business/dashboard.html       # 메인 대시보드
│   ├── 공간 관리
│   │   ├── spaces.html              # 공간 목록 관리
│   │   ├── space-registration.html  # 신규 공간 등록
│   │   └── direct-spaces.html       # 직영 공간 관리
│   ├── 작업 관리
│   │   ├── jobs.html                # 작업 목록
│   │   ├── job-list.html            # 작업 상세 목록
│   │   ├── job-detail.html          # 개별 작업 상세
│   │   ├── job-status.html          # 작업 상태 추적
│   │   ├── job-request.html         # 작업 요청
│   │   ├── create-job.html          # 작업 생성
│   │   └── job-completion-review.html # 완료 검토
│   └── 정산 관리
│       ├── billings.html            # 정산 내역
│       └── billing.html             # 개별 정산 상세
│
├── 🤝 파트너 전용 페이지 (partner_users 인증)
│   ├── partners/dashboard.html       # 파트너 대시보드
│   ├── partners/jobs.html           # 이용 가능한 작업
│   ├── partners/job-detail.html     # 작업 상세 정보
│   └── partners/earnings.html       # 수익 관리
│
├── 🔧 관리자 전용 페이지 (admins 인증)
│   ├── admin/index.html             # 관리자 포털
│   ├── admin/login.html             # 관리자 로그인
│   ├── admin/signup.html            # 관리자 계정 생성
│   ├── admin/dashboard.html         # 시스템 관리 대시보드
│   └── admin/fix-spaces-schema.html # DB 스키마 관리
│
└── 🚧 미래 기능 (개발 예정)
    ├── education/index.html         # 교육 서비스
    └── facility/index.html          # 시설 관리 서비스
```

### 데이터베이스 상세 구조

```
데이터베이스 (Supabase PostgreSQL)
├── 👥 사용자 테이블
│   ├── business_users
│   │   ├── auth_uid (FK → supabase.auth.users)
│   │   ├── business_name, business_number
│   │   ├── status (pending/approved/suspended)
│   │   └── bank_info, statistics
│   ├── partner_users
│   │   ├── auth_uid (FK → supabase.auth.users)
│   │   ├── name, phone, work_areas[]
│   │   ├── status, level, rating
│   │   └── earnings, bank_info
│   └── admins
│       ├── auth_uid (FK → supabase.auth.users)
│       └── role (admin/super_admin)
│
├── 🏢 서비스 테이블
│   ├── spaces
│   │   ├── owner_id (FK → business_users.auth_uid)
│   │   ├── name, address, size, type
│   │   └── status (active/inactive)
│   ├── jobs
│   │   ├── business_id (FK → business_users.auth_uid)
│   │   ├── partner_id (FK → partner_users.auth_uid)
│   │   ├── space_id (FK → spaces.id)
│   │   ├── status (대기/진행중/완료/취소)
│   │   └── price, schedule, photos[]
│   └── notifications
│       ├── user_id, type, title, body
│       └── is_read, created_at


## 📁 디렉토리 구조

### 루트 디렉토리
```
linky-platform/
├── CLAUDE.md                    # 프로젝트 지침 및 개발 가이드라인
├── PROJECT_STRUCTURE.md         # 이 문서
├── ui-core.html                 # 34개 UI 컴포넌트 완성본
├── README.md                    # 프로젝트 README
├── config/                      # 설정 파일들
│   ├── api.config.js           # API 설정
│   ├── ui.config.js            # UI 설정
│   └── app.config.js           # 앱 설정
├── docs/                        # 문서
│   ├── DESIGN_SYSTEM.md        # 디자인 시스템
│   ├── PWA_ARCHITECTURE.md    # PWA 아키텍처
│   └── SUPABASE_SETUP.md      # Supabase 설정
├── scripts/                     # 도우미 스크립트
│   ├── docs-guide-helper.js   # 문서 가이드 도우미
│   └── pre-commit-check.js    # 커밋 전 체크
├── sql/                         # 최신 SQL 마이그레이션 파일들
└── linky-test/                  # 웹 플랫폼 프로젝트
```

### 웹 플랫폼 (linky-test/linky-website)
```
linky-test/
├── 사업계획서.md               # 비즈니스 계획서
├── LINKY_SETUP_GUIDE.md        # 플랫폼 설정 가이드
├── DATABASE_SCHEMA.md          # 레거시 Firebase 스키마
└── linky-website/
    ├── 문서/
    │   ├── SYSTEM_ARCHITECTURE.md      # 새 시스템 아키텍처
    │   ├── FILE_STRUCTURE_GUIDE.md     # 파일 구조 가이드
    │   ├── DATABASE_MIGRATION_PLAN.md  # DB 마이그레이션 계획
    │   ├── IMPLEMENTATION_STEPS.md     # 구현 단계
    │   └── CURRENT_MIGRATION_STATUS.md # 마이그레이션 현황
    ├── 프론트엔드/
    │   ├── index.html                  # 메인 랜딩 페이지
    │   ├── business/                   # 비즈니스 페이지들
    │   ├── partners/                   # 파트너 페이지들
    │   ├── admin/                      # 관리자 페이지들
    │   ├── css/                        # 스타일시트
    │   └── js/                         # JavaScript 파일들
    └── 백엔드/
        ├── supabase-config.js          # Supabase 설정
        └── sql/                        # SQL 마이그레이션 파일들
```


## 🗄️ 데이터베이스 구조

### 주요 테이블 (Supabase PostgreSQL)

#### 사용자 관련
- **business_users**: 비즈니스 사용자 정보
- **partner_users**: 파트너 사용자 정보
- **admins**: 관리자 정보

#### 서비스 관련
- **spaces**: 공간 정보 (owner_id → business_users.auth_uid)
- **jobs**: 작업 요청 및 매칭 정보
- **notification_settings**: 알림 설정

### 주요 마이그레이션 이력
1. Firebase → Supabase 전환
2. 단일 users 테이블 → 타입별 테이블 분리 (배민 방식)
3. RLS (Row Level Security) 정책 적용
4. 닉네임 기능 추가

## 🔧 기술 스택

### 프론트엔드
- **웹**: HTML5, CSS3, Vanilla JavaScript
- **스타일**: Pretendard 폰트, 링키그린(#22c55e) 브랜드 컬러
- **UI 시스템**: ui-core.html 기반 컴포넌트 시스템

### 백엔드
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **실시간**: Supabase Realtime
- **저장소**: Supabase Storage

### 인프라
- **호스팅**: Vercel (웹)

## 🚀 주요 기능

### 비즈니스 사용자
- 공간 등록 및 관리
- 작업 요청 생성
- 파트너 평가
- 결제 및 정산

### 파트너 사용자
- 작업 검색 및 수락
- 수익 관리
- 활동 지역 설정

### 관리자
- 사용자 승인/관리
- 시스템 모니터링
- 통계 및 리포트

## 📝 주요 문서

### 시스템 설계
- `SYSTEM_ARCHITECTURE.md`: 전체 시스템 아키텍처
- `DATABASE_MIGRATION_PLAN.md`: 데이터베이스 마이그레이션 계획
- `FILE_STRUCTURE_GUIDE.md`: 상세 파일 구조 가이드

### 개발 가이드
- `CLAUDE.md`: 개발 지침 및 코딩 스타일
- `LINKY_SETUP_GUIDE.md`: 프로젝트 설정 가이드
- `IMPLEMENTATION_STEPS.md`: 구현 단계별 가이드

### 비즈니스
- `사업계획서.md`: 사업 모델 및 시장 분석

## 🔐 보안 및 권한

### Row Level Security (RLS)
- 모든 사용자 테이블에 RLS 적용
- 사용자는 본인 데이터만 접근 가능
- 관리자는 추가 권한 보유

### API 보안
- Supabase Auth 기반 인증
- 타입별 전용 API 분리
- SQL Injection 방지

## 📈 현재 진행 상황

### 완료된 작업
- ✅ Firebase → Supabase 마이그레이션
- ✅ 사용자 타입별 테이블 분리
- ✅ 웹 플랫폼 MVP 개발
- ✅ UI 컴포넌트 시스템 구축 (ui-core.html)

### 진행 중
- 🔄 사용자 경험 개선
- 🔄 디자인 시스템 통일
- 🔄 성능 최적화

### 계획 중
- 📋 결제 시스템 통합
- 📋 고급 분석 도구

## 🎯 개발 원칙

1. **모듈화**: 코드가 길어지면 모듈화하여 관리
2. **문서화**: 주요 변경사항은 history.md에 기록
3. **디자인 일관성**: 흰색 배경, 링키그린 강조색 사용
4. **보안 우선**: RLS 정책 및 API 권한 관리
5. **UI 재사용**: ui-core.html의 컴포넌트 활용

## 🤝 기여 방법

1. 기능 개발 시 관련 문서 업데이트
2. 코드 스타일 가이드라인 준수 (CLAUDE.md 참조)
3. 테스트 후 배포
4. 변경사항 history.md에 기록

---

**최종 업데이트**: 2025-01-23  
**작성자**: Claude Code  
**버전**: 2.0