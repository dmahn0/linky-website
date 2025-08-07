-- sequence 오류 수정 (UUID는 sequence 불필요)

-- 1. 잘못된 권한 부여 제거
REVOKE USAGE, SELECT ON SEQUENCE admins_id_seq FROM authenticated;

-- 2. 올바른 권한 부여 (테이블만)
GRANT SELECT, INSERT, UPDATE, DELETE ON admins TO authenticated;

-- 3. 테스트 확인
SELECT 'sequence 오류 수정 완료' as status;
SELECT COUNT(*) as admin_count FROM admins;