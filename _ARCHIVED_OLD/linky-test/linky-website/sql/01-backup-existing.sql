-- Step 1: 기존 users 테이블 백업
-- 실행 시간: 2025-01-22

-- 백업 테이블 생성 (타임스탬프 포함)
CREATE TABLE users_backup_20250122 AS 
SELECT * FROM users;

-- 백업 확인
SELECT COUNT(*) as total_users,
       COUNT(CASE WHEN type = 'business' THEN 1 END) as business_users,
       COUNT(CASE WHEN type = 'partner' THEN 1 END) as partner_users
FROM users_backup_20250122;

-- 백업 성공 메시지
SELECT '✅ 백업 완료! users_backup_20250122 테이블에 ' || COUNT(*) || '명의 사용자 데이터가 저장되었습니다.' as message
FROM users_backup_20250122;