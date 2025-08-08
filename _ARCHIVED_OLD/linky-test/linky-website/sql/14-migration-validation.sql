-- Step 14: 마이그레이션 검증 쿼리
-- 실행 시간: 2025-01-22
-- 목적: 마이그레이션 후 데이터 무결성 및 문제점 검토

-- 1. 전체 데이터 카운트 확인
SELECT 
    'Original users table' as description,
    COUNT(*) as count,
    COUNT(CASE WHEN type = 'business' THEN 1 END) as business_count,
    COUNT(CASE WHEN type = 'partner' THEN 1 END) as partner_count
FROM users

UNION ALL

SELECT 
    'New business_users table' as description,
    COUNT(*) as count,
    COUNT(*) as business_count,
    0 as partner_count
FROM business_users

UNION ALL

SELECT 
    'New partner_users table' as description,
    COUNT(*) as count,
    0 as business_count,
    COUNT(*) as partner_count
FROM partner_users;

-- 2. auth.users와의 연결 확인
SELECT 
    'Auth users without profile' as check_type,
    COUNT(*) as count
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM business_users bu WHERE bu.auth_uid = au.id
) AND NOT EXISTS (
    SELECT 1 FROM partner_users pu WHERE pu.auth_uid = au.id
) AND NOT EXISTS (
    SELECT 1 FROM admins a WHERE a.auth_uid = au.id
);

-- 3. 중복 데이터 확인
SELECT 
    'Duplicate emails in business_users' as check_type,
    email,
    COUNT(*) as count
FROM business_users
GROUP BY email
HAVING COUNT(*) > 1

UNION ALL

SELECT 
    'Duplicate emails in partner_users' as check_type,
    email,
    COUNT(*) as count
FROM partner_users
GROUP BY email
HAVING COUNT(*) > 1;

-- 4. 외래키 참조 무결성 확인
-- 4-1. spaces 테이블
SELECT 
    'Spaces with invalid owner_id' as check_type,
    COUNT(*) as total,
    COUNT(DISTINCT s.owner_id) as unique_invalid_ids
FROM spaces s
WHERE NOT EXISTS (
    SELECT 1 FROM business_users bu WHERE bu.auth_uid = s.owner_id
);

-- 4-2. jobs 테이블 - business_id
SELECT 
    'Jobs with invalid business_id' as check_type,
    COUNT(*) as total,
    COUNT(DISTINCT j.business_id) as unique_invalid_ids
FROM jobs j
WHERE j.business_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM business_users bu WHERE bu.auth_uid = j.business_id
);

-- 4-3. jobs 테이블 - partner_id
SELECT 
    'Jobs with invalid partner_id' as check_type,
    COUNT(*) as total,
    COUNT(DISTINCT j.partner_id) as unique_invalid_ids
FROM jobs j
WHERE j.partner_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM partner_users pu WHERE pu.auth_uid = j.partner_id
);

-- 5. 필수 필드 누락 확인
-- 5-1. business_users 필수 필드
SELECT 
    'Business users with missing required fields' as check_type,
    id,
    email,
    CASE 
        WHEN email IS NULL OR email = '' THEN 'email missing, '
        ELSE ''
    END ||
    CASE 
        WHEN phone IS NULL OR phone = '' THEN 'phone missing, '
        ELSE ''
    END ||
    CASE 
        WHEN business_name IS NULL OR business_name = '' THEN 'business_name missing, '
        ELSE ''
    END ||
    CASE 
        WHEN business_number IS NULL OR business_number = '' THEN 'business_number missing, '
        ELSE ''
    END as missing_fields
FROM business_users
WHERE email IS NULL OR email = ''
   OR phone IS NULL OR phone = ''
   OR business_name IS NULL OR business_name = ''
   OR business_number IS NULL OR business_number = '';

