# Linky Platform 데이터베이스 구조 문서

> 최종 업데이트: 2025-01-23
> 
> 이 문서는 Linky Platform의 전체 데이터베이스 스키마, 테이블 관계, 데이터 흐름을 상세히 설명합니다.

## 📊 1. 데이터베이스 스키마 개요

### 1.1 시스템 아키텍처
- **데이터베이스**: Supabase (PostgreSQL)
- **인증 시스템**: Supabase Auth
- **실시간 기능**: Supabase Realtime
- **파일 저장소**: Supabase Storage

### 1.2 주요 테이블 구조

```
┌─────────────────────────────────────────────────────────────┐
│                     Linky Platform DB Schema                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐        ┌──────────────┐                 │
│  │ auth.users   │        │   admins     │                 │
│  │ (Supabase)   │        │              │                 │
│  └──────┬───────┘        └──────────────┘                 │
│         │                                                  │
│         ├────────────────────┬─────────────────┐          │
│         ▼                    ▼                 ▼          │
│  ┌──────────────┐     ┌──────────────┐  ┌──────────────┐ │
│  │business_users│     │partner_users │  │   admins     │ │
│  └──────┬───────┘     └──────┬───────┘  └──────────────┘ │
│         │                     │                            │
│         │                     │                            │
│         ▼                     │                            │
│  ┌──────────────┐            │                            │
│  │   spaces     │            │                            │
│  └──────┬───────┘            │                            │
│         │                     │                            │
│         └─────────┬───────────┘                           │
│                   ▼                                        │
│            ┌──────────────┐                               │
│            │     jobs     │                               │
│            └──────┬───────┘                               │
│                   │                                        │
│         ┌─────────┴──────────┬─────────────┐             │
│         ▼                    ▼             ▼             │
│  ┌──────────────┐     ┌──────────────┐  ┌──────────────┐│
│  │job_status_   │     │job_          │  │   ratings    ││
│  │history       │     │applications  │  │              ││
│  └──────────────┘     └──────────────┘  └──────────────┘│
│                                                           │
│  ┌──────────────┐     ┌──────────────┐                  │
│  │ nicknames    │     │notification_ │                  │
│  │              │     │settings      │                  │
│  └──────────────┘     └──────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 테이블 관계 요약

| 부모 테이블 | 자식 테이블 | 관계 타입 | 외래키 |
|------------|------------|----------|--------|
| auth.users | business_users | 1:1 | auth_uid |
| auth.users | partner_users | 1:1 | auth_uid |
| auth.users | admins | 1:1 | auth_uid |
| business_users | spaces | 1:N | owner_id |
| business_users | jobs | 1:N | business_id |
| partner_users | jobs | 1:N | partner_id |
| spaces | jobs | 1:N | space_id |
| jobs | job_status_history | 1:N | job_id |
| jobs | job_applications | 1:N | job_id |
| jobs | ratings | 1:N | job_id |
| business_users | nicknames | 1:1 | user_id |
| partner_users | nicknames | 1:1 | user_id |

## 📋 2. 핵심 테이블 상세 명세

### 2.1 business_users (비즈니스 사용자)

**용도**: 비즈니스 사용자 정보 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 고유 식별자 |
| auth_uid | UUID | UNIQUE, FK(auth.users) | Supabase Auth 연결 |
| email | TEXT | UNIQUE, NOT NULL | 이메일 주소 |
| phone | TEXT | NOT NULL | 전화번호 |
| nickname | TEXT | | 닉네임 (2-20자) |
| status | TEXT | DEFAULT 'pending' | 상태 (pending/approved/suspended/rejected) |
| **비즈니스 정보** |
| business_name | TEXT | NOT NULL | 사업체명 |
| business_number | TEXT | NOT NULL | 사업자등록번호 |
| business_type | TEXT | NOT NULL | 사업 유형 (studyroom/partyroom/unmanned/office/other) |
| business_address | TEXT | NOT NULL | 사업장 주소 |
| representative_name | TEXT | NOT NULL | 대표자명 |
| **은행 정보** |
| bank_name | TEXT | | 은행명 |
| account_number | TEXT | | 계좌번호 |
| account_holder | TEXT | | 예금주명 |
| **통계** |
| monthly_usage | INTEGER | DEFAULT 0 | 월간 이용 횟수 |
| total_spent | DECIMAL(10,0) | DEFAULT 0 | 총 지출액 |
| space_count | INTEGER | DEFAULT 0 | 등록된 공간 수 |
| **메타데이터** |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |
| approved_at | TIMESTAMPTZ | | 승인일시 |
| deleted_at | TIMESTAMPTZ | | 삭제일시 |

### 2.2 partner_users (파트너 사용자)

**용도**: 파트너(청소 서비스 제공자) 정보 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 고유 식별자 |
| auth_uid | UUID | UNIQUE, FK(auth.users) | Supabase Auth 연결 |
| email | TEXT | UNIQUE, NOT NULL | 이메일 주소 |
| phone | TEXT | NOT NULL | 전화번호 |
| nickname | TEXT | | 닉네임 (2-20자) |
| status | TEXT | DEFAULT 'pending' | 상태 (pending/approved/suspended/rejected) |
| **파트너 정보** |
| name | TEXT | NOT NULL | 이름 |
| residence | TEXT | NOT NULL | 거주지역 |
| work_areas | TEXT[] | NOT NULL | 활동 가능 지역 배열 |
| transportation | TEXT | | 이동수단 (public/car/bike) |
| available_times | JSONB | | 활동 가능 시간 |
| **은행 정보** |
| bank_name | TEXT | | 은행명 |
| account_number | TEXT | | 계좌번호 |
| account_holder | TEXT | | 예금주명 |
| **실적 정보** |
| rating | DECIMAL(2,1) | DEFAULT 0.0 | 평균 평점 (0.0-5.0) |
| completed_jobs | INTEGER | DEFAULT 0 | 완료한 작업 수 |
| cancelled_jobs | INTEGER | DEFAULT 0 | 취소한 작업 수 |
| total_earnings | DECIMAL(10,0) | DEFAULT 0 | 총 수입 |
| this_month_earnings | DECIMAL(10,0) | DEFAULT 0 | 이번 달 수입 |
| level | TEXT | DEFAULT 'bronze' | 등급 (bronze/silver/gold/platinum) |
| **메타데이터** |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |
| approved_at | TIMESTAMPTZ | | 승인일시 |
| deleted_at | TIMESTAMPTZ | | 삭제일시 |
| last_active_at | TIMESTAMPTZ | | 마지막 활동일시 |

### 2.3 admins (관리자)

**용도**: 플랫폼 관리자 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | SERIAL | PRIMARY KEY | 고유 식별자 |
| auth_uid | UUID | UNIQUE, FK(auth.users) | Supabase Auth 연결 |
| email | TEXT | UNIQUE, NOT NULL | 이메일 주소 |
| name | TEXT | NOT NULL | 관리자명 |
| role | TEXT | DEFAULT 'admin' | 역할 (admin/super_admin) |
| permissions | JSONB | DEFAULT '{}' | 권한 설정 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |

### 2.4 spaces (공간 정보)

**용도**: 비즈니스가 등록한 청소 대상 공간

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 고유 식별자 |
| name | TEXT | NOT NULL | 공간명 |
| type | TEXT | NOT NULL | 공간 유형 (office/store/warehouse/factory/other) |
| area | INTEGER | | 면적 (㎡) |
| address | TEXT | NOT NULL | 주소 |
| detail_address | TEXT | | 상세 주소 |
| cleaning_frequency | TEXT | DEFAULT 'weekly' | 청소 주기 (daily/weekly/biweekly/monthly/custom) |
| notes | TEXT | | 특이사항 |
| owner_id | UUID | FK(business_users.auth_uid) | 소유자 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |

### 2.5 jobs (작업)

**용도**: 청소 작업 요청 및 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 고유 식별자 |
| **관계 정보** |
| business_id | UUID | FK(business_users.auth_uid) | 요청 비즈니스 |
| partner_id | UUID | FK(partner_users.auth_uid) | 배정된 파트너 |
| space_id | UUID | FK(spaces.id) | 대상 공간 |
| **작업 정보** |
| title | VARCHAR(200) | NOT NULL | 작업 제목 |
| description | TEXT | | 작업 설명 |
| job_type | VARCHAR(50) | DEFAULT 'cleaning' | 작업 유형 |
| **일정 정보** |
| scheduled_date | DATE | NOT NULL | 예정 날짜 |
| scheduled_time | TIME | NOT NULL | 예정 시간 |
| estimated_duration | INTEGER | DEFAULT 120 | 예상 소요시간(분) |
| actual_start_time | TIMESTAMPTZ | | 실제 시작시간 |
| actual_end_time | TIMESTAMPTZ | | 실제 종료시간 |
| **상태 관리** |
| status | VARCHAR(50) | DEFAULT 'pending' | 상태 (pending/assigned/in_progress/completed/cancelled/dispute) |
| **가격 정보** |
| base_price | DECIMAL(10,2) | NOT NULL | 기본 가격 |
| final_price | DECIMAL(10,2) | | 최종 가격 |
| currency | VARCHAR(3) | DEFAULT 'KRW' | 통화 |
| **작업 상세** |
| special_requirements | TEXT[] | | 특별 요구사항 |
| tools_required | TEXT[] | | 필요 도구 |
| access_instructions | TEXT | | 출입 방법 |
| **완료 정보** |
| completion_photos | TEXT[] | | 완료 사진 URL |
| completion_notes | TEXT | | 완료 메모 |
| completion_verified_at | TIMESTAMPTZ | | 완료 확인일시 |
| completion_verified_by | UUID | FK(business_users.auth_uid) | 완료 확인자 |
| **평가 정보** |
| business_rating | INTEGER | CHECK(1-5) | 비즈니스가 준 평점 |
| business_review | TEXT | | 비즈니스 리뷰 |
| partner_rating | INTEGER | CHECK(1-5) | 파트너가 준 평점 |
| partner_review | TEXT | | 파트너 리뷰 |
| **취소 정보** |
| cancelled_at | TIMESTAMPTZ | | 취소일시 |
| cancelled_by | VARCHAR(20) | | 취소자 (business/partner/admin) |
| cancellation_reason | TEXT | | 취소 사유 |
| **메타데이터** |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |

### 2.6 job_status_history (작업 상태 변경 이력)

**용도**: 작업 상태 변경 추적

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 고유 식별자 |
| job_id | UUID | FK(jobs.id) | 작업 ID |
| from_status | VARCHAR(50) | | 이전 상태 |
| to_status | VARCHAR(50) | NOT NULL | 변경된 상태 |
| changed_by | UUID | NOT NULL | 변경자 auth_uid |
| changed_at | TIMESTAMPTZ | DEFAULT NOW() | 변경일시 |
| notes | TEXT | | 메모 |

### 2.7 job_applications (작업 지원)

**용도**: 파트너의 작업 지원 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 고유 식별자 |
| job_id | UUID | FK(jobs.id) | 작업 ID |
| partner_id | UUID | FK(partner_users.auth_uid) | 지원 파트너 |
| applied_at | TIMESTAMPTZ | DEFAULT NOW() | 지원일시 |
| message | TEXT | | 지원 메시지 |
| status | VARCHAR(50) | DEFAULT 'pending' | 상태 (pending/accepted/rejected) |

### 2.8 ratings (평점 및 리뷰)

**용도**: 상호 평가 시스템

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 고유 식별자 |
| **평가 정보** |
| job_id | UUID | FK(jobs.id) | 작업 ID |
| reviewer_id | UUID | NOT NULL | 평가자 auth_uid |
| reviewer_type | VARCHAR(20) | NOT NULL | 평가자 유형 (business/partner) |
| reviewee_id | UUID | NOT NULL | 평가 대상 auth_uid |
| reviewee_type | VARCHAR(20) | NOT NULL | 대상 유형 (business/partner) |
| **평점** |
| overall_rating | INTEGER | CHECK(1-5) | 종합 평점 |
| punctuality_rating | INTEGER | CHECK(1-5) | 시간 준수 (파트너 평가시) |
| quality_rating | INTEGER | CHECK(1-5) | 작업 품질 (파트너 평가시) |
| communication_rating | INTEGER | CHECK(1-5) | 의사소통 (파트너 평가시) |
| payment_rating | INTEGER | CHECK(1-5) | 정산 신속성 (비즈니스 평가시) |
| clarity_rating | INTEGER | CHECK(1-5) | 요구사항 명확성 (비즈니스 평가시) |
| respect_rating | INTEGER | CHECK(1-5) | 존중과 배려 (비즈니스 평가시) |
| **리뷰** |
| review_text | TEXT | | 리뷰 내용 |
| is_anonymous | BOOLEAN | DEFAULT FALSE | 익명 여부 |
| would_recommend | BOOLEAN | | 추천 의향 |
| would_work_again | BOOLEAN | | 재작업 의향 |
| positive_tags | TEXT[] | | 긍정 태그 |
| negative_tags | TEXT[] | | 부정 태그 |
| **관리** |
| is_verified | BOOLEAN | DEFAULT FALSE | 검증된 리뷰 |
| is_flagged | BOOLEAN | DEFAULT FALSE | 신고 여부 |
| flag_reason | TEXT | | 신고 사유 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |

### 2.9 nicknames (닉네임 중복 방지)

**용도**: 전체 시스템 닉네임 유일성 보장

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| nickname | TEXT | PRIMARY KEY | 닉네임 |
| user_id | UUID | NOT NULL | 사용자 ID |
| user_type | TEXT | CHECK(business/partner) | 사용자 유형 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |

### 2.10 notification_settings (알림 설정)

**용도**: 사용자별 알림 설정

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| user_id | UUID | PK | 사용자 ID |
| user_type | TEXT | PK, CHECK(business/partner) | 사용자 유형 |
| email | BOOLEAN | DEFAULT TRUE | 이메일 알림 |
| sms | BOOLEAN | DEFAULT TRUE | SMS 알림 |
| push | BOOLEAN | DEFAULT TRUE | 푸시 알림 |
| marketing | BOOLEAN | DEFAULT FALSE | 마케팅 알림 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |

## 🔄 3. 데이터 흐름 및 상호작용

### 3.1 인증 및 사용자 관리 플로우

```
1. 회원가입
   Browser → Supabase Auth → auth.users 생성
   → business_users/partner_users 프로필 생성
   → nicknames 테이블에 닉네임 등록

