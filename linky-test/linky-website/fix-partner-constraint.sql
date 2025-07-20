-- 현재 제약 조건 확인
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
AND conname = 'valid_partner_data';

-- 제약 조건 삭제 (필요한 경우)
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_partner_data;

-- 새로운 제약 조건 추가 (필수 필드만 체크하도록 수정)
-- ALTER TABLE users ADD CONSTRAINT valid_partner_data CHECK (
--     (type != 'partner') OR 
--     (type = 'partner' AND realName IS NOT NULL AND residence IS NOT NULL)
-- );

-- 또는 제약 조건을 더 유연하게 수정
-- ALTER TABLE users ADD CONSTRAINT valid_partner_data CHECK (
--     (type != 'partner') OR 
--     (type = 'partner')  -- 파트너도 추가 필드 없이 가능하도록
-- );