-- Step 6: 기존 users 테이블 데이터 마이그레이션
-- 실행 시간: 2025-01-22
-- 주의: 이 스크립트는 한 번만 실행하세요!

-- 1. 기존 users 테이블의 데이터 확인
SELECT 
  type, 
  COUNT(*) as count,
  ARRAY_AGG(DISTINCT status) as statuses
FROM users 
GROUP BY type;

-- 2. 비즈니스 사용자 마이그레이션
INSERT INTO business_users (
  auth_uid,
  email,
  phone,
  business_name,
  business_number,
  business_type,
  business_address,
  representative_name,
  status,
  created_at,
  updated_at
)
SELECT 
  uid as auth_uid,
  email,
  COALESCE(phone, ''),
  COALESCE(businessName, name, '미입력') as business_name,
  COALESCE(businessNumber, '000-00-00000') as business_number,
  COALESCE(businessType, 'other') as business_type,
  COALESCE(businessAddress, '미입력') as business_address,
  COALESCE(businessName, name, '미입력') as representative_name,
  COALESCE(status, 'approved') as status,
  COALESCE(created_at, NOW()) as created_at,
  COALESCE(updated_at, NOW()) as updated_at
FROM users
WHERE type = 'business'
AND NOT EXISTS (
  SELECT 1 FROM business_users 
  WHERE business_users.auth_uid = users.uid
);

-- 3. 파트너 사용자 마이그레이션
INSERT INTO partner_users (
  auth_uid,
  email,
  phone,
  name,
  residence,
  work_areas,
  transportation,
  available_times,
  status,
  rating,
  completed_jobs,
  cancelled_jobs,
  total_earnings,
  this_month_earnings,
  level,
  created_at,
  updated_at
)
SELECT 
  uid as auth_uid,
  email,
  COALESCE(phone, ''),
  COALESCE(name, '미입력') as name,
  COALESCE(residence, '미입력') as residence,
  COALESCE(workAreas, ARRAY['미지정']::text[]) as work_areas,
  transportation,
  CASE 
    WHEN availableTimes IS NOT NULL THEN availableTimes::jsonb
    ELSE '{"weekday": [], "weekend": []}'::jsonb
  END as available_times,
  COALESCE(status, 'approved') as status,
  COALESCE(rating, 0.0) as rating,
  COALESCE(completedJobs, 0) as completed_jobs,
  COALESCE(cancelledJobs, 0) as cancelled_jobs,
  COALESCE(totalEarnings, 0) as total_earnings,
  COALESCE(thisMonthEarnings, 0) as this_month_earnings,
  COALESCE(level, 'bronze') as level,
  COALESCE(created_at, NOW()) as created_at,
  COALESCE(updated_at, NOW()) as updated_at
FROM users
WHERE type = 'partner'
AND NOT EXISTS (
  SELECT 1 FROM partner_users 
  WHERE partner_users.auth_uid = users.uid
);

-- 4. 마이그레이션 결과 확인
SELECT 'Business Users' as table_name, COUNT(*) as count FROM business_users
UNION ALL
SELECT 'Partner Users' as table_name, COUNT(*) as count FROM partner_users
UNION ALL
SELECT 'Original Users (business)' as table_name, COUNT(*) as count FROM users WHERE type = 'business'
UNION ALL
SELECT 'Original Users (partner)' as table_name, COUNT(*) as count FROM users WHERE type = 'partner';

-- 5. 마이그레이션 검증 - 누락된 사용자 확인
SELECT 
  u.uid,
  u.email,
  u.type,
  u.name,
  'Not migrated' as status
FROM users u
WHERE u.type IN ('business', 'partner')
AND NOT EXISTS (
  SELECT 1 FROM business_users b WHERE b.auth_uid = u.uid
)
AND NOT EXISTS (
  SELECT 1 FROM partner_users p WHERE p.auth_uid = u.uid
);

-- 6. 성공적으로 마이그레이션된 경우, 기존 users 테이블 백업 후 삭제
-- 주의: 마이그레이션이 완료되었음을 확인한 후에만 실행하세요!
/*
-- 백업 테이블 생성 (이미 있으면 스킵)
CREATE TABLE IF NOT EXISTS users_backup_final AS 
SELECT * FROM users;

-- 기존 users 테이블 삭제
DROP TABLE IF EXISTS users CASCADE;

-- 확인 메시지
SELECT '✅ users 테이블 삭제 완료!' as message;
*/