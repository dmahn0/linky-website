# 🗄️ Linky Platform - 데이터베이스 스키마 문서

## 📊 데이터베이스 개요

**데이터베이스 시스템**: Supabase (PostgreSQL)  
**현재 상태**: Firebase에서 마이그레이션 진행 중  
**스키마 버전**: 2.0 (2025-01-22)  
**주요 특징**: 사용자 타입별 테이블 분리 (배민 방식)

---

## 🏗️ 전체 스키마 구조

```sql
┌─────────────────────────────────────────────────┐
│                 auth.users                      │
│          (Supabase Auth 시스템)                  │
└─────────────┬───────────┬──────────┬───────────┘
              │           │          │
              ▼           ▼          ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────┐
    │business_users│ │partner_users │ │  admins  │
    └──────┬───────┘ └───────┬──────┘ └──────────┘
           │                 │
           ▼                 ▼
    ┌──────────────────────────────┐
    │           spaces              │
    └──────────────┬────────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │            jobs               │
    └───────────────────────────────┘
```

---

## 📋 테이블 상세 스키마

### 1. **business_users** (비즈니스 사용자)

```sql
CREATE TABLE business_users (
  -- 기본 정보
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  nickname TEXT UNIQUE,  -- 2025-01-22 추가
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  
  -- 비즈니스 정보
  business_name TEXT NOT NULL,
  business_number TEXT NOT NULL,
  business_type TEXT NOT NULL 
    CHECK (business_type IN ('studyroom', 'partyroom', 'unmanned', 'office', 'other')),
  business_address TEXT NOT NULL,
  representative_name TEXT NOT NULL,
  
  -- 은행 정보 (선택)
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  
  -- 통계
  monthly_usage INTEGER DEFAULT 0,
  total_spent DECIMAL(10,0) DEFAULT 0,
  space_count INTEGER DEFAULT 0,
  
  -- 메타데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);
```

**인덱스**:
- `idx_business_users_email` (email)
- `idx_business_users_status` (status)
- `idx_business_users_type` (business_type)
- `idx_business_users_created` (created_at DESC)

---

### 2. **partner_users** (파트너 사용자)

```sql
CREATE TABLE partner_users (
  -- 기본 정보
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  nickname TEXT UNIQUE,  -- 2025-01-22 추가
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  
  -- 파트너 정보
  name TEXT NOT NULL,
  residence TEXT NOT NULL,
  work_areas TEXT[] NOT NULL CHECK (array_length(work_areas, 1) > 0),
  transportation TEXT CHECK (transportation IN ('public', 'car', 'bike', NULL)),
  available_times JSONB DEFAULT '{"weekday": [], "weekend": []}'::jsonb,
  
  -- 은행 정보 (선택)
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  
  -- 실적 정보
  rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  completed_jobs INTEGER DEFAULT 0,
  cancelled_jobs INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,0) DEFAULT 0,
  this_month_earnings DECIMAL(10,0) DEFAULT 0,
  level TEXT DEFAULT 'bronze' 
    CHECK (level IN ('bronze', 'silver', 'gold', 'platinum')),
  
  -- 메타데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ
);
```

**인덱스**:
- `idx_partner_users_email` (email)
- `idx_partner_users_status` (status)
- `idx_partner_users_work_areas` (work_areas) - GIN 인덱스
- `idx_partner_users_rating` (rating DESC)

---

### 3. **admins** (관리자)

```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' 
    CHECK (role IN ('admin', 'super_admin')),
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);
```

---

### 4. **spaces** (공간)

```sql
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES business_users(auth_uid),
  
  -- 공간 정보
  name TEXT NOT NULL,
  type TEXT NOT NULL 
    CHECK (type IN ('studyroom', 'partyroom', 'studio', 'office', 'other')),
  address TEXT NOT NULL,
  detailed_address TEXT,
  size INTEGER,  -- 평수
  room_count INTEGER,
  
  -- 운영 정보
  operating_hours JSONB,
  cleaning_frequency TEXT 
    CHECK (cleaning_frequency IN ('daily', 'weekly', 'monthly', 'on-demand')),
  special_requirements TEXT[],
  
  -- 상태
  status TEXT NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'inactive', 'pending')),
  is_direct BOOLEAN DEFAULT false,  -- 직영 여부
  
  -- 통계
  total_jobs INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1) DEFAULT 0.0,
  
  -- 메타데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

**인덱스**:
- `idx_spaces_owner` (owner_id)
- `idx_spaces_type` (type)
- `idx_spaces_status` (status)

---

### 5. **jobs** (작업)

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 관계
  business_id UUID NOT NULL REFERENCES business_users(auth_uid),
  partner_id UUID REFERENCES partner_users(auth_uid),
  space_id UUID NOT NULL REFERENCES spaces(id),
  
  -- 작업 정보
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  estimated_duration INTEGER DEFAULT 60,  -- 분 단위
  
  -- 상태
  status TEXT NOT NULL DEFAULT '대기' 
    CHECK (status IN ('대기', '매칭중', '진행중', '완료', '취소', '분쟁')),
  
  -- 가격
  price DECIMAL(10,0) NOT NULL,
  partner_fee DECIMAL(10,0),  -- 파트너 수수료
  platform_fee DECIMAL(10,0),  -- 플랫폼 수수료
  
  -- 완료 정보
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  before_photos TEXT[],
  after_photos TEXT[],
  
  -- 평가
  business_rating INTEGER CHECK (business_rating >= 1 AND business_rating <= 5),
  business_review TEXT,
  partner_rating INTEGER CHECK (partner_rating >= 1 AND partner_rating <= 5),
  partner_review TEXT,
  
  -- 메타데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT
);
```

