-- Step 15: 누락된 phone 필드 수정
-- 실행 시간: 2025-01-22
-- 목적: 마이그레이션 시 phone이 NULL인 사용자들의 데이터 수정

-- 1. 현재 상태 확인
SELECT 
    'Business users without phone' as user_type,
    COUNT(*) as count
FROM business_users
WHERE phone IS NULL OR phone = ''
UNION ALL
SELECT 
    'Partner users without phone' as user_type,
    COUNT(*) as count
FROM partner_users
WHERE phone IS NULL OR phone = '';

-- 2. phone 필드 업데이트 (기본값으로)
-- business_users
UPDATE business_users
SET phone = '010-0000-0000'
WHERE phone IS NULL OR phone = '';

-- partner_users
UPDATE partner_users
SET phone = '010-0000-0000'
WHERE phone IS NULL OR phone = '';

-- 3. 업데이트 결과 확인
SELECT 
    'After update - Business users without phone' as status,
    COUNT(*) as count
FROM business_users
WHERE phone IS NULL OR phone = ''
UNION ALL
SELECT 
    'After update - Partner users without phone' as status,
    COUNT(*) as count
FROM partner_users
WHERE phone IS NULL OR phone = '';

-- 4. 업데이트된 사용자 목록
SELECT 
    'Updated users' as status,
    'business' as user_type,
    id,
    email,
    phone
FROM business_users
WHERE phone = '010-0000-0000'
UNION ALL
SELECT 
    'Updated users' as status,
    'partner' as user_type,
    id,
    email,
    phone
FROM partner_users
WHERE phone = '010-0000-0000';

-- 5. 제약조건 확인을 위해 NOT NULL 제약 추가 고려
-- 주의: 실제로 실행하기 전에 모든 데이터가 채워졌는지 확인 필요
/*
ALTER TABLE business_users 
ALTER COLUMN phone SET NOT NULL;

ALTER TABLE partner_users 
ALTER COLUMN phone SET NOT NULL;
*/

SELECT '✅ Phone 필드 업데이트 완료!' as message;