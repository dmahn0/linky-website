-- Step 4: 유틸리티 함수 생성
-- 실행 시간: 2025-01-22

-- 1. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. 트리거 생성
CREATE TRIGGER update_business_users_updated_at 
    BEFORE UPDATE ON business_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_users_updated_at 
    BEFORE UPDATE ON partner_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at 
    BEFORE UPDATE ON notification_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. 사용자 타입 확인 함수
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 사용자 프로필 조회 함수
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
  
  IF profile IS NOT NULL THEN
    profile := profile || jsonb_build_object('user_type', user_type);
  END IF;
  
  RETURN profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 확인 메시지
SELECT '✅ 유틸리티 함수 생성 완료!' as message;