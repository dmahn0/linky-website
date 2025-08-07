-- Step 11: 실제 테이블 참조 업데이트
-- 실행 시간: 2025-01-22
-- 확인된 테이블 구조에 맞춰 참조 업데이트

-- 1. 먼저 외래키 제약조건 확인
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
    AND tc.table_name IN ('spaces', 'jobs')
ORDER BY tc.table_name, kcu.column_name;

-- 2. spaces 테이블의 owner_id 업데이트
-- 현재 owner_id는 users.uid를 참조하는 것으로 보임
-- business_users.auth_uid를 참조하도록 변경

-- 2-1. 기존 외래키 제거
ALTER TABLE spaces 
DROP CONSTRAINT IF EXISTS spaces_owner_id_fkey;

-- 2-2. 새 외래키 추가 (business_users.auth_uid 참조)
ALTER TABLE spaces
ADD CONSTRAINT spaces_owner_id_business_users_fkey
FOREIGN KEY (owner_id) 
REFERENCES business_users(auth_uid) 
ON DELETE CASCADE;

-- 3. jobs 테이블의 business_id와 partner_id 업데이트
-- 3-1. business_id 외래키 업데이트
ALTER TABLE jobs 
DROP CONSTRAINT IF EXISTS jobs_business_id_fkey;

ALTER TABLE jobs
ADD CONSTRAINT jobs_business_id_business_users_fkey
FOREIGN KEY (business_id) 
REFERENCES business_users(auth_uid) 
ON DELETE CASCADE;

-- 3-2. partner_id 외래키 업데이트
ALTER TABLE jobs 
DROP CONSTRAINT IF EXISTS jobs_partner_id_fkey;

ALTER TABLE jobs
ADD CONSTRAINT jobs_partner_id_partner_users_fkey
FOREIGN KEY (partner_id) 
REFERENCES partner_users(auth_uid) 
ON DELETE SET NULL;

-- 4. 데이터 무결성 확인
-- 4-1. spaces에서 유효하지 않은 owner_id 찾기
SELECT 
    'spaces' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT s.owner_id) as unique_owners,
    COUNT(b.auth_uid) as valid_owners,
    COUNT(*) - COUNT(b.auth_uid) as invalid_owners
FROM spaces s
LEFT JOIN business_users b ON b.auth_uid = s.owner_id;

-- 4-2. jobs에서 유효하지 않은 business_id/partner_id 찾기  
SELECT 
    'jobs - business' as check_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT j.business_id) as unique_business_ids,
    COUNT(b.auth_uid) as valid_business_ids,
    COUNT(*) - COUNT(b.auth_uid) as invalid_business_ids
FROM jobs j
LEFT JOIN business_users b ON b.auth_uid = j.business_id;

SELECT 
    'jobs - partner' as check_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT j.partner_id) as unique_partner_ids,
    COUNT(p.auth_uid) as valid_partner_ids,
    COUNT(j.partner_id) - COUNT(p.auth_uid) as invalid_partner_ids
FROM jobs j
LEFT JOIN partner_users p ON p.auth_uid = j.partner_id
WHERE j.partner_id IS NOT NULL;

-- 5. 문제가 있는 레코드 상세 확인
-- 5-1. spaces의 문제 레코드
SELECT 
    s.id,
    s.name,
    s.owner_id,
    u.uid as old_users_uid,
    u.email,
    u.type
FROM spaces s
LEFT JOIN business_users b ON b.auth_uid = s.owner_id
LEFT JOIN users u ON u.uid::uuid = s.owner_id
WHERE b.auth_uid IS NULL
LIMIT 10;

-- 5-2. jobs의 문제 레코드 (business)
SELECT 
    j.id,
    j.job_id,
    j.business_id,
    u.uid as old_users_uid,
    u.email,
    u.type
FROM jobs j
LEFT JOIN business_users b ON b.auth_uid = j.business_id
LEFT JOIN users u ON u.uid::uuid = j.business_id
WHERE b.auth_uid IS NULL
LIMIT 10;

-- 6. 데이터 마이그레이션 (필요한 경우)
-- users 테이블의 데이터를 business_users로 복사
INSERT INTO business_users (
    id,  -- UUID 타입이므로 생성 필요
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
    gen_random_uuid() as id,  -- 새 UUID 생성
    u.uid::uuid as auth_uid,
    u.email,
    COALESCE((u.business->>'phone')::text, ''),
    COALESCE((u.business->>'businessName')::text, u.email) as business_name,
    COALESCE((u.business->>'businessNumber')::text, '000-00-00000') as business_number,
    COALESCE((u.business->>'businessType')::text, 'other') as business_type,
    COALESCE((u.business->>'businessAddress')::text, '주소 미입력') as business_address,
    COALESCE((u.business->>'businessName')::text, u.email) as representative_name,
    'approved' as status
FROM users u
WHERE u.type = 'business'
AND NOT EXISTS (
    SELECT 1 FROM business_users b 
    WHERE b.auth_uid = u.uid::uuid
);

-- 파트너도 동일하게 처리
INSERT INTO partner_users (
    id,
    auth_uid,
    email,
    phone,
    name,
    residence,
    work_areas,
    status
)
SELECT 
    gen_random_uuid() as id,
    u.uid::uuid as auth_uid,
    u.email,
    COALESCE((u.partner->>'phone')::text, ''),
    COALESCE((u.partner->>'name')::text, u.email) as name,
    COALESCE((u.partner->>'residence')::text, '미입력') as residence,
    ARRAY['미지정']::text[] as work_areas,
    'approved' as status
FROM users u
WHERE u.type = 'partner'
AND NOT EXISTS (
    SELECT 1 FROM partner_users p 
    WHERE p.auth_uid = u.uid::uuid
);

-- 7. 최종 확인
SELECT '✅ 참조 업데이트 완료!' as status,
       '다시 4번과 5번 쿼리를 실행하여 무결성을 확인하세요.' as next_step;