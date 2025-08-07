-- Step 8: 트랜잭션 처리 함수
-- 실행 시간: 2025-08-06
-- 목적: 복잡한 비즈니스 로직을 원자적으로 처리

-- 1. 작업 생성 트랜잭션 함수
CREATE OR REPLACE FUNCTION create_job_with_notification(
    p_business_id UUID,
    p_space_id UUID,
    p_title VARCHAR(200),
    p_description TEXT,
    p_scheduled_date DATE,
    p_scheduled_time TIME,
    p_estimated_duration INTEGER,
    p_base_price DECIMAL(10,2),
    p_special_requirements TEXT[] DEFAULT NULL,
    p_job_type VARCHAR(50) DEFAULT 'cleaning'
)
RETURNS UUID AS $$
DECLARE
    v_job_id UUID;
    v_space_address TEXT;
    v_partner_count INTEGER;
BEGIN
    -- 트랜잭션 시작
    -- 1. 공간 정보 확인
    SELECT address INTO v_space_address
    FROM spaces
    WHERE id = p_space_id AND owner_id = p_business_id AND status = 'active';
    
    IF v_space_address IS NULL THEN
        RAISE EXCEPTION 'Invalid or inactive space';
    END IF;
    
    -- 2. 작업 생성
    INSERT INTO jobs (
        business_id, space_id, title, description,
        scheduled_date, scheduled_time, estimated_duration,
        base_price, special_requirements, job_type, status
    ) VALUES (
        p_business_id, p_space_id, p_title, p_description,
        p_scheduled_date, p_scheduled_time, p_estimated_duration,
        p_base_price, p_special_requirements, p_job_type, 'pending'
    ) RETURNING id INTO v_job_id;
    
    -- 3. 해당 지역의 승인된 파트너들에게 알림 전송
    INSERT INTO notifications (user_id, type, title, body, data)
    SELECT 
        p.auth_uid,
        'new_job',
        '새로운 작업이 등록되었습니다',
        p_title || ' - ' || v_space_address,
        jsonb_build_object(
            'job_id', v_job_id,
            'scheduled_date', p_scheduled_date,
            'base_price', p_base_price
        )
    FROM partner_users p
    WHERE p.status = 'approved'
    AND v_space_address ILIKE ANY(p.work_areas)
    AND EXISTS (
        SELECT 1 FROM notification_settings ns
        WHERE ns.user_id = p.auth_uid
        AND ns.push = TRUE
    );
    
    GET DIAGNOSTICS v_partner_count = ROW_COUNT;
    
    -- 4. 비즈니스 통계 업데이트
    UPDATE business_users
    SET statistics = COALESCE(statistics, '{}'::jsonb) || 
        jsonb_build_object(
            'total_jobs', COALESCE((statistics->>'total_jobs')::integer, 0) + 1,
            'pending_jobs', COALESCE((statistics->>'pending_jobs')::integer, 0) + 1
        )
    WHERE auth_uid = p_business_id;
    
    -- 5. 로그 기록 (선택사항)
    INSERT INTO job_status_history (job_id, to_status, changed_by, notes)
    VALUES (v_job_id, 'pending', p_business_id, 
            format('작업 생성됨. %s명의 파트너에게 알림 전송', v_partner_count));
    
    RETURN v_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 작업 매칭 트랜잭션 함수