**인덱스**:
- `idx_jobs_business` (business_id)
- `idx_jobs_partner` (partner_id)
- `idx_jobs_space` (space_id)
- `idx_jobs_status` (status)
- `idx_jobs_scheduled` (scheduled_date, scheduled_time)

---

### 6. **notifications** (알림)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- auth.users.id 참조
  user_type TEXT NOT NULL 
    CHECK (user_type IN ('business', 'partner', 'admin')),
  
  -- 알림 내용
  type TEXT NOT NULL 
    CHECK (type IN ('job_new', 'job_accepted', 'job_completed', 'payment', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  
  -- 상태
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- 메타데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

**인덱스**:
- `idx_notifications_user` (user_id, user_type)
- `idx_notifications_unread` (user_id, is_read) WHERE is_read = false

---

### 7. **notification_settings** (알림 설정)

```sql
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  
  -- 알림 채널
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  
  -- 알림 유형별 설정
  job_notifications BOOLEAN DEFAULT true,
  payment_notifications BOOLEAN DEFAULT true,
  marketing_notifications BOOLEAN DEFAULT false,
  
  -- 시간 설정
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  
  -- 메타데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 🔐 Row Level Security (RLS) 정책

### business_users 테이블
```sql
-- 본인 데이터만 조회 가능
CREATE POLICY "Users can view own profile" ON business_users
  FOR SELECT USING (auth.uid() = auth_uid);

-- 본인 데이터만 수정 가능
CREATE POLICY "Users can update own profile" ON business_users
  FOR UPDATE USING (auth.uid() = auth_uid);

-- 관리자는 모든 데이터 조회 가능
CREATE POLICY "Admins can view all profiles" ON business_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE auth_uid = auth.uid())
  );
```

### jobs 테이블
```sql
-- 비즈니스 사용자는 자신의 작업만 조회
CREATE POLICY "Business users can view own jobs" ON jobs
  FOR SELECT USING (business_id = auth.uid());

-- 파트너는 할당된 작업만 조회
CREATE POLICY "Partners can view assigned jobs" ON jobs
  FOR SELECT USING (partner_id = auth.uid());

-- 대기 중인 작업은 모든 파트너가 조회 가능
CREATE POLICY "Partners can view available jobs" ON jobs
  FOR SELECT USING (status = '대기' AND partner_id IS NULL);
```

---

## 📈 마이그레이션 히스토리

### Phase 1: 초기 설계 (Firebase)
- 단일 users 테이블 사용
- 제약조건 충돌 문제 발생

### Phase 2: 테이블 분리 (2025-01-22)
- business_users, partner_users, admins 분리
- 각 사용자 타입별 최적화된 스키마

### Phase 3: 닉네임 추가 (2025-01-22)
- 모든 사용자 테이블에 nickname 필드 추가
- 중복 방지를 위한 UNIQUE 제약조건

### Phase 4: Spaces 테이블 생성 (2025-01-22)
- 공간 관리 기능 추가
- Jobs 테이블과 연계

---

## 🔄 트리거 및 함수

### 1. updated_at 자동 업데이트
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 모든 테이블에 트리거 적용
CREATE TRIGGER update_business_users_updated_at 
  BEFORE UPDATE ON business_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. 사용자 타입 확인 함수
```sql
CREATE OR REPLACE FUNCTION get_user_type(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_type TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM business_users WHERE auth_uid = user_id) THEN
    RETURN 'business';
  ELSIF EXISTS (SELECT 1 FROM partner_users WHERE auth_uid = user_id) THEN
    RETURN 'partner';
  ELSIF EXISTS (SELECT 1 FROM admins WHERE auth_uid = user_id) THEN
    RETURN 'admin';
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### 3. 통계 업데이트 함수
```sql
CREATE OR REPLACE FUNCTION update_business_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- 작업 완료 시 비즈니스 통계 업데이트
  IF NEW.status = '완료' AND OLD.status != '완료' THEN
    UPDATE business_users
    SET 
      monthly_usage = monthly_usage + 1,
      total_spent = total_spent + NEW.price
    WHERE auth_uid = NEW.business_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 데이터베이스 통계

### 테이블 크기 예상
| 테이블 | 예상 레코드 수 | 증가율 |
|-------|------------|--------|
| business_users | 1,000+ | 월 50건 |
| partner_users | 500+ | 월 30건 |
| spaces | 3,000+ | 월 100건 |
| jobs | 10,000+/월 | 일 300건 |
| notifications | 50,000+/월 | 일 1,500건 |

### 인덱스 전략
- **Primary Keys**: UUID 사용으로 분산 저장
- **Foreign Keys**: 참조 무결성 보장
- **Composite Indexes**: 자주 사용되는 조합 쿼리 최적화
- **Partial Indexes**: 특정 조건 쿼리 최적화

---

## 🔒 보안 고려사항

1. **RLS 적용**: 모든 테이블에 Row Level Security 적용
2. **SQL Injection 방지**: Prepared Statements 사용
3. **민감 정보 암호화**: 은행 계좌 정보 등
4. **감사 로그**: 중요 작업에 대한 로깅
5. **백업 전략**: 일일 자동 백업, 30일 보관

---

**최종 업데이트**: 2025-01-23  
**문서 버전**: 1.0