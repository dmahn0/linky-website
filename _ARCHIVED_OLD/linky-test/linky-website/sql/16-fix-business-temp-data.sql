-- Step 16: 비즈니스 사용자 임시 데이터 수정 가이드
-- 실행 시간: 2025-01-22
-- 목적: 마이그레이션 시 생성된 임시 데이터를 실제 데이터로 업데이트

-- 1. 현재 비즈니스 사용자 목록 확인
SELECT 
    id,
    auth_uid,
    email,
    business_name,
    business_number,
    business_type,
    business_address,
    representative_name
FROM business_users
ORDER BY created_at;

-- 2. 임시 데이터를 가진 사용자들 확인
SELECT 
    id,
    email,
    business_name,
    '임시 데이터 항목:' as status,
    CASE WHEN business_number = '000-00-00000' THEN '사업자번호, ' ELSE '' END ||
    CASE WHEN business_type = 'other' THEN '사업체 타입, ' ELSE '' END ||
    CASE WHEN business_address = '주소 미입력' THEN '주소' ELSE '' END as temp_fields
FROM business_users
WHERE business_number = '000-00-00000' 
   OR business_type = 'other'
   OR business_address = '주소 미입력';

-- 3. 수동 업데이트 예시 (실제 데이터로 변경 필요)
/*
-- testuser1120@gmail.com 사용자 업데이트 예시
UPDATE business_users
SET 
    business_number = '123-45-67890',  -- 실제 사업자번호
    business_type = 'studyroom',       -- studyroom, partyroom, unmanned, office, other 중 선택
    business_address = '서울시 강남구 테헤란로 123',  -- 실제 주소
    representative_name = '홍길동'      -- 실제 대표자명
WHERE email = 'testuser1120@gmail.com';

-- test1234@test1234.com 사용자 업데이트 예시
UPDATE business_users
SET 
    business_number = '987-65-43210',
    business_type = 'office',
    business_address = '서울시 서초구 서초대로 456',
    representative_name = '김철수'
WHERE email = 'test1234@test1234.com';
*/

-- 4. 업데이트 후 확인
SELECT 
    '업데이트 필요 항목' as info,
    '1. 각 비즈니스 사용자에게 연락하여 실제 정보 수집' as step1,
    '2. 대시보드 로그인 시 정보 업데이트 유도' as step2,
    '3. 일정 기간 후 미입력자 서비스 제한 고려' as step3;

-- 5. 프로필 업데이트 페이지 필요 항목
SELECT 
    '프로필 업데이트 폼 필수 필드' as category,
    'business_name: 사업체명' as field1,
    'business_number: 사업자등록번호 (형식: 000-00-00000)' as field2,
    'business_type: 사업체 유형 (studyroom/partyroom/unmanned/office/other)' as field3,
    'business_address: 사업장 주소' as field4,
    'representative_name: 대표자명' as field5;

-- 6. 사업자번호 형식 검증 함수 (참고용)
/*
CREATE OR REPLACE FUNCTION validate_business_number(number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- 000-00-00000 형식 확인
    RETURN number ~ '^\d{3}-\d{2}-\d{5}$';
END;
$$ LANGUAGE plpgsql;
*/

SELECT '⚠️ 비즈니스 사용자 정보 업데이트가 필요합니다!' as message;