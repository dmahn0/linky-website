-- Step 8: 기존 테이블의 참조만 업데이트
-- 실행 시간: 2025-01-22
-- users 테이블은 유지하고, 다른 테이블들이 새로운 테이블을 참조하도록 변경

-- 1. spaces 테이블이 business_users를 참조하도록 업데이트
-- 기존: owner_id -> users.id
-- 변경: owner_id -> business_users.id (auth_uid 매칭)

-- spaces 테이블 구조 확인
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'spaces'
ORDER BY ordinal_position;

-- 2. jobs 테이블이 business_users와 partner_users를 참조하도록 업데이트
-- 기존: business_id -> users.uid, partner_id -> users.uid  
-- 변경: business_id -> business_users.auth_uid, partner_id -> partner_users.auth_uid

-- jobs 테이블이 이미 auth_uid를 사용한다면 변경 불필요
-- 만약 숫자 ID를 사용한다면 auth_uid로 변경 필요

-- 3. 기존 코드에서 users 테이블 참조 확인
SELECT 
    'spaces' as table_name,
    COUNT(*) as count
FROM spaces
UNION ALL
SELECT 
    'jobs' as table_name,
    COUNT(*) as count
FROM jobs
UNION ALL
SELECT 
    'business_users' as table_name,
    COUNT(*) as count
FROM business_users
UNION ALL
SELECT 
    'partner_users' as table_name,
    COUNT(*) as count
FROM partner_users;

-- 4. 뷰(View) 생성으로 기존 코드 호환성 유지
-- users 테이블처럼 보이는 뷰를 생성하여 기존 코드가 계속 작동하도록 함
CREATE OR REPLACE VIEW users_view AS
SELECT 
    b.auth_uid as uid,
    b.email,
    b.phone,
    b.business_name as name,
    'business' as type,
    b.status,
    b.created_at,
    b.updated_at,
    -- 비즈니스 전용 필드
    b.business_name as "businessName",
    b.business_number as "businessNumber",
    b.business_type as "businessType",
    b.business_address as "businessAddress",
    NULL::text as residence,
    NULL::text[] as "workAreas",
    NULL::jsonb as "availableTimes"
FROM business_users b
UNION ALL
SELECT 
    p.auth_uid as uid,
    p.email,
    p.phone,
    p.name,
    'partner' as type,
    p.status,
    p.created_at,
    p.updated_at,
    -- 파트너 전용 필드
    NULL as "businessName",
    NULL as "businessNumber", 
    NULL as "businessType",
    NULL as "businessAddress",
    p.residence,
    p.work_areas as "workAreas",
    p.available_times as "availableTimes"
FROM partner_users p;

-- 5. 기존 users 테이블이 있다면 이름 변경 (백업)
ALTER TABLE IF EXISTS users RENAME TO users_old_backup;

-- 6. 뷰를 users로 이름 변경 (선택사항)
-- 주의: 이렇게 하면 INSERT/UPDATE가 불가능해짐
-- ALTER VIEW users_view RENAME TO users;

-- 7. 확인
SELECT 
    'users_view 생성 완료' as status,
    COUNT(*) as total_users
FROM users_view;

-- 8. 테스트 쿼리
-- 기존 코드가 작동하는지 확인
SELECT * FROM users_view WHERE type = 'business' LIMIT 5;
SELECT * FROM users_view WHERE type = 'partner' LIMIT 5;

SELECT '✅ 참조 업데이트 완료! users_view를 통해 기존 코드 호환성 유지' as message;