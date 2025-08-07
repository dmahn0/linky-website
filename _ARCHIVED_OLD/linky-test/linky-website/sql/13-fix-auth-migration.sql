-- Step 13: Auth 연결 문제 해결
-- 실행 시간: 2025-01-22

-- 1. 현재 상황 확인
SELECT 
    'auth.users' as table_name,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'public.users' as table_name,
    COUNT(*) as count
FROM public.users
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

-- 2. 옵션 A: 기존 사용자를 Supabase Auth에 생성 (권장하지 않음 - 비밀번호를 모름)

-- 3. 옵션 B: 임시로 외래키 제약을 제거하고 데이터 마이그레이션
-- 3-1. 외래키 제약 제거
ALTER TABLE business_users 
DROP CONSTRAINT IF EXISTS business_users_auth_uid_fkey;

ALTER TABLE partner_users 
DROP CONSTRAINT IF EXISTS partner_users_auth_uid_fkey;

-- 3-2. 이제 다시 INSERT 실행
INSERT INTO business_users (
    id,
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
    gen_random_uuid() as id,
    u.id as auth_uid,  -- public.users.id 사용
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

-- 파트너도 동일
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
    u.id as auth_uid,
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

-- 4. 확인
SELECT 
    'Migrated business users' as status,
    COUNT(*) as count
FROM business_users
UNION ALL
SELECT 
    'Migrated partner users' as status,
    COUNT(*) as count
FROM partner_users;

-- 5. spaces와 jobs 테이블의 외래키 업데이트 (이미 비어있으므로 안전함)
ALTER TABLE spaces 
DROP CONSTRAINT IF EXISTS spaces_owner_id_fkey;

ALTER TABLE spaces
ADD CONSTRAINT spaces_owner_id_public_users_fkey
FOREIGN KEY (owner_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

ALTER TABLE jobs 
DROP CONSTRAINT IF EXISTS jobs_business_id_fkey;

ALTER TABLE jobs
ADD CONSTRAINT jobs_business_id_public_users_fkey
FOREIGN KEY (business_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

ALTER TABLE jobs 
DROP CONSTRAINT IF EXISTS jobs_partner_id_fkey;

ALTER TABLE jobs
ADD CONSTRAINT jobs_partner_id_public_users_fkey
FOREIGN KEY (partner_id) 
REFERENCES public.users(id) 
ON DELETE SET NULL;

-- 6. 나중에 실제 auth.users와 연결하려면
-- 실제 사용자가 로그인할 때 auth.users.id로 business_users.auth_uid를 업데이트해야 함
-- 예: UPDATE business_users SET auth_uid = ? WHERE email = ?

SELECT '✅ 외래키 제약 없이 마이그레이션 완료!' as message;