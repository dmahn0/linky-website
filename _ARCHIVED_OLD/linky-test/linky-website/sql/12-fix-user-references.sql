-- Step 12: users 데이터와 새 테이블 연결
-- 실행 시간: 2025-01-22

-- 1. 먼저 users 테이블의 구조 이해
-- users.id = Supabase Auth의 user id (auth.users.id)
-- users.uid = 애플리케이션에서 생성한 고유 ID

-- 2. 기존 business 사용자를 business_users로 마이그레이션
INSERT INTO business_users (
    id,
    auth_uid,  -- 이것은 users.id (Supabase Auth ID)
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
    gen_random_uuid() as id,
    u.id as auth_uid,  -- users.id가 auth_uid
    u.email,
    COALESCE((u.business->>'phone')::text, ''),
    COALESCE((u.business->>'businessName')::text, (u.business->>'name')::text, u.email) as business_name,
    COALESCE((u.business->>'businessNumber')::text, '000-00-00000') as business_number,
    COALESCE((u.business->>'businessType')::text, 'other') as business_type,
    COALESCE((u.business->>'businessAddress')::text, '주소 미입력') as business_address,
    COALESCE((u.business->>'representativeName')::text, (u.business->>'businessName')::text, u.email) as representative_name,
    'approved' as status
FROM users u
WHERE u.type = 'business'
AND NOT EXISTS (
    SELECT 1 FROM business_users b 
    WHERE b.auth_uid = u.id
)
ON CONFLICT (auth_uid) DO NOTHING;

-- 3. 기존 partner 사용자를 partner_users로 마이그레이션
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
    u.id as auth_uid,  -- users.id가 auth_uid
    u.email,
    COALESCE((u.partner->>'phone')::text, ''),
    COALESCE((u.partner->>'name')::text, u.email) as name,
    COALESCE((u.partner->>'residence')::text, '미입력') as residence,
    CASE 
        WHEN u.partner->>'workAreas' IS NOT NULL 
        THEN ARRAY(SELECT jsonb_array_elements_text(u.partner->'workAreas'))
        ELSE ARRAY['미지정']::text[]
    END as work_areas,
    'approved' as status
FROM users u
WHERE u.type = 'partner'
AND NOT EXISTS (
    SELECT 1 FROM partner_users p 
    WHERE p.auth_uid = u.id
)
ON CONFLICT (auth_uid) DO NOTHING;

-- 4. 마이그레이션 결과 확인
SELECT 
    'Migrated business users' as status,
    COUNT(*) as count
FROM business_users
UNION ALL
SELECT 
    'Migrated partner users' as status,
    COUNT(*) as count
FROM partner_users
UNION ALL
SELECT 
    'Original business users' as status,
    COUNT(*) as count
FROM users WHERE type = 'business'
UNION ALL
SELECT 
    'Original partner users' as status,
    COUNT(*) as count
FROM users WHERE type = 'partner';

-- 5. 이제 외래키 업데이트 가능
-- spaces의 owner_id는 users.id를 참조하므로, business_users.auth_uid로 변경
ALTER TABLE spaces 
DROP CONSTRAINT IF EXISTS spaces_owner_id_fkey;

ALTER TABLE spaces
ADD CONSTRAINT spaces_owner_id_business_users_fkey
FOREIGN KEY (owner_id) 
REFERENCES business_users(auth_uid) 
ON DELETE CASCADE;

-- 6. jobs 테이블도 동일하게 처리
ALTER TABLE jobs 
DROP CONSTRAINT IF EXISTS jobs_business_id_fkey;

ALTER TABLE jobs
ADD CONSTRAINT jobs_business_id_business_users_fkey
FOREIGN KEY (business_id) 
REFERENCES business_users(auth_uid) 
ON DELETE CASCADE;

ALTER TABLE jobs 
DROP CONSTRAINT IF EXISTS jobs_partner_id_fkey;

ALTER TABLE jobs
ADD CONSTRAINT jobs_partner_id_partner_users_fkey
FOREIGN KEY (partner_id) 
REFERENCES partner_users(auth_uid) 
ON DELETE SET NULL;

-- 7. 최종 확인
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

SELECT '✅ 마이그레이션 및 참조 업데이트 완료!' as message;