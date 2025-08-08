-- Linky Platform 더미 데이터
-- 실행일: 2025-01-23
-- 용도: 테스트 환경 구축용 샘플 데이터

-- ============================================
-- 1. 테스트 사용자 생성 (Supabase Auth)
-- ============================================
-- 주의: 이 부분은 Supabase 대시보드에서 직접 생성하거나
-- Supabase Auth API를 통해 생성해야 합니다.
-- 
-- Business 사용자:
-- Email: test.business@linky.com
-- Password: test1234
-- 
-- Partner 사용자:
-- Email: test.partner@linky.com
-- Password: test1234

-- ============================================
-- 2. Business Users 프로필
-- ============================================
INSERT INTO business_users (
    id,
    auth_uid,
    email,
    phone,
    nickname,
    status,
    business_name,
    business_number,
    business_type,
    business_address,
    representative_name,
    bank_name,
    account_number,
    account_holder,
    monthly_usage,
    total_spent,
    space_count,
    created_at,
    approved_at
) VALUES
(
    gen_random_uuid(),
    'BUSINESS_AUTH_UID_HERE', -- Supabase Auth에서 생성된 실제 UUID로 교체
    'test.business@linky.com',
    '010-1234-5678',
    'testbiz',
    'approved',
    '테스트 카페',
    '123-45-67890',
    'office',
    '서울시 강남구 테헤란로 123',
    '김사장',
    '국민은행',
    '123456-78-901234',
    '김사장',
    5,
    250000,
    2,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '29 days'
),
(
    gen_random_uuid(),
    'BUSINESS2_AUTH_UID_HERE',
    'test.business2@linky.com',
    '010-2345-6789',
    'cafebiz',
    'approved',
    '스타트업 오피스',
    '234-56-78901',
    'office',
    '서울시 서초구 서초대로 456',
    '이대표',
    '신한은행',
    '234567-89-012345',
    '이대표',
    8,
    480000,
    3,
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '59 days'
);

-- ============================================
-- 3. Partner Users 프로필
-- ============================================
INSERT INTO partner_users (
    id,
    auth_uid,
    email,
    phone,
    nickname,
    status,
    name,
    residence,
    work_areas,
    transportation,
    available_times,
    bank_name,
    account_number,
    account_holder,
    rating,
    completed_jobs,
    cancelled_jobs,
    total_earnings,
    this_month_earnings,
    level,
    created_at,
    approved_at,
    last_active_at
) VALUES
(
    gen_random_uuid(),
    'PARTNER_AUTH_UID_HERE', -- Supabase Auth에서 생성된 실제 UUID로 교체
    'test.partner@linky.com',
    '010-9876-5432',
    'cleanpro',
    'approved',
    '김파트너',
    '서울시 강남구',
    ARRAY['강남구', '서초구', '송파구'],
    'public',
    '{"weekday": ["09:00-18:00"], "weekend": ["10:00-16:00"]}'::jsonb,
    '우리은행',
    '987654-32-109876',
    '김파트너',
    4.5,
    25,
    1,
    1250000,
    250000,
    'silver',
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '89 days',
    NOW() - INTERVAL '1 hour'
),
(
    gen_random_uuid(),
    'PARTNER2_AUTH_UID_HERE',
    'test.partner2@linky.com',
    '010-8765-4321',
    'speedclean',
    'approved',
    '박파트너',
    '서울시 서초구',
    ARRAY['서초구', '강남구', '용산구'],
    'car',
    '{"weekday": ["08:00-20:00"], "weekend": ["09:00-18:00"]}'::jsonb,
    '하나은행',
    '876543-21-098765',
    '박파트너',
    4.8,
    42,
    0,
    2100000,
    420000,
    'gold',
    NOW() - INTERVAL '120 days',
    NOW() - INTERVAL '119 days',
    NOW() - INTERVAL '2 hours'
);

-- ============================================
-- 4. Spaces (공간 정보)
-- ============================================
INSERT INTO spaces (
    id,
    name,
    type,
    area,
    address,
    detail_address,
    cleaning_frequency,
    notes,
    owner_id,
    created_at
) VALUES
(
    gen_random_uuid(),
    '1층 매장',
    'store',
    50,
    '서울시 강남구 테헤란로 123',
    '테스트빌딩 1층',
    'weekly',
    '입구 유리문 청소 주의',
    'BUSINESS_AUTH_UID_HERE',
    NOW() - INTERVAL '20 days'
),
(
    gen_random_uuid(),
    '2층 사무실',
    'office',
    30,
    '서울시 강남구 테헤란로 123',
    '테스트빌딩 2층',
    'biweekly',
    '회의실 집중 청소 필요',
    'BUSINESS_AUTH_UID_HERE',
    NOW() - INTERVAL '20 days'
),
(
    gen_random_uuid(),
    '메인 오피스',
    'office',
    100,
    '서울시 서초구 서초대로 456',
    '스타트업타워 5층',
    'daily',
    '매일 오전 7시 이전 청소',
    'BUSINESS2_AUTH_UID_HERE',
    NOW() - INTERVAL '50 days'
);