2. 로그인
   Browser → Supabase Auth 인증
   → getUserType() 함수로 사용자 유형 확인
   → business_users/partner_users/admins 조회
   → 대시보드 리다이렉트

3. 프로필 업데이트
   Browser → JavaScript API (BusinessAPI/PartnerAPI)
   → Supabase Client → 해당 테이블 업데이트
   → 닉네임 변경시 nicknames 테이블 동기화
```

### 3.2 작업 관리 플로우

```
1. 작업 생성 (비즈니스)
   - spaces 테이블에서 공간 선택
   - jobs 테이블에 새 작업 생성 (status: 'pending')
   - job_status_history에 이력 기록

2. 작업 지원 (파트너)
   - pending 상태 작업 조회
   - job_applications 테이블에 지원 기록

3. 작업 배정 (비즈니스)
   - job_applications에서 파트너 선택
   - jobs.partner_id 업데이트 (status: 'assigned')
   - job_status_history 업데이트

4. 작업 진행 (파트너)
   - jobs.status → 'in_progress'
   - actual_start_time 기록

5. 작업 완료
   - completion_photos, notes 업로드
   - jobs.status → 'completed'
   - actual_end_time 기록

6. 상호 평가
   - ratings 테이블에 평가 기록
   - partner_users.rating 자동 업데이트 (트리거)
   - partner_ratings_summary 뷰 리프레시