CREATE OR REPLACE FUNCTION assign_job_to_partner(
    p_job_id UUID,
    p_partner_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_job_status VARCHAR(50);
    v_business_id UUID;
    v_job_title TEXT;
BEGIN
    -- 1. 작업 상태 확인 (FOR UPDATE로 잠금)
    SELECT status, business_id, title 
    INTO v_job_status, v_business_id, v_job_title
    FROM jobs
    WHERE id = p_job_id
    FOR UPDATE;
    
    IF v_job_status != 'pending' THEN
        RAISE EXCEPTION 'Job is not available for assignment';
    END IF;
    
    -- 2. 파트너 상태 확인
    IF NOT EXISTS (
        SELECT 1 FROM partner_users 
        WHERE auth_uid = p_partner_id 
        AND status = 'approved'
    ) THEN
        RAISE EXCEPTION 'Partner is not approved';
    END IF;
    
    -- 3. 작업 배정
    UPDATE jobs
    SET partner_id = p_partner_id,
        status = 'assigned',
        updated_at = NOW()
    WHERE id = p_job_id;
    
    -- 4. 다른 지원자들의 신청 거절 처리
    UPDATE job_applications
    SET status = 'rejected'
    WHERE job_id = p_job_id
    AND partner_id != p_partner_id
    AND status = 'pending';
    
    -- 5. 선택된 파트너의 신청 승인
    INSERT INTO job_applications (job_id, partner_id, status)
    VALUES (p_job_id, p_partner_id, 'accepted')
    ON CONFLICT (job_id, partner_id) 
    DO UPDATE SET status = 'accepted';
    
    -- 6. 파트너에게 알림
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
        p_partner_id,
        'job_assigned',
        '작업이 배정되었습니다',
        v_job_title,
        jsonb_build_object('job_id', p_job_id)
    );
    
    -- 7. 비즈니스 통계 업데이트
    UPDATE business_users
    SET statistics = statistics || 
        jsonb_build_object(
            'pending_jobs', GREATEST(COALESCE((statistics->>'pending_jobs')::integer, 1) - 1, 0),
            'assigned_jobs', COALESCE((statistics->>'assigned_jobs')::integer, 0) + 1
        )
    WHERE auth_uid = v_business_id;
    
    -- 8. 파트너 통계 업데이트
    UPDATE partner_users
    SET statistics = COALESCE(statistics, '{}'::jsonb) || 
        jsonb_build_object(
            'assigned_jobs', COALESCE((statistics->>'assigned_jobs')::integer, 0) + 1
        )
    WHERE auth_uid = p_partner_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 작업 완료 처리 트랜잭션
CREATE OR REPLACE FUNCTION complete_job(
    p_job_id UUID,
    p_partner_id UUID,
    p_completion_photos TEXT[],
    p_completion_notes TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_job RECORD;
    v_earnings DECIMAL(10,2);
BEGIN
    -- 1. 작업 정보 조회 및 검증
    SELECT * INTO v_job
    FROM jobs
    WHERE id = p_job_id
    AND partner_id = p_partner_id
    AND status = 'in_progress'
    FOR UPDATE;
    
    IF v_job IS NULL THEN
        RAISE EXCEPTION 'Job not found or not in progress';
    END IF;
    
    -- 2. 완료 시간 및 정보 업데이트
    UPDATE jobs
    SET status = 'completed',
        actual_end_time = NOW(),
        completion_photos = p_completion_photos,
        completion_notes = p_completion_notes,
        final_price = base_price -- 추가 비용 로직은 별도 구현
    WHERE id = p_job_id;
    
    -- 3. 파트너 수익 계산 (수수료 20% 가정)
    v_earnings := v_job.base_price * 0.8;
    
    -- 4. 파트너 수익 및 통계 업데이트
    UPDATE partner_users
    SET earnings = COALESCE(earnings, 0) + v_earnings,
        statistics = COALESCE(statistics, '{}'::jsonb) || 
        jsonb_build_object(
            'completed_jobs', COALESCE((statistics->>'completed_jobs')::integer, 0) + 1,
            'total_earnings', COALESCE((statistics->>'total_earnings')::numeric, 0) + v_earnings
        )
    WHERE auth_uid = p_partner_id;
    
    -- 5. 비즈니스 통계 업데이트
    UPDATE business_users
    SET statistics = statistics || 
        jsonb_build_object(
            'assigned_jobs', GREATEST(COALESCE((statistics->>'assigned_jobs')::integer, 1) - 1, 0),
            'completed_jobs', COALESCE((statistics->>'completed_jobs')::integer, 0) + 1
        )
    WHERE auth_uid = v_job.business_id;
    
    -- 6. 비즈니스에 알림
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
        v_job.business_id,
        'job_completed',
        '작업이 완료되었습니다',
        '완료된 작업을 확인하고 평가해주세요',
        jsonb_build_object(
            'job_id', p_job_id,
            'completion_time', NOW()
        )
    );
    
    -- 7. 자동 정산 생성 (별도 테이블 필요시)
    -- INSERT INTO settlements (...) VALUES (...);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 작업 취소 트랜잭션