-- ============================================
-- 5. Jobs (작업 정보)
-- ============================================
INSERT INTO jobs (
    id,
    business_id,
    partner_id,
    space_id,
    title,
    description,
    job_type,
    scheduled_date,
    scheduled_time,
    estimated_duration,
    status,
    base_price,
    currency,
    special_requirements,
    created_at
) VALUES
(
    gen_random_uuid(),
    'BUSINESS_AUTH_UID_HERE',
    NULL,
    (SELECT id FROM spaces WHERE name = '1층 매장' LIMIT 1),
    '정기 청소 - 1층 매장',
    '매장 전체 청소 및 유리창 청소',
    'cleaning',
    CURRENT_DATE + INTERVAL '2 days',
    '09:00:00',
    120,
    'pending',
    50000,
    'KRW',
    ARRAY['유리창 청소', '바닥 왁싱'],
    NOW()
),
(
    gen_random_uuid(),
    'BUSINESS_AUTH_UID_HERE',
    'PARTNER_AUTH_UID_HERE',
    (SELECT id FROM spaces WHERE name = '2층 사무실' LIMIT 1),
    '주간 청소 - 사무실',
    '사무실 전체 청소 및 쓰레기 처리',
    'cleaning',
    CURRENT_DATE + INTERVAL '1 day',
    '18:00:00',
    90,
    'assigned',
    35000,
    'KRW',
    ARRAY['쓰레기 분리수거', '화장실 청소'],
    NOW() - INTERVAL '2 days'
),
(
    gen_random_uuid(),
    'BUSINESS2_AUTH_UID_HERE',
    'PARTNER2_AUTH_UID_HERE',
    (SELECT id FROM spaces WHERE name = '메인 오피스' LIMIT 1),
    '일일 청소 - 오피스',
    '오피스 일일 청소',
    'cleaning',
    CURRENT_DATE,
    '07:00:00',
    60,
    'in_progress',
    30000,
    'KRW',
    ARRAY['조용히 작업'],
    NOW() - INTERVAL '1 day'
),
(
    gen_random_uuid(),
    'BUSINESS_AUTH_UID_HERE',
    'PARTNER_AUTH_UID_HERE',
    (SELECT id FROM spaces WHERE name = '1층 매장' LIMIT 1),
    '특별 청소 - 대청소',
    '월말 대청소',
    'cleaning',
    CURRENT_DATE - INTERVAL '5 days',
    '10:00:00',
    180,
    'completed',
    75000,
    'KRW',
    ARRAY['전체 대청소', '왁싱', '유리창'],
    NOW() - INTERVAL '10 days'
);

-- ============================================
-- 6. Job Applications (작업 지원)
-- ============================================
INSERT INTO job_applications (
    id,
    job_id,
    partner_id,
    applied_at,
    message,
    status
) VALUES
(
    gen_random_uuid(),
    (SELECT id FROM jobs WHERE status = 'pending' LIMIT 1),
    'PARTNER2_AUTH_UID_HERE',
    NOW() - INTERVAL '1 hour',
    '깨끗하게 청소하겠습니다!',
    'pending'
);

-- ============================================
-- 7. Ratings (평가)
-- ============================================
INSERT INTO ratings (
    id,
    job_id,
    reviewer_id,
    reviewer_type,
    reviewee_id,
    reviewee_type,
    overall_rating,
    punctuality_rating,
    quality_rating,
    communication_rating,
    review_text,
    is_anonymous,
    would_recommend,
    would_work_again,
    positive_tags,
    is_verified,
    created_at
) VALUES
(
    gen_random_uuid(),
    (SELECT id FROM jobs WHERE status = 'completed' LIMIT 1),
    'BUSINESS_AUTH_UID_HERE',
    'business',
    'PARTNER_AUTH_UID_HERE',
    'partner',
    5,
    5,
    5,
    4,
    '매우 깨끗하게 청소해주셨습니다. 감사합니다!',
    false,
    true,
    true,
    ARRAY['친절함', '꼼꼼함', '시간엄수'],
    true,
    NOW() - INTERVAL '4 days'
);

-- ============================================
-- 8. Notification Settings
-- ============================================
INSERT INTO notification_settings (
    user_id,
    user_type,
    email,
    sms,
    push,
    marketing,
    created_at
) VALUES
(
    'BUSINESS_AUTH_UID_HERE',
    'business',
    true,
    true,
    true,
    false,
    NOW() - INTERVAL '30 days'
),
(
    'PARTNER_AUTH_UID_HERE',
    'partner',
    true,
    true,
    true,
    true,
    NOW() - INTERVAL '90 days'
);

-- ============================================
-- 9. Nicknames 테이블 동기화
-- ============================================
INSERT INTO nicknames (nickname, user_id, user_type, created_at)
SELECT nickname, id, 'business', created_at 
FROM business_users 
WHERE nickname IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO nicknames (nickname, user_id, user_type, created_at)
SELECT nickname, id, 'partner', created_at 
FROM partner_users 
WHERE nickname IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================
-- 완료 메시지
-- ============================================
SELECT '✅ 더미 데이터 생성 완료!' as message;

-- 주의사항:
-- 1. BUSINESS_AUTH_UID_HERE, PARTNER_AUTH_UID_HERE 등은 
--    실제 Supabase Auth에서 생성된 UUID로 교체해야 합니다.
-- 2. 먼저 Supabase 대시보드에서 테스트 사용자를 생성하고,
--    해당 auth.uid 값을 확인하여 교체하세요.
-- 3. 또는 아래 JavaScript 코드를 사용하여 프로그래밍 방식으로 생성할 수 있습니다.