```

### 3.3 주요 API 엔드포인트 매핑

| 기능 | JavaScript 클래스 | Supabase 테이블 | 주요 메서드 |
|------|------------------|-----------------|------------|
| 비즈니스 관리 | BusinessAPI | business_users, spaces, jobs | getProfile(), createSpace(), createJob() |
| 파트너 관리 | PartnerAPI | partner_users, jobs, ratings | getProfile(), getAvailableJobs(), applyForJob() |
| 관리자 기능 | AdminAuth | admins, all tables | approveUser(), getUserStatistics() |
| 인증 | AuthManager | auth.users, all user tables | login(), signup(), getUserType() |

## 🔒 4. 보안 및 권한 관리

### 4.1 Row Level Security (RLS) 정책

#### business_users 테이블
- **SELECT**: 본인 정보만 조회 가능, 관리자는 모든 정보 조회
- **INSERT**: 회원가입시 auth_uid = auth.uid() 체크
- **UPDATE**: 본인 정보만 수정 가능
- **DELETE**: 관리자만 가능

#### partner_users 테이블
- **SELECT**: 본인 정보만 조회 가능, 관리자는 모든 정보 조회
- **INSERT**: 회원가입시 auth_uid = auth.uid() 체크
- **UPDATE**: 본인 정보만 수정 가능
- **DELETE**: 관리자만 가능

#### spaces 테이블
- **SELECT**: 소유자만 조회 가능
- **INSERT**: owner_id = auth.uid() 체크
- **UPDATE**: 소유자만 수정 가능
- **DELETE**: 소유자만 삭제 가능

#### jobs 테이블
- **비즈니스**: 본인 작업만 CRUD 가능
- **파트너**: pending 작업 조회, 배정된 작업 조회/수정
- **관리자**: 모든 권한

#### ratings 테이블
- **SELECT**: 모든 사용자 조회 가능 (공개)
- **INSERT**: reviewer_id = auth.uid() 체크
- **UPDATE**: 작성자만 수정 가능
- **DELETE**: 관리자만 가능

### 4.2 사용자 타입별 권한 매트릭스

| 리소스 | 비즈니스 사용자 | 파트너 사용자 | 관리자 |
|--------|----------------|--------------|---------|
| business_users | 본인 정보만 | - | 전체 |
| partner_users | - | 본인 정보만 | 전체 |
| spaces | 소유 공간만 | - | 전체 |
| jobs | 본인 작업만 | pending + 배정된 작업 | 전체 |
| ratings | 조회(전체), 작성(본인) | 조회(전체), 작성(본인) | 전체 |
| admins | - | - | 본인/전체(super_admin) |

### 4.3 주요 보안 함수

```sql
-- 사용자 타입 확인
get_user_type(auth_uid UUID) → 'business'/'partner'/'admin'

