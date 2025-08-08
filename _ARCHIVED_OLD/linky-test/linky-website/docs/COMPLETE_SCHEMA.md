# 🗄️ Supabase 전체 스키마 구조

## 📊 테이블 구조 요약

```
[Supabase Auth]
auth.users
    |
    ├── business_users (비즈니스 사용자)
    ├── partner_users (파트너)
    └── admins (관리자)
    
[비즈니스 도메인]
business_users
    └── spaces (공간들)
        └── jobs (작업들)
            ├── job_status_history
            └── job_applications
            
partner_users
    └── jobs (배정된 작업)
        └── job_applications (지원)
```

## 📋 테이블별 필드 정의

### 1️⃣ **business_users**
```sql
auth_uid         UUID      → auth.users 참조
email            TEXT      고유
phone            TEXT      필수
nickname         TEXT      고유 (추가됨)
status           TEXT      pending|approved|suspended|rejected
business_name    TEXT      사업자명
business_number  TEXT      사업자번호 (000-00-00000)
business_type    TEXT      studyroom|partyroom|unmanned|office|other
business_address TEXT      주소
bank_name        TEXT      은행명 (선택)
account_number   TEXT      계좌번호 (선택)
monthly_usage    INTEGER   이번달 사용
total_spent      DECIMAL   총 지출
space_count      INTEGER   공간 수
```

### 2️⃣ **partner_users**
```sql
auth_uid              UUID      → auth.users 참조
email                 TEXT      고유
phone                 TEXT      필수
nickname              TEXT      고유 (추가됨)
name                  TEXT      실명
status                TEXT      pending|approved|suspended|rejected
residence             TEXT      거주지
work_areas            TEXT[]    활동지역 배열
transportation        TEXT      public|car|bike
rating                DECIMAL   평점 (0.0~5.0)
completed_jobs        INTEGER   완료 작업
total_earnings        DECIMAL   총 수익
this_month_earnings   DECIMAL   이번달 수익
level                 TEXT      bronze|silver|gold|platinum
```

### 3️⃣ **admins**
```sql
auth_uid     UUID    → auth.users 참조
email        TEXT    고유
name         TEXT    이름
role         TEXT    admin|super_admin
permissions  JSONB   권한 배열
```

### 4️⃣ **spaces**
```sql
id                    UUID      기본키
owner_id              UUID      → business_users(auth_uid)
name                  TEXT      공간명
type                  TEXT      office|store|warehouse|factory|other
area                  INTEGER   평수
address               TEXT      주소
detail_address        TEXT      상세주소
cleaning_frequency    TEXT      daily|weekly|biweekly|monthly
notes                 TEXT      메모
```

### 5️⃣ **jobs** ⭐ 핵심 테이블
```sql
id                UUID        기본키
business_id       UUID        → business_users(auth_uid)
partner_id        UUID        → partner_users(auth_uid) NULL 가능
space_id          UUID        → spaces(id)

-- 작업 정보
title             VARCHAR     제목
description       TEXT        설명
scheduled_date    DATE        예정일
scheduled_time    TIME        예정시간
estimated_duration INTEGER    예상시간(분)

-- 상태
status            VARCHAR     pending|assigned|in_progress|completed|cancelled

-- 가격
base_price        DECIMAL     기본가격
final_price       DECIMAL     최종가격

-- 완료
completion_photos TEXT[]      완료사진 URL들
completion_notes  TEXT        완료메모

-- 평가
business_rating   INTEGER     1~5
business_review   TEXT        리뷰
partner_rating    INTEGER     1~5
partner_review    TEXT        리뷰
```

### 6️⃣ **job_status_history**
```sql
id          UUID     기본키
job_id      UUID     → jobs(id)
from_status VARCHAR  이전상태
to_status   VARCHAR  변경상태
changed_by  UUID     변경자
changed_at  TIMESTAMP 변경시간
```

### 7️⃣ **job_applications**
```sql
id          UUID      기본키
job_id      UUID      → jobs(id)
partner_id  UUID      → partner_users(auth_uid)
applied_at  TIMESTAMP 지원시간
message     TEXT      메시지
status      VARCHAR   pending|accepted|rejected
```

---

## 🔐 주요 제약조건

1. **사업자번호 형식**
   - 정규식: `^\d{3}-\d{2}-\d{5}$`
   - 임시: `000-00-00000` 허용

2. **은행정보 일관성**
   - 모두 NULL 또는 모두 NOT NULL

3. **작업 평점**
   - 1~5 사이 정수

4. **유니크 제약**
   - email (각 테이블)
   - nickname (각 테이블)
   - (job_id, partner_id) in job_applications

---

## 🔑 인덱스

### 성능 최적화 인덱스
- business_users: email, status, type, created_at
- partner_users: email, status, work_areas(GIN), rating
- spaces: owner_id, type, created_at
- jobs: business_id, partner_id, space_id, status, scheduled_date
- 복합: (status, scheduled_date), (partner_id, status)

---

## ⚡ 트리거

1. **updated_at 자동 업데이트**
   - 모든 테이블에 적용

2. **작업 상태 변경 추적**
   - jobs 상태 변경 시 → job_status_history 자동 기록

---

## 🛡️ RLS 정책

- **business_users**: 본인 데이터만 접근
- **partner_users**: 본인 데이터만 접근
- **spaces**: 소유자만 수정
- **jobs**: 
  - 비즈니스: 자신의 작업만
  - 파트너: 배정된 작업 + 대기중 작업
- **admins**: 모든 권한

---

**총 7개 테이블 + auth.users (Supabase 기본)**