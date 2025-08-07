# 📂 Linky Platform 구조

## 🌳 페이지 구조

```
linkykorea.com/
│
├── 🏠 index.html (메인)
│
├── 📁 business/ (비즈니스)
│   ├── index.html (소개)
│   ├── dashboard.html ⭐ (대시보드)
│   ├── contract.html (계약서)
│   │
│   ├── [공간 관리]
│   │   ├── spaces.html (목록)
│   │   ├── space-registration.html (등록)
│   │   └── direct-spaces.html (직영)
│   │
│   ├── [작업 관리]
│   │   ├── jobs.html (목록)
│   │   ├── job-list.html (테이블뷰)
│   │   ├── job-detail.html (상세)
│   │   ├── job-status.html (상태)
│   │   ├── job-request.html (요청)
│   │   ├── create-job.html (생성)
│   │   └── job-completion-review.html (검토)
│   │
│   └── [정산]
│       ├── billings.html (목록)
│       └── billing.html (상세)
│
├── 📁 partners/ (파트너)
│   ├── index.html (소개)
│   ├── dashboard.html ⭐ (대시보드)
│   ├── jobs.html (작업목록)
│   ├── job-detail.html (작업상세)
│   └── earnings.html (수익)
│
└── 📁 admin/ (관리자)
    ├── index.html (포털)
    ├── login.html (로그인)
    ├── signup.html (가입)
    ├── dashboard.html ⭐ (대시보드)
    └── fix-spaces-schema.html (DB관리)
```

---

## 💾 데이터베이스 현재 상태

### 📊 테이블 구조

```
auth.users (Supabase 인증)
    ↓
    ├── business_users (비즈니스)
    │   └── spaces (공간들)
    │       └── jobs (작업들)
    │
    ├── partner_users (파트너)
    │   └── jobs (할당된 작업)
    │
    └── admins (관리자)
```

### 📋 테이블별 데이터

#### 1️⃣ **business_users**
```
필수: email, phone, business_name, business_number
선택: bank_name, account_number, nickname
상태: pending → approved (관리자 승인 필요)
```

#### 2️⃣ **partner_users**
```
필수: email, phone, name, work_areas[]
선택: bank_name, account_number, nickname
실적: rating, completed_jobs, total_earnings
상태: pending → approved (관리자 승인 필요)
```

#### 3️⃣ **spaces**
```
소유: business_users가 소유
정보: name, type, address, size
상태: active/inactive
```

#### 4️⃣ **jobs**
```
관계: business → space → partner
진행: 대기 → 매칭중 → 진행중 → 완료
금액: price, partner_fee, platform_fee
평가: 양방향 평점 (1-5)
```

#### 5️⃣ **admins**
```
권한: admin, super_admin
기능: 사용자 승인, 시스템 관리
```

---

## 🔄 현재 프로젝트 상태

### ✅ 완료
- 사용자 3개 타입 분리 (business/partner/admin)
- 기본 CRUD 모든 페이지
- Supabase 연동

### 🔄 진행중
- Firebase → Supabase 데이터 이전
- 실시간 기능

### ❌ 미완료
- 결제 시스템
- 푸시 알림
- 자동 매칭

---

## 🗂️ 파일 위치

```
linky-test/linky-website/
├── 📄 *.html (30개 페이지)
├── 📁 js/
│   ├── api/ (business-api.js, partner-api.js)
│   └── auth/ (인증 모듈 4개)
├── 📁 sql/ (마이그레이션 20개)
├── 📁 docs/ (이 문서)
└── 📄 supabase-config.js (설정)
```

---

**Supabase URL**: mzihuflrbspvyjknxlad.supabase.co  
**도메인**: linkykorea.com  
**마지막 업데이트**: 2025-01-23