-- 관리자 권한 확인
is_admin(auth_uid UUID) → BOOLEAN
is_super_admin(auth_uid UUID) → BOOLEAN

-- 닉네임 중복 확인
is_nickname_available(nickname TEXT) → BOOLEAN

-- 사용자 승인 (관리자 전용)
approve_user(user_id INTEGER, user_type TEXT) → BOOLEAN
```

## ⚡ 5. 인덱스 및 성능 최적화

### 5.1 주요 인덱스

#### business_users
- `idx_business_users_email` (email)
- `idx_business_users_status` (status)
- `idx_business_users_type` (business_type)
- `idx_business_users_created` (created_at DESC)

#### partner_users
- `idx_partner_users_email` (email)
- `idx_partner_users_status` (status)
- `idx_partner_users_work_areas` (work_areas) - GIN 인덱스
- `idx_partner_users_rating` (rating DESC)
- `idx_partner_users_created` (created_at DESC)

#### spaces
- `idx_spaces_owner_id` (owner_id)
- `idx_spaces_type` (type)
- `idx_spaces_created` (created_at DESC)

#### jobs
- `idx_jobs_business_id` (business_id)
- `idx_jobs_partner_id` (partner_id)
- `idx_jobs_space_id` (space_id)
- `idx_jobs_status` (status)
- `idx_jobs_scheduled_date` (scheduled_date)
- `idx_jobs_created_at` (created_at DESC)
- **복합 인덱스**:
  - `idx_jobs_status_scheduled` (status, scheduled_date)
  - `idx_jobs_partner_status` (partner_id, status) WHERE partner_id IS NOT NULL

#### ratings
- `idx_ratings_job_id` (job_id)
- `idx_ratings_reviewer` (reviewer_id, reviewer_type)
- `idx_ratings_reviewee` (reviewee_id, reviewee_type)
- `idx_ratings_created_at` (created_at DESC)
- **유니크 인덱스**:
  - `idx_ratings_unique_review` (job_id, reviewer_id) - 중복 평가 방지

### 5.2 Materialized Views

#### partner_ratings_summary
- 파트너별 평점 요약 정보
- 평균 평점, 총 평가 수, 세부 평점 집계
- 리프레시: 평가 추가/수정시 (REFRESH MATERIALIZED VIEW CONCURRENTLY)

#### business_ratings_summary
- 비즈니스별 평점 요약 정보
- 평균 평점, 총 평가 수, 재작업 의향 집계
- 리프레시: 평가 추가/수정시

### 5.3 성능 최적화 전략

1. **인덱스 활용**
   - 자주 검색되는 컬럼에 인덱스 생성
   - 복합 인덱스로 다중 조건 쿼리 최적화
   - GIN 인덱스로 배열 검색 최적화 (work_areas)

2. **Materialized View 활용**
   - 복잡한 집계 쿼리 결과 캐싱
   - 실시간성이 중요하지 않은 통계 데이터

3. **트리거 활용**
   - updated_at 자동 업데이트
   - 상태 변경 이력 자동 기록
   - 평점 자동 계산 및 업데이트

4. **쿼리 최적화**
   - SELECT시 필요한 컬럼만 조회
   - JOIN 대신 서브쿼리 활용 (RLS 호환성)
   - 페이지네이션 적용 (limit/offset)

## 🔧 6. 트리거 및 함수

### 6.1 주요 트리거

| 트리거명 | 대상 테이블 | 이벤트 | 기능 |
|---------|------------|--------|------|
| update_updated_at_column | 모든 테이블 | BEFORE UPDATE | updated_at 자동 갱신 |
| job_status_change_trigger | jobs | AFTER UPDATE | 상태 변경 이력 기록 |
| check_business_nickname | business_users | BEFORE INSERT/UPDATE | 닉네임 중복 체크 |
| check_partner_nickname | partner_users | BEFORE INSERT/UPDATE | 닉네임 중복 체크 |
| delete_business_nickname | business_users | AFTER DELETE | nicknames 테이블 정리 |
| delete_partner_nickname | partner_users | AFTER DELETE | nicknames 테이블 정리 |
| update_rating_trigger | ratings | AFTER INSERT/UPDATE | 사용자 평점 자동 계산 |

### 6.2 주요 함수

```sql
-- 시스템 함수
update_updated_at_column() -- updated_at 필드 자동 업데이트
get_user_type(auth_uid) -- 사용자 타입 조회
is_admin(auth_uid) -- 관리자 여부 확인
is_super_admin(auth_uid) -- 슈퍼 관리자 여부 확인

