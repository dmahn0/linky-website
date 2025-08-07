-- get_user_type 함수 생성
-- 사용자의 auth_uid로 어느 테이블에 프로필이 있는지 확인하여 사용자 타입 반환

CREATE OR REPLACE FUNCTION get_user_type(user_auth_uid UUID)
RETURNS TEXT AS $$
DECLARE
    business_count INTEGER;
    partner_count INTEGER;
    admin_count INTEGER;
BEGIN
    -- business_users 테이블에서 확인
    SELECT COUNT(*) INTO business_count
    FROM business_users 
    WHERE auth_uid = user_auth_uid;
    
    IF business_count > 0 THEN
        RETURN 'business';
    END IF;
    
    -- partner_users 테이블에서 확인
    SELECT COUNT(*) INTO partner_count
    FROM partner_users 
    WHERE auth_uid = user_auth_uid;
    
    IF partner_count > 0 THEN
        RETURN 'partner';
    END IF;
    
    -- admins 테이블에서 확인
    SELECT COUNT(*) INTO admin_count
    FROM admins 
    WHERE auth_uid = user_auth_uid;
    
    IF admin_count > 0 THEN
        RETURN 'admin';
    END IF;
    
    -- 어느 테이블에도 없으면 NULL 반환
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS 정책 추가 - 모든 사용자가 get_user_type 함수를 호출할 수 있도록
GRANT EXECUTE ON FUNCTION get_user_type(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_user_type(UUID) TO authenticated;

-- 함수 테스트용 - 현재 로그인된 사용자의 타입 확인
CREATE OR REPLACE FUNCTION get_current_user_type()
RETURNS TEXT AS $$
DECLARE
    current_auth_uid UUID;
BEGIN
    -- 현재 인증된 사용자의 UID 가져오기
    SELECT auth.uid() INTO current_auth_uid;
    
    -- 인증되지 않은 경우
    IF current_auth_uid IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- get_user_type 함수 호출
    RETURN get_user_type(current_auth_uid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_current_user_type() TO anon;
GRANT EXECUTE ON FUNCTION get_current_user_type() TO authenticated;

-- 함수 생성 확인
SELECT 'get_user_type 함수가 성공적으로 생성되었습니다.' as message;