-- 5-2. partner_users 필수 필드
SELECT 
    'Partner users with missing required fields' as check_type,
    id,
    email,
    CASE 
        WHEN email IS NULL OR email = '' THEN 'email missing, '
        ELSE ''
    END ||
    CASE 
        WHEN phone IS NULL OR phone = '' THEN 'phone missing, '
        ELSE ''
    END ||
    CASE 
        WHEN name IS NULL OR name = '' THEN 'name missing, '
        ELSE ''
    END ||
    CASE 
        WHEN residence IS NULL OR residence = '' THEN 'residence missing, '
        ELSE ''
    END ||
    CASE 
        WHEN work_areas IS NULL OR array_length(work_areas, 1) = 0 THEN 'work_areas missing'
        ELSE ''
    END as missing_fields
FROM partner_users
WHERE email IS NULL OR email = ''
   OR phone IS NULL OR phone = ''
   OR name IS NULL OR name = ''
   OR residence IS NULL OR residence = ''
   OR work_areas IS NULL OR array_length(work_areas, 1) = 0;

-- 6. 데이터 일관성 확인
-- 6-1. 임시 데이터 확인 (마이그레이션 시 기본값 사용된 경우)
SELECT 
    'Business users with temporary data' as check_type,
    COUNT(*) as total,
    COUNT(CASE WHEN business_number = '000-00-00000' THEN 1 END) as temp_business_number,
    COUNT(CASE WHEN business_type = 'other' THEN 1 END) as temp_business_type,
    COUNT(CASE WHEN business_address = '주소 미입력' THEN 1 END) as temp_address
FROM business_users;

SELECT 
    'Partner users with temporary data' as check_type,
    COUNT(*) as total,
    COUNT(CASE WHEN residence = '미입력' THEN 1 END) as temp_residence,
    COUNT(CASE WHEN work_areas = ARRAY['미지정']::text[] THEN 1 END) as temp_work_areas
FROM partner_users;


-- 8. 인덱스 확인
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('business_users', 'partner_users', 'admins')
ORDER BY tablename, indexname;

-- 9. 함수 동작 확인
-- get_user_type 함수 테스트
SELECT 
    'get_user_type function test' as test_name,
    u.email,
    u.type as original_type,
    get_user_type(u.id) as function_result,
    CASE 
        WHEN u.type = get_user_type(u.id) THEN 'PASS'
        ELSE 'FAIL'
    END as test_result
FROM users u
LIMIT 10;

-- 10. 마이그레이션 요약
WITH migration_summary AS (
    SELECT 
        (SELECT COUNT(*) FROM users WHERE type = 'business') as original_business,
        (SELECT COUNT(*) FROM users WHERE type = 'partner') as original_partner,
        (SELECT COUNT(*) FROM business_users) as migrated_business,
        (SELECT COUNT(*) FROM partner_users) as migrated_partner,
        (SELECT COUNT(*) FROM admins) as admin_count
)
SELECT 
    '🔍 Migration Summary' as report,
    CASE 
        WHEN original_business = migrated_business AND original_partner = migrated_partner 
        THEN '✅ All users migrated successfully'
        ELSE '❌ Migration count mismatch!'
    END as status,
    original_business || ' → ' || migrated_business as business_migration,
    original_partner || ' → ' || migrated_partner as partner_migration,
    admin_count || ' admin(s)' as admins
FROM migration_summary;

-- 11. 잠재적 문제점 요약
SELECT '⚠️ Potential Issues:' as category, 
       '다음 항목들을 확인해주세요:' as message
UNION ALL
SELECT '1. Auth 연결', 
       '- auth.users와 연결되지 않은 프로필이 있는지 확인'
UNION ALL
SELECT '2. 외래키 참조', 
       '- spaces와 jobs의 참조가 모두 유효한지 확인'
UNION ALL
SELECT '3. 임시 데이터', 
       '- 마이그레이션 시 사용된 기본값들을 실제 데이터로 업데이트 필요'
UNION ALL
SELECT '4. RLS 정책', 
       '- 각 테이블의 RLS 정책이 올바르게 설정되었는지 확인'
UNION ALL
SELECT '5. 중복 데이터', 
       '- 이메일 중복이나 auth_uid 중복이 없는지 확인';