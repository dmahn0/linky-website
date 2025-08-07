# Linky 데이터베이스 마이그레이션 계획

## 1. 현재 상태 백업

### 1.1 데이터 백업
```sql
-- 기존 users 테이블 백업
CREATE TABLE users_backup AS SELECT * FROM users;

-- 백업 확인
SELECT COUNT(*) FROM users_backup;
```

### 1.2 현재 제약조건 확인
```sql
-- 제약조건 목록 조회
SELECT conname, contype, consrc 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass;
```

## 2. 새로운 테이블 생성

### 2.1 비즈니스 사용자 테이블
```sql
-- 비즈니스 사용자 테이블 생성
CREATE TABLE business_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  
  -- 비즈니스 정보
  business_name TEXT NOT NULL,
  business_number TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN ('studyroom', 'partyroom', 'unmanned', 'office', 'other')),
  business_address TEXT NOT NULL,
  representative_name TEXT NOT NULL,
  
  -- 은행 정보
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
  deleted_at TIMESTAMPTZ,
  
  -- 제약조건
  CONSTRAINT valid_business_number CHECK (business_number ~ '^\d{3}-\d{2}-\d{5}$'),
  CONSTRAINT valid_bank_info CHECK (
    (bank_name IS NULL AND account_number IS NULL AND account_holder IS NULL) OR
    (bank_name IS NOT NULL AND account_number IS NOT NULL AND account_holder IS NOT NULL)
  )
);

-- 인덱스 생성
CREATE INDEX idx_business_users_email ON business_users(email);
CREATE INDEX idx_business_users_status ON business_users(status);
CREATE INDEX idx_business_users_type ON business_users(business_type);
```

### 2.2 파트너 사용자 테이블
```sql
-- 파트너 사용자 테이블 생성
CREATE TABLE partner_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  
  -- 파트너 정보
  name TEXT NOT NULL,
  residence TEXT NOT NULL,
  work_areas TEXT[] NOT NULL CHECK (array_length(work_areas, 1) > 0),
  transportation TEXT CHECK (transportation IN ('public', 'car', 'bike')),
  available_times JSONB DEFAULT '{"weekday": [], "weekend": []}',
  
  -- 은행 정보
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  
  -- 실적 정보
  rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  completed_jobs INTEGER DEFAULT 0,
  cancelled_jobs INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,0) DEFAULT 0,
  this_month_earnings DECIMAL(10,0) DEFAULT 0,
  level TEXT DEFAULT 'bronze' CHECK (level IN ('bronze', 'silver', 'gold', 'platinum')),
  
  -- 메타데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  
  -- 제약조건
  CONSTRAINT valid_bank_info CHECK (
    (bank_name IS NULL AND account_number IS NULL AND account_holder IS NULL) OR
    (bank_name IS NOT NULL AND account_number IS NOT NULL AND account_holder IS NOT NULL)
  )
);

-- 인덱스 생성
CREATE INDEX idx_partner_users_email ON partner_users(email);
CREATE INDEX idx_partner_users_status ON partner_users(status);
CREATE INDEX idx_partner_users_work_areas ON partner_users USING GIN(work_areas);
CREATE INDEX idx_partner_users_rating ON partner_users(rating DESC);
```

### 2.3 공통 설정 테이블
```sql
-- 알림 설정 테이블
CREATE TABLE notification_settings (
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('business', 'partner')),
  
  -- 알림 설정
  email BOOLEAN NOT NULL DEFAULT true,
  sms BOOLEAN NOT NULL DEFAULT true,
  push BOOLEAN NOT NULL DEFAULT true,
  marketing BOOLEAN NOT NULL DEFAULT false,
  
  -- 메타데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (user_id, user_type)
);
```

## 3. RLS (Row Level Security) 정책

### 3.1 비즈니스 사용자 정책
```sql
-- RLS 활성화
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;

-- 본인 데이터만 조회 가능
CREATE POLICY "Users can view own business profile" ON business_users
  FOR SELECT USING (auth.uid() = auth_uid);

-- 본인 데이터만 수정 가능
CREATE POLICY "Users can update own business profile" ON business_users
  FOR UPDATE USING (auth.uid() = auth_uid);

-- 회원가입 시 생성 가능
CREATE POLICY "Users can insert own business profile" ON business_users
  FOR INSERT WITH CHECK (auth.uid() = auth_uid);
```