-- 닉네임 관리
check_nickname_unique() -- 닉네임 중복 체크 (트리거용)
is_nickname_available(nickname) -- 닉네임 사용 가능 여부
delete_nickname() -- 닉네임 삭제 (트리거용)

-- 작업 관리
record_job_status_change() -- 작업 상태 변경 기록

-- 평점 관리
update_user_rating() -- 사용자 평점 업데이트
get_partner_rating_stats(partner_uuid) -- 파트너 평점 통계

-- 관리자 기능
approve_user(user_id, user_type) -- 사용자 승인
```

## 📝 7. 데이터 무결성 보장

### 7.1 제약조건

1. **외래키 제약**
   - CASCADE DELETE: auth.users 삭제시 관련 데이터 자동 삭제
   - SET NULL: 파트너 삭제시 jobs.partner_id NULL 처리

2. **CHECK 제약**
   - status 값 제한 (pending/approved/suspended/rejected)
   - 평점 범위 제한 (1-5)
   - 사업자등록번호 형식 검증
   - 은행 정보 일관성 (모두 있거나 모두 없거나)

3. **UNIQUE 제약**
   - email 중복 방지
   - auth_uid 중복 방지
   - 닉네임 전체 시스템 중복 방지
   - job_id + reviewer_id 조합 유일성 (중복 평가 방지)

### 7.2 트랜잭션 관리

```sql
-- 작업 배정 트랜잭션 예시
BEGIN;
  -- 1. 지원 상태 업데이트
  UPDATE job_applications 
  SET status = 'accepted' 
  WHERE job_id = ? AND partner_id = ?;
  
  -- 2. 작업에 파트너 배정
  UPDATE jobs 
  SET partner_id = ?, status = 'assigned' 
  WHERE id = ?;
  
  -- 3. 상태 변경 이력 기록 (트리거로 자동 처리)
COMMIT;
```

## 🚀 8. 향후 개선 사항

### 8.1 계획된 기능
- [ ] 실시간 알림 시스템 (Supabase Realtime)
- [ ] 채팅 기능 (messages 테이블)
- [ ] 결제 시스템 연동 (payments 테이블)
- [ ] 일정 반복 기능 (recurring_jobs 테이블)
- [ ] 파트너 팀 관리 (partner_teams 테이블)

### 8.2 성능 개선
- [ ] 파티셔닝 적용 (jobs 테이블 - 날짜 기준)
- [ ] 읽기 전용 복제본 구성
- [ ] Redis 캐싱 레이어 추가
- [ ] 비동기 작업 큐 구현

### 8.3 보안 강화
- [ ] 2FA 인증 추가
- [ ] API Rate Limiting
- [ ] 감사 로그 테이블 추가
- [ ] 데이터 암호화 강화

---

> 📌 **참고**: 이 문서는 2025년 1월 23일 기준으로 작성되었으며, 실제 운영 환경에서는 추가적인 테이블이나 컬럼이 있을 수 있습니다.