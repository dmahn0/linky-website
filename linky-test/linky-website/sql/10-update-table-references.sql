-- Step 10: spaces와 jobs 테이블의 참조 업데이트
-- 실행 시간: 2025-01-22
-- users 테이블 대신 business_users와 partner_users를 참조하도록 변경

-- 1. 현재 테이블 구조 확인
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
AND t.table_name IN ('spaces', 'jobs')
AND c.column_name IN ('owner_id', 'business_id', 'partner_id', 'businessId', 'partnerId')
ORDER BY t.table_name, c.ordinal_position;

-- 2. spaces 테이블 업데이트 (owner_id를 business_user의 auth_uid로 변경)
-- 옵션 A: auth_uid를 사용하는 경우 (권장)
DO $$
BEGIN
    -- spaces 테이블이 존재하는지 확인
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'spaces') THEN
        -- owner_id 컬럼 타입 확인
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'spaces' AND column_name = 'owner_id'
        ) THEN
            -- owner_id를 UUID 타입으로 변경 (이미 UUID가 아닌 경우)
            -- ALTER TABLE spaces ALTER COLUMN owner_id TYPE UUID USING owner_id::UUID;
            
            -- 외래키 제약 조건 제거 (있는 경우)
            ALTER TABLE spaces 
            DROP CONSTRAINT IF EXISTS spaces_owner_id_fkey;
            
            -- 새로운 외래키 추가 (business_users.auth_uid 참조)
            ALTER TABLE spaces
            ADD CONSTRAINT spaces_owner_id_fkey
            FOREIGN KEY (owner_id) 
            REFERENCES business_users(auth_uid) 
            ON DELETE CASCADE;
            
            RAISE NOTICE 'spaces 테이블 owner_id 참조 업데이트 완료';
        END IF;
    END IF;
END $$;

-- 3. jobs 테이블 업데이트
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs') THEN
        -- business_id 업데이트
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'jobs' AND column_name IN ('business_id', 'businessId')
        ) THEN
            -- 컬럼명 통일 (businessId -> business_id)
            ALTER TABLE jobs 
            RENAME COLUMN businessId TO business_id;
            
            -- UUID 타입으로 변경 (필요한 경우)
            -- ALTER TABLE jobs ALTER COLUMN business_id TYPE UUID USING business_id::UUID;
            
            -- 외래키 제거 및 재생성
            ALTER TABLE jobs 
            DROP CONSTRAINT IF EXISTS jobs_business_id_fkey,
            DROP CONSTRAINT IF EXISTS jobs_businessId_fkey;
            
            ALTER TABLE jobs
            ADD CONSTRAINT jobs_business_id_fkey
            FOREIGN KEY (business_id) 
            REFERENCES business_users(auth_uid) 
            ON DELETE CASCADE;
        END IF;
        
        -- partner_id 업데이트
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'jobs' AND column_name IN ('partner_id', 'partnerId')
        ) THEN
            -- 컬럼명 통일 (partnerId -> partner_id)
            ALTER TABLE jobs 
            RENAME COLUMN partnerId TO partner_id;
            
            -- UUID 타입으로 변경 (필요한 경우)
            -- ALTER TABLE jobs ALTER COLUMN partner_id TYPE UUID USING partner_id::UUID;
            
            -- 외래키 제거 및 재생성
            ALTER TABLE jobs 
            DROP CONSTRAINT IF EXISTS jobs_partner_id_fkey,
            DROP CONSTRAINT IF EXISTS jobs_partnerId_fkey;
            
            ALTER TABLE jobs
            ADD CONSTRAINT jobs_partner_id_fkey
            FOREIGN KEY (partner_id) 
            REFERENCES partner_users(auth_uid) 
            ON DELETE SET NULL;
        END IF;
        
        RAISE NOTICE 'jobs 테이블 참조 업데이트 완료';
    END IF;
END $$;

-- 4. 업데이트된 외래키 확인
SELECT 
    tc.table_name,
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

-- 5. 데이터 무결성 확인
-- spaces 테이블에서 존재하지 않는 owner_id 찾기
SELECT 
    s.id,
    s.name,
    s.owner_id
FROM spaces s
LEFT JOIN business_users b ON b.auth_uid = s.owner_id
WHERE b.auth_uid IS NULL;

-- jobs 테이블에서 존재하지 않는 business_id/partner_id 찾기
SELECT 
    j.id,
    j.business_id,
    j.partner_id,
    CASE 
        WHEN b.auth_uid IS NULL THEN 'business_id not found'
        WHEN p.auth_uid IS NULL AND j.partner_id IS NOT NULL THEN 'partner_id not found'
        ELSE 'OK'
    END as status
FROM jobs j
LEFT JOIN business_users b ON b.auth_uid = j.business_id
LEFT JOIN partner_users p ON p.auth_uid = j.partner_id
WHERE b.auth_uid IS NULL 
   OR (j.partner_id IS NOT NULL AND p.auth_uid IS NULL);

SELECT '✅ 테이블 참조 업데이트 완료!' as message;