### 3.2 파트너 사용자 정책
```sql
-- RLS 활성화
ALTER TABLE partner_users ENABLE ROW LEVEL SECURITY;

-- 본인 데이터만 조회 가능
CREATE POLICY "Users can view own partner profile" ON partner_users
  FOR SELECT USING (auth.uid() = auth_uid);

-- 본인 데이터만 수정 가능
CREATE POLICY "Users can update own partner profile" ON partner_users
  FOR UPDATE USING (auth.uid() = auth_uid);

-- 회원가입 시 생성 가능
CREATE POLICY "Users can insert own partner profile" ON partner_users
  FOR INSERT WITH CHECK (auth.uid() = auth_uid);
```

## 4. 기존 데이터 마이그레이션

### 4.1 비즈니스 사용자 마이그레이션
```sql
-- 비즈니스 사용자 이전
INSERT INTO business_users (
  auth_uid, email, phone, status,
  business_name, business_number, business_type, business_address,
  representative_name, created_at, updated_at
)
SELECT 
  uid,
  email,
  COALESCE(phone, '미입력'),
  status,
  COALESCE(name, '미입력'), -- 임시로 name을 business_name으로
  '000-00-00000', -- 임시 사업자번호
  'other', -- 임시 타입
  '주소 미입력', -- 임시 주소
  COALESCE(name, '미입력'), -- 임시 대표자명
  created_at,
  updated_at
FROM users_backup
WHERE type = 'business';
```

### 4.2 파트너 사용자 마이그레이션
```sql
-- 파트너 사용자 이전
INSERT INTO partner_users (
  auth_uid, email, phone, status,
  name, residence, work_areas,
  created_at, updated_at
)
SELECT 
  uid,
  email,
  COALESCE(phone, '미입력'),
  status,
  name,
  '서울시', -- 기본값
  ARRAY['강남구'], -- 기본값
  created_at,
  updated_at
FROM users_backup
WHERE type = 'partner';
```

## 5. 뷰(View) 생성 (선택사항)

### 5.1 통합 사용자 뷰
```sql
-- 관리자용 통합 뷰
CREATE VIEW all_users AS
SELECT 
  'business' as user_type,
  id,
  auth_uid,
  email,
  business_name as name,
  phone,
  status,
  created_at
FROM business_users
UNION ALL
SELECT 
  'partner' as user_type,
  id,
  auth_uid,
  email,
  name,
  phone,
  status,
  created_at
FROM partner_users;
```

## 6. 함수 생성

### 6.1 사용자 타입 확인 함수
```sql
CREATE OR REPLACE FUNCTION get_user_type(user_auth_uid UUID)
RETURNS TEXT AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM business_users WHERE auth_uid = user_auth_uid) THEN
    RETURN 'business';
  ELSIF EXISTS (SELECT 1 FROM partner_users WHERE auth_uid = user_auth_uid) THEN
    RETURN 'partner';
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### 6.2 사용자 프로필 조회 함수
```sql
CREATE OR REPLACE FUNCTION get_user_profile(user_auth_uid UUID)
RETURNS JSONB AS $$
DECLARE
  user_type TEXT;
  profile JSONB;
BEGIN
  user_type := get_user_type(user_auth_uid);
  
  IF user_type = 'business' THEN
    SELECT to_jsonb(b.*) INTO profile
    FROM business_users b
    WHERE b.auth_uid = user_auth_uid;
  ELSIF user_type = 'partner' THEN
    SELECT to_jsonb(p.*) INTO profile
    FROM partner_users p
    WHERE p.auth_uid = user_auth_uid;
  END IF;
  
  RETURN profile;
END;
$$ LANGUAGE plpgsql;
```

## 7. 트리거 생성

### 7.1 updated_at 자동 업데이트
```sql
-- 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 비즈니스 사용자 트리거
CREATE TRIGGER update_business_users_updated_at BEFORE UPDATE
    ON business_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 파트너 사용자 트리거
CREATE TRIGGER update_partner_users_updated_at BEFORE UPDATE
    ON partner_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 8. 마이그레이션 실행 순서

1. **백업 생성** (필수)
2. **새 테이블 생성**
3. **RLS 정책 설정**
4. **기존 데이터 마이그레이션**
5. **뷰와 함수 생성**
6. **트리거 설정**
7. **애플리케이션 코드 업데이트**
8. **테스트 실행**
9. **기존 users 테이블 제거** (모든 것이 정상 작동 확인 후)

## 9. 롤백 계획

문제 발생 시:
```sql
-- 새 테이블 삭제
DROP TABLE IF EXISTS business_users CASCADE;
DROP TABLE IF EXISTS partner_users CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;

-- 백업에서 복원
CREATE TABLE users AS SELECT * FROM users_backup;

-- 원래 제약조건 복원
-- (백업한 제약조건 정보 사용)
```

## 10. 모니터링

마이그레이션 후 확인사항:
- 로그인 성공률
- 회원가입 성공률
- 에러 로그 모니터링
- 성능 지표 확인