-- Step 7: 관련 테이블 업데이트
-- 실행 시간: 2025-01-22
-- users 테이블을 참조하는 다른 테이블들 업데이트

-- 1. spaces 테이블 확인 및 업데이트
-- spaces 테이블이 users.id를 참조하는 경우
DO $$
BEGIN
  -- spaces 테이블이 존재하고 owner_id 컬럼이 있는지 확인
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'spaces' 
    AND column_name = 'owner_id'
  ) THEN
    -- 임시 컬럼 추가 (business_user_id)
    ALTER TABLE spaces 
    ADD COLUMN IF NOT EXISTS business_user_id INTEGER;
    
    -- business_users 테이블과 매칭하여 업데이트
    UPDATE spaces s
    SET business_user_id = b.id
    FROM users u
    JOIN business_users b ON b.auth_uid = u.uid
    WHERE s.owner_id = u.id;
    
    -- 외래키 제약 조건 추가
    ALTER TABLE spaces
    ADD CONSTRAINT fk_spaces_business_user
    FOREIGN KEY (business_user_id) 
    REFERENCES business_users(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'spaces 테이블 업데이트 완료';
  END IF;
END $$;

-- 2. jobs 테이블 확인 및 업데이트
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'jobs' 
    AND column_name IN ('business_id', 'partner_id')
  ) THEN
    -- 임시 컬럼 추가
    ALTER TABLE jobs 
    ADD COLUMN IF NOT EXISTS business_user_id INTEGER,
    ADD COLUMN IF NOT EXISTS partner_user_id INTEGER;
    
    -- business_users 매칭
    UPDATE jobs j
    SET business_user_id = b.id
    FROM users u
    JOIN business_users b ON b.auth_uid = u.uid
    WHERE j.business_id = u.uid;
    
    -- partner_users 매칭
    UPDATE jobs j
    SET partner_user_id = p.id
    FROM users u
    JOIN partner_users p ON p.auth_uid = u.uid
    WHERE j.partner_id = u.uid;
    
    -- 외래키 제약 조건 추가
    ALTER TABLE jobs
    ADD CONSTRAINT fk_jobs_business_user
    FOREIGN KEY (business_user_id) 
    REFERENCES business_users(id) 
    ON DELETE CASCADE;
    
    ALTER TABLE jobs
    ADD CONSTRAINT fk_jobs_partner_user
    FOREIGN KEY (partner_user_id) 
    REFERENCES partner_users(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'jobs 테이블 업데이트 완료';
  END IF;
END $$;

-- 3. payments 테이블 확인 및 업데이트
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'payments'
  ) THEN
    -- 유사한 방식으로 payments 테이블 업데이트
    ALTER TABLE payments 
    ADD COLUMN IF NOT EXISTS business_user_id INTEGER,
    ADD COLUMN IF NOT EXISTS partner_user_id INTEGER;
    
    -- 매칭 및 업데이트 로직 추가
    RAISE NOTICE 'payments 테이블 업데이트 필요';
  END IF;
END $$;

-- 4. 테이블 구조 확인 쿼리
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'users'
ORDER BY tc.table_name;

-- 5. 모든 업데이트가 완료된 후, 기존 컬럼 삭제
-- 주의: 모든 데이터가 성공적으로 마이그레이션되었음을 확인한 후에만 실행
/*
-- spaces 테이블
ALTER TABLE spaces 
DROP COLUMN IF EXISTS owner_id;

-- jobs 테이블
ALTER TABLE jobs 
DROP COLUMN IF EXISTS business_id,
DROP COLUMN IF EXISTS partner_id;

-- 기타 테이블들도 동일하게 처리
*/

SELECT '✅ 관련 테이블 업데이트 스크립트 준비 완료!' as message;