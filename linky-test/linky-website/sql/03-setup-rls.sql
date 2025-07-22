-- Step 3: RLS (Row Level Security) 설정
-- 실행 시간: 2025-01-22

-- 1. RLS 활성화
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- 2. 비즈니스 사용자 정책
-- 본인 데이터만 조회 가능
CREATE POLICY "Business users can view own profile" 
ON business_users FOR SELECT 
USING (auth.uid() = auth_uid);

-- 본인 데이터만 수정 가능
CREATE POLICY "Business users can update own profile" 
ON business_users FOR UPDATE 
USING (auth.uid() = auth_uid);

-- 회원가입 시 생성 가능
CREATE POLICY "Business users can insert own profile" 
ON business_users FOR INSERT 
WITH CHECK (auth.uid() = auth_uid);

-- 3. 파트너 사용자 정책
-- 본인 데이터만 조회 가능
CREATE POLICY "Partner users can view own profile" 
ON partner_users FOR SELECT 
USING (auth.uid() = auth_uid);

-- 본인 데이터만 수정 가능
CREATE POLICY "Partner users can update own profile" 
ON partner_users FOR UPDATE 
USING (auth.uid() = auth_uid);

-- 회원가입 시 생성 가능
CREATE POLICY "Partner users can insert own profile" 
ON partner_users FOR INSERT 
WITH CHECK (auth.uid() = auth_uid);

-- 4. 알림 설정 정책
-- 본인 설정만 관리 가능
CREATE POLICY "Users can manage own notification settings" 
ON notification_settings FOR ALL 
USING (
  (user_type = 'business' AND user_id IN (SELECT id FROM business_users WHERE auth_uid = auth.uid())) OR
  (user_type = 'partner' AND user_id IN (SELECT id FROM partner_users WHERE auth_uid = auth.uid()))
);

-- 확인 메시지
SELECT '✅ RLS 정책 설정 완료!' as message;