-- Step 9: 가장 간단한 참조 업데이트
-- 실행 시간: 2025-01-22
-- users 테이블은 그대로 두고, 새로운 인증 시스템과 공존

-- 1. 기존 users 테이블의 데이터를 새 테이블로 복사 (선택사항)
-- 이미 회원가입한 사용자들이 새 시스템에서도 로그인할 수 있도록
INSERT INTO business_users (
    auth_uid,
    email,
    phone,
    business_name,
    business_number,
    business_type,
    business_address,
    representative_name,
    status
)
SELECT 
    uid,
    email,
    COALESCE(phone, ''),
    COALESCE(businessName, name, email),
    '000-00-00000',
    'other',
    '주소 미입력',
    COALESCE(businessName, name, email),
    COALESCE(status, 'approved')
FROM users
WHERE type = 'business'
ON CONFLICT (auth_uid) DO NOTHING;

INSERT INTO partner_users (
    auth_uid,
    email,
    phone,
    name,
    residence,
    work_areas,
    status
)
SELECT 
    uid,
    email,
    COALESCE(phone, ''),
    COALESCE(name, email),
    COALESCE(residence, '미입력'),
    COALESCE(workAreas, ARRAY['미지정']::text[]),
    COALESCE(status, 'approved')
FROM users
WHERE type = 'partner'
ON CONFLICT (auth_uid) DO NOTHING;

-- 2. 확인
SELECT 
    'Original users' as source,
    type,
    COUNT(*) as count
FROM users
GROUP BY type
UNION ALL
SELECT 
    'New business_users' as source,
    'business' as type,
    COUNT(*) as count
FROM business_users
UNION ALL
SELECT 
    'New partner_users' as source,
    'partner' as type,
    COUNT(*) as count
FROM partner_users
ORDER BY type;

-- 3. 기존 코드와의 호환성을 위한 함수
-- get_user_data 함수: auth_uid로 사용자 정보 조회
CREATE OR REPLACE FUNCTION get_user_data(user_auth_uid UUID)
RETURNS TABLE (
    uid UUID,
    email TEXT,
    name TEXT,
    type TEXT,
    status TEXT
) AS $$
BEGIN
    -- 먼저 새 테이블에서 찾기
    RETURN QUERY
    SELECT 
        b.auth_uid,
        b.email,
        b.business_name,
        'business'::text,
        b.status
    FROM business_users b
    WHERE b.auth_uid = user_auth_uid
    UNION
    SELECT 
        p.auth_uid,
        p.email,
        p.name,
        'partner'::text,
        p.status
    FROM partner_users p
    WHERE p.auth_uid = user_auth_uid;
    
    -- 없으면 기존 users 테이블에서 찾기
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            u.uid,
            u.email,
            u.name,
            u.type,
            u.status
        FROM users u
        WHERE u.uid = user_auth_uid;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ 간단한 참조 업데이트 완료!' as message;