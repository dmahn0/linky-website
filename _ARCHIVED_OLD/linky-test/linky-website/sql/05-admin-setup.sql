-- Step 5: 어드민 설정
-- 실행 시간: 2025-01-22

-- 1. 어드민 테이블 생성
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  auth_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 어드민용 RLS 정책
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 어드민은 본인 정보만 조회 가능
CREATE POLICY "Admins can view own profile" 
ON admins FOR SELECT 
USING (auth.uid() = auth_uid);

-- 수퍼 어드민은 모든 어드민 조회 가능
CREATE POLICY "Super admins can view all admins" 
ON admins FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE auth_uid = auth.uid() 
    AND role = 'super_admin'
  )
);

-- 3. 어드민 권한 확인 함수
CREATE OR REPLACE FUNCTION is_admin(user_auth_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE auth_uid = user_auth_uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 수퍼 어드민 권한 확인 함수
CREATE OR REPLACE FUNCTION is_super_admin(user_auth_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE auth_uid = user_auth_uid 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 사용자 승인 함수 (어드민 전용)
CREATE OR REPLACE FUNCTION approve_user(user_id INTEGER, user_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- 어드민 권한 확인
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- 사용자 타입에 따라 승인 처리
  IF user_type = 'business' THEN
    UPDATE business_users 
    SET status = 'approved', updated_at = NOW()
    WHERE id = user_id;
  ELSIF user_type = 'partner' THEN
    UPDATE partner_users 
    SET status = 'approved', updated_at = NOW()
    WHERE id = user_id;
  ELSE
    RAISE EXCEPTION 'Invalid user type';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 기존 테이블에 어드민 조회 권한 추가
-- 어드민은 모든 비즈니스 사용자 조회 가능
CREATE POLICY "Admins can view all business users" 
ON business_users FOR SELECT 
USING (is_admin());

-- 어드민은 모든 파트너 사용자 조회 가능
CREATE POLICY "Admins can view all partner users" 
ON partner_users FOR SELECT 
USING (is_admin());

-- 어드민은 비즈니스 사용자 수정 가능
CREATE POLICY "Admins can update business users" 
ON business_users FOR UPDATE 
USING (is_admin());

-- 어드민은 파트너 사용자 수정 가능
CREATE POLICY "Admins can update partner users" 
ON partner_users FOR UPDATE 
USING (is_admin());

-- 7. 첫 번째 수퍼 어드민 생성 (수동으로 실행)
-- 주의: 아래 이메일과 auth_uid를 실제 값으로 변경해야 함
/*
INSERT INTO admins (auth_uid, email, name, role, permissions)
VALUES (
  'YOUR-AUTH-UID-HERE', -- Supabase Auth에서 생성한 사용자의 UID
  'admin@linkykorea.com',
  '관리자',
  'super_admin',
  '{
    "manage_users": true,
    "manage_admins": true,
    "manage_spaces": true,
    "manage_jobs": true,
    "view_analytics": true,
    "manage_payments": true
  }'::jsonb
);
*/

-- 확인 메시지
SELECT '✅ 어드민 설정 완료! 수동으로 첫 번째 어드민을 생성해주세요.' as message;