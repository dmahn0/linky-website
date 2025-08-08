-- ============================================
-- Test Data for Linky Platform
-- Version: 1.0.0
-- Date: 2025-01-08
-- ============================================
-- NOTE: Run this only in development/test environment
-- ============================================

-- First, you need to create test users in Supabase Auth
-- Go to Supabase Dashboard > Authentication > Users
-- Create these test users manually or use this guide:
/*
Test Users to create in Supabase Auth:
1. business1@test.com / Test1234!
2. business2@test.com / Test1234!
3. partner1@test.com / Test1234!
4. partner2@test.com / Test1234!
5. partner3@test.com / Test1234!

After creating users, get their auth UIDs from the dashboard
and replace the placeholder UUIDs below.
*/

-- ============================================
-- IMPORTANT: Replace these with actual auth UIDs
-- ============================================
-- Example: 
-- business1_auth_uid = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
-- Get these from Supabase Dashboard > Authentication > Users

DO $$
DECLARE
    -- Replace these with actual auth UIDs after creating users
    business1_auth_uid UUID := 'REPLACE_WITH_ACTUAL_UUID_1';
    business2_auth_uid UUID := 'REPLACE_WITH_ACTUAL_UUID_2';
    partner1_auth_uid UUID := 'REPLACE_WITH_ACTUAL_UUID_3';
    partner2_auth_uid UUID := 'REPLACE_WITH_ACTUAL_UUID_4';
    partner3_auth_uid UUID := 'REPLACE_WITH_ACTUAL_UUID_5';
    
    -- Variables to store created IDs
    business1_id BIGINT;
    business2_id BIGINT;
    partner1_id BIGINT;
    partner2_id BIGINT;
    partner3_id BIGINT;
    space1_id BIGINT;
    space2_id BIGINT;
    space3_id BIGINT;
    job1_id BIGINT;
    job2_id BIGINT;
    job3_id BIGINT;
BEGIN
    -- ============================================
    -- 1. Insert Business Users
    -- ============================================
    INSERT INTO business_users (
        auth_uid, email, business_name, business_type, 
        owner_name, phone, space_type, space_count,
        address, marketing_agreed, terms_agreed_at
    ) VALUES (
        business1_auth_uid, 
        'business1@test.com', 
        '클린오피스 강남점', 
        'office',
        '김사장', 
        '010-1111-2222', 
        '사무실', 
        3,
        '서울시 강남구 테헤란로 123',
        true,
        NOW()
    ) RETURNING id INTO business1_id;

    INSERT INTO business_users (
        auth_uid, email, business_name, business_type,
        owner_name, phone, space_type, space_count,
        address, marketing_agreed, terms_agreed_at
    ) VALUES (
        business2_auth_uid,
        'business2@test.com',
        '스터디카페 서초',
        'study_cafe',
        '이대표',
        '010-3333-4444',
        '스터디룸',
        5,
        '서울시 서초구 강남대로 456',
        false,
        NOW()
    ) RETURNING id INTO business2_id;

    -- ============================================
    -- 2. Insert Partner Users
    -- ============================================
    INSERT INTO partners_users (
        auth_uid, email, name, nickname, phone,
        birth_date, gender, preferred_work_types, preferred_areas,
        experience_level, introduction, rating, completed_jobs,
        marketing_agreed, terms_agreed_at, is_verified
    ) VALUES (
        partner1_auth_uid,
        'partner1@test.com',
        '박청소',
        '깔끔한청소',
        '010-5555-6666',
        '1990-05-15',
        '남성',
        ARRAY['daily_cleaning', 'deep_cleaning'],
        ARRAY['강남구', '서초구'],
        'expert',
        '10년 경력의 전문 청소 파트너입니다.',
        4.8,
        150,
        true,
        NOW(),
        true
    ) RETURNING id INTO partner1_id;

    INSERT INTO partners_users (
        auth_uid, email, name, nickname, phone,
        birth_date, gender, preferred_work_types, preferred_areas,
        experience_level, introduction, rating, completed_jobs,
        marketing_agreed, terms_agreed_at, is_verified
    ) VALUES (
        partner2_auth_uid,
        'partner2@test.com',
        '김정리',
        '정리의달인',
        '010-7777-8888',
        '1985-08-20',
        '여성',
        ARRAY['maintenance', 'organizing'],
        ARRAY['강남구', '송파구', '강동구'],
        'intermediate',
        '정리정돈 전문가입니다. 깔끔하게 정리해드립니다.',
        4.5,
        80,
        true,
        NOW(),
        true
    ) RETURNING id INTO partner2_id;

    INSERT INTO partners_users (
        auth_uid, email, name, nickname, phone,
        birth_date, gender, preferred_work_types, preferred_areas,
        experience_level, introduction, rating, completed_jobs,
        marketing_agreed, terms_agreed_at, is_verified
    ) VALUES (
        partner3_auth_uid,
        'partner3@test.com',
        '이소독',
        '안심클린',
        '010-9999-0000',
        '1995-03-10',
        '남성',
        ARRAY['sanitization', 'deep_cleaning'],
        ARRAY['마포구', '영등포구'],
        'beginner',
        '열심히 하는 신입 파트너입니다.',
        4.2,
        20,
        false,
        NOW(),
        false
    ) RETURNING id INTO partner3_id;

    -- ============================================
    -- 3. Insert Spaces
    -- ============================================
    INSERT INTO spaces (
        business_id, name, space_type, address, address_detail,
        area, size_sqm, floor_number, has_elevator, has_parking,
        special_notes, status
    ) VALUES (
        business1_id,
        '본사 사무실',
        '사무실',
        '서울시 강남구 테헤란로 123',
        '5층 501호',
        '강남구',
        150.5,
        5,
        true,
        true,
        '주차는 지하 2층에 가능합니다. 비밀번호는 1234입니다.',
        'active'
    ) RETURNING id INTO space1_id;

    INSERT INTO spaces (
        business_id, name, space_type, address, address_detail,
        area, size_sqm, floor_number, has_elevator, has_parking,
        special_notes, status
    ) VALUES (
        business1_id,
        '회의실 A',
        '회의실',
        '서울시 강남구 테헤란로 123',
        '5층 502호',
        '강남구',
        30.0,
        5,
        true,
        true,
        '프로젝터와 화이트보드가 있습니다.',
        'active'
    ) RETURNING id INTO space2_id;

    INSERT INTO spaces (
        business_id, name, space_type, address, address_detail,
        area, size_sqm, floor_number, has_elevator, has_parking,
        status
    ) VALUES (
        business2_id,
        '프리미엄 스터디룸',
        '스터디룸',
        '서울시 서초구 강남대로 456',
        '3층',
        '서초구',
        200.0,
        3,
        true,
        false,
        'active'
    ) RETURNING id INTO space3_id;

    -- ============================================
    -- 4. Insert Jobs
    -- ============================================
    -- Pending job (available for application)
    INSERT INTO jobs (
        business_id, space_id, title, description, job_type,
        status, priority, scheduled_date, scheduled_time,
        estimated_duration, base_price, special_requirements
    ) VALUES (
        business1_id,
        space1_id,
        '사무실 일일 청소',
        '매일 저녁 사무실 청소가 필요합니다. 쓰레기 비우기, 바닥 청소, 책상 정리 포함.',
        'daily_cleaning',
        'pending',
        'normal',
        CURRENT_DATE + INTERVAL '1 day',
        '18:00:00',
        120,
        50000,
        '청소 도구는 사무실에 비치되어 있습니다.'
    ) RETURNING id INTO job1_id;

    -- Assigned job
    INSERT INTO jobs (
        business_id, space_id, partner_id, title, description,
        job_type, status, priority, scheduled_date, scheduled_time,
        estimated_duration, base_price
    ) VALUES (
        business1_id,
        space2_id,
        partner1_id,
        '회의실 딥클리닝',
        '회의실 카펫 청소와 의자 세척이 필요합니다.',
        'deep_cleaning',
        'assigned',
        'high',
        CURRENT_DATE + INTERVAL '2 days',
        '10:00:00',
        180,
        80000
    ) RETURNING id INTO job2_id;

    -- In progress job
    INSERT INTO jobs (
        business_id, space_id, partner_id, title, description,
        job_type, status, scheduled_date, scheduled_time,
        estimated_duration, base_price, actual_start_time
    ) VALUES (
        business2_id,
        space3_id,
        partner2_id,
        '스터디룸 정리정돈',
        '책상 재배치와 책장 정리가 필요합니다.',
        'maintenance',
        'in_progress',
        CURRENT_DATE,
        '14:00:00',
        90,
        40000,
        NOW()
    ) RETURNING id INTO job3_id;

    -- Completed job
    INSERT INTO jobs (
        business_id, space_id, partner_id, title, description,
        job_type, status, scheduled_date, scheduled_time,
        estimated_duration, base_price, final_price,
        actual_start_time, actual_end_time, actual_duration,
        completion_notes, completed_at
    ) VALUES (
        business1_id,
        space1_id,
        partner1_id,
        '사무실 월간 대청소',
        '월간 대청소 완료',
        'deep_cleaning',
        'completed',
        CURRENT_DATE - INTERVAL '7 days',
        '09:00:00',
        240,
        120000,
        120000,
        CURRENT_DATE - INTERVAL '7 days' + TIME '09:00:00',
        CURRENT_DATE - INTERVAL '7 days' + TIME '13:00:00',
        240,
        '모든 구역 청소 완료. 카펫 세척 완료.',
        CURRENT_DATE - INTERVAL '7 days' + TIME '13:00:00'
    );

    -- ============================================
    -- 5. Insert Job Applications
    -- ============================================
    INSERT INTO job_applications (
        job_id, partner_id, status, message, applied_at
    ) VALUES (
        job1_id,
        partner2_id,
        'pending',
        '깔끔하게 청소하겠습니다!',
        NOW() - INTERVAL '2 hours'
    );

    INSERT INTO job_applications (
        job_id, partner_id, status, message, applied_at
    ) VALUES (
        job1_id,
        partner3_id,
        'pending',
        '열심히 하겠습니다. 청소 경험 많습니다.',
        NOW() - INTERVAL '1 hour'
    );

    -- ============================================
    -- 6. Insert Reviews (for completed job)
    -- ============================================
    INSERT INTO reviews (
        job_id, reviewer_type, reviewer_id, reviewee_type, reviewee_id,
        rating, comment, is_public
    ) VALUES (
        job3_id,
        'business',
        business1_id,
        'partner',
        partner1_id,
        5,
        '매우 깔끔하게 청소해주셨습니다. 다음에도 부탁드리고 싶어요!',
        true
    );

    INSERT INTO reviews (
        job_id, reviewer_type, reviewer_id, reviewee_type, reviewee_id,
        rating, comment, is_public
    ) VALUES (
        job3_id,
        'partner',
        partner1_id,
        'business',
        business1_id,
        4,
        '좋은 환경에서 일할 수 있었습니다.',
        true
    );

    -- ============================================
    -- 7. Update Partner Statistics
    -- ============================================
    UPDATE partners_users 
    SET 
        this_month_earnings = 120000,
        total_earnings = 1500000
    WHERE id = partner1_id;

    UPDATE partners_users 
    SET 
        this_month_earnings = 40000,
        total_earnings = 500000
    WHERE id = partner2_id;

    RAISE NOTICE 'Test data inserted successfully!';
    RAISE NOTICE 'Business User IDs: %, %', business1_id, business2_id;
    RAISE NOTICE 'Partner User IDs: %, %, %', partner1_id, partner2_id, partner3_id;
    RAISE NOTICE 'Space IDs: %, %, %', space1_id, space2_id, space3_id;
    RAISE NOTICE 'Job IDs: %, %, %', job1_id, job2_id, job3_id;
END $$;