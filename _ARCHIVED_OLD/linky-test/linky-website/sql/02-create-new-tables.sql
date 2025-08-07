-- Step 2: 새로운 테이블 생성
-- 실행 시간: 2025-01-22

-- 1. 비즈니스 사용자 테이블
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
  deleted_at TIMESTAMPTZ,
  
  -- 제약조건
  CONSTRAINT valid_business_number CHECK (
    business_number ~ '^\d{3}-\d{2}-\d{5}$' OR 
    business_number = '000-00-00000' -- 임시 허용
  ),
  CONSTRAINT valid_bank_info CHECK (
    (bank_name IS NULL AND account_number IS NULL AND account_holder IS NULL) OR
    (bank_name IS NOT NULL AND account_number IS NOT NULL AND account_holder IS NOT NULL)
  )
);

-- 비즈니스 사용자 인덱스
CREATE INDEX idx_business_users_email ON business_users(email);
CREATE INDEX idx_business_users_status ON business_users(status);
CREATE INDEX idx_business_users_type ON business_users(business_type);
CREATE INDEX idx_business_users_created ON business_users(created_at DESC);

-- 2. 파트너 사용자 테이블
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

-- 파트너 사용자 인덱스
CREATE INDEX idx_partner_users_email ON partner_users(email);
CREATE INDEX idx_partner_users_status ON partner_users(status);
CREATE INDEX idx_partner_users_work_areas ON partner_users USING GIN(work_areas);
CREATE INDEX idx_partner_users_rating ON partner_users(rating DESC);
CREATE INDEX idx_partner_users_created ON partner_users(created_at DESC);

-- 3. 알림 설정 테이블 (공통)
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

-- 확인 메시지
SELECT '✅ 새 테이블 생성 완료!' as message;