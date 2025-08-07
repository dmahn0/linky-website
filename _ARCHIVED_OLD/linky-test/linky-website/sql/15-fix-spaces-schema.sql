-- Step 15: spaces 테이블 스키마 수정
-- 실행 시간: 2025-01-23
-- 목적: spaces 테이블에 누락된 컬럼들 추가

-- 1. 현재 spaces 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'spaces' 
ORDER BY ordinal_position;

-- 2. 누락된 컬럼들 추가
-- 2-1. area 컬럼 추가 (면적, 제곱미터)
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS area INTEGER;

-- 2-2. cleaning_frequency 컬럼 추가 (청소 주기)
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS cleaning_frequency TEXT DEFAULT 'weekly' 
CHECK (cleaning_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'custom'));

-- 2-3. notes 컬럼 추가 (특이사항)
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2-4. detail_address 컬럼 추가 (상세 주소)
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS detail_address TEXT;

-- 2-5. created_at, updated_at 컬럼 추가 (메타데이터)
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. 기존 데이터가 있다면 기본값 설정
UPDATE spaces 
SET 
    cleaning_frequency = 'weekly' 
WHERE cleaning_frequency IS NULL;

UPDATE spaces 
SET 
    created_at = NOW(),
    updated_at = NOW()
WHERE created_at IS NULL;

-- 4. 수정된 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'spaces' 
ORDER BY ordinal_position;

-- 확인 메시지
SELECT '✅ spaces 테이블 스키마 수정 완료!' as message;