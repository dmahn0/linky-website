-- Step 17: users 테이블 삭제 후 함수 수정
-- 실행 시간: 2025-01-22
-- 목적: users 테이블이 삭제되어 오류가 발생할 수 있는 함수들 확인 및 수정

-- 1. 현재 존재하는 사용자 정의 함수 확인
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND p.proname IN ('get_user_type', 'get_user_profile', 'handle_new_user')
ORDER BY p.proname;

-- 2. get_user_type 함수가 users 테이블을 참조하는지 확인
-- 만약 참조한다면 수정 필요 없음 (이미 business_users, partner_users만 확인하도록 되어있음)

-- 3. handle_new_user 함수 확인 및 수정 (있는 경우)
-- 이 함수가 users 테이블에 데이터를 삽입하려 한다면 문제 발생
/*
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 이제는 users 테이블이 없으므로 아무것도 하지 않음
    -- 또는 이 트리거 자체를 삭제
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
*/

-- 4. auth.users와 연결된 트리거 확인
SELECT 
    event_object_schema as schema,
    event_object_table as table_name,
    trigger_name,
    event_manipulation as event,
    action_statement as action
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users';

-- 5. users 테이블을 참조하는 뷰가 있는지 확인
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE schemaname = 'public'
  AND definition LIKE '%users%';

-- 6. users 테이블을 참조하는 외래키가 남아있는지 확인
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'users';

-- 7. 남은 정리 작업
-- 7-1. handle_new_user 트리거가 있다면 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 7-2. users 테이블 관련 시퀀스가 있다면 삭제
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;

-- 8. 현재 시스템 상태 요약
WITH system_status AS (
    SELECT 
        (SELECT COUNT(*) FROM business_users) as business_count,
        (SELECT COUNT(*) FROM partner_users) as partner_count,
        (SELECT COUNT(*) FROM admins) as admin_count,
        (SELECT COUNT(*) FROM auth.users) as auth_users_count
)
SELECT 
    '📊 현재 시스템 상태' as status,
    business_count || ' 비즈니스 사용자' as business_users,
    partner_count || ' 파트너 사용자' as partner_users,
    admin_count || ' 관리자' as admins,
    auth_users_count || ' 인증 사용자' as auth_users,
    CASE 
        WHEN auth_users_count > (business_count + partner_count + admin_count)
        THEN '⚠️ 프로필이 없는 auth 사용자가 ' || 
             (auth_users_count - business_count - partner_count - admin_count) || '명 있습니다'
        ELSE '✅ 모든 auth 사용자가 프로필을 가지고 있습니다'
    END as profile_status
FROM system_status;

SELECT '✅ users 테이블 관련 정리 완료!' as message;