CREATE OR REPLACE FUNCTION cancel_job(
    p_job_id UUID,
    p_user_id UUID,
    p_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_job RECORD;
    v_user_type VARCHAR(20);
    v_cancellation_fee DECIMAL(10,2);
BEGIN
    -- 1. 사용자 타입 확인
    v_user_type := get_user_type(p_user_id);
    
    -- 2. 작업 정보 조회
    SELECT * INTO v_job
    FROM jobs
    WHERE id = p_job_id
    AND status IN ('pending', 'assigned', 'in_progress')
    FOR UPDATE;
    
    IF v_job IS NULL THEN
        RAISE EXCEPTION 'Job cannot be cancelled';
    END IF;
    
    -- 3. 권한 확인
    IF NOT (
        (v_user_type = 'business' AND v_job.business_id = p_user_id) OR
        (v_user_type = 'partner' AND v_job.partner_id = p_user_id) OR
        EXISTS (SELECT 1 FROM admins WHERE auth_uid = p_user_id)
    ) THEN
        RAISE EXCEPTION 'Unauthorized to cancel this job';
    END IF;
    
    -- 4. 취소 수수료 계산 (24시간 이내 취소시)
    IF v_job.scheduled_date - CURRENT_DATE <= 1 THEN
        v_cancellation_fee := v_job.base_price * 0.2; -- 20% 수수료
    ELSE
        v_cancellation_fee := 0;
    END IF;
    
    -- 5. 작업 취소 처리
    UPDATE jobs
    SET status = 'cancelled',
        cancelled_at = NOW(),
        cancelled_by = v_user_type,
        cancellation_reason = p_reason
    WHERE id = p_job_id;
    
    -- 6. 관련 알림 전송
    IF v_job.partner_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, title, body, data)
        VALUES (
            CASE 
                WHEN v_user_type = 'business' THEN v_job.partner_id
                ELSE v_job.business_id
            END,
            'job_cancelled',
            '작업이 취소되었습니다',
            p_reason,
            jsonb_build_object(
                'job_id', p_job_id,
                'cancelled_by', v_user_type,
                'cancellation_fee', v_cancellation_fee
            )
        );
    END IF;
    
    -- 7. 통계 업데이트
    IF v_user_type = 'business' THEN
        UPDATE business_users
        SET statistics = statistics || 
            jsonb_build_object(
                'cancelled_jobs', COALESCE((statistics->>'cancelled_jobs')::integer, 0) + 1
            )
        WHERE auth_uid = p_user_id;
    ELSE
        UPDATE partner_users
        SET statistics = statistics || 
            jsonb_build_object(
                'cancelled_jobs', COALESCE((statistics->>'cancelled_jobs')::integer, 0) + 1
            )
        WHERE auth_uid = p_user_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 대량 알림 전송 함수
CREATE OR REPLACE FUNCTION send_bulk_notifications(
    p_user_ids UUID[],
    p_type VARCHAR(50),
    p_title TEXT,
    p_body TEXT,
    p_data JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    INSERT INTO notifications (user_id, type, title, body, data)
    SELECT unnest(p_user_ids), p_type, p_title, p_body, p_data;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 확인 메시지
SELECT '✅ 트랜잭션 함수 생성 완료!' as message;