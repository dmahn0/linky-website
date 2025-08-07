-- =====================================================
-- Linky Platform RLS (Row Level Security) 정책
-- 버전: 1.0.0
-- 생성일: 2025-01-07
-- 설명: 사용자 타입별 데이터 접근 권한 설정
-- =====================================================

-- RLS 활성화
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1. 사용자 테이블 RLS 정책
-- =====================================================

-- 1.1 Business Users 정책
CREATE POLICY "business_users_own_data" ON business_users
    FOR ALL USING (auth.uid() = auth_uid);

-- 관리자는 모든 비즈니스 사용자 데이터 접근 가능
CREATE POLICY "admin_access_business_users" ON business_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE auth_uid = auth.uid() AND status = 'active'
        )
    );

-- 1.2 Partners Users 정책
CREATE POLICY "partners_users_own_data" ON partners_users
    FOR ALL USING (auth.uid() = auth_uid);

-- 관리자는 모든 파트너 사용자 데이터 접근 가능
CREATE POLICY "admin_access_partners_users" ON partners_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE auth_uid = auth.uid() AND status = 'active'
        )
    );

-- 비즈니스는 작업 관련 파트너 정보 조회 가능 (제한적)
CREATE POLICY "business_view_assigned_partners" ON partners_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM jobs j
            JOIN business_users bu ON j.business_id = bu.id
            WHERE bu.auth_uid = auth.uid()
            AND j.assigned_partner_id = partners_users.id
        )
    );

-- 1.3 Admin Users 정책
CREATE POLICY "admin_users_own_data" ON admin_users
    FOR ALL USING (auth.uid() = auth_uid);

-- 슈퍼 관리자는 다른 관리자 데이터 접근 가능
CREATE POLICY "super_admin_access_admins" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE auth_uid = auth.uid() AND role = 'super_admin' AND status = 'active'
        )
    );

-- =====================================================
-- 2. 공간 테이블 RLS 정책
-- =====================================================

-- 비즈니스는 자신의 공간만 접근
CREATE POLICY "business_own_spaces" ON spaces
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM business_users bu
            WHERE bu.id = spaces.business_id AND bu.auth_uid = auth.uid()
        )
    );

-- 파트너는 자신이 작업하는 공간 조회 가능 (제한적)
CREATE POLICY "partner_view_assigned_spaces" ON spaces
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM jobs j
            JOIN partners_users pu ON j.assigned_partner_id = pu.id
            WHERE pu.auth_uid = auth.uid() AND j.space_id = spaces.id
        )
    );

-- 관리자는 모든 공간 접근 가능
CREATE POLICY "admin_access_spaces" ON spaces
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE auth_uid = auth.uid() AND status = 'active'
        )
    );

-- =====================================================
-- 3. 작업 테이블 RLS 정책
-- =====================================================

-- 비즈니스는 자신의 작업만 접근
CREATE POLICY "business_own_jobs" ON jobs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM business_users bu
            WHERE bu.id = jobs.business_id AND bu.auth_uid = auth.uid()
        )
    );

-- 파트너는 자신이 지원했거나 할당받은 작업 접근
CREATE POLICY "partner_assigned_jobs" ON jobs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM partners_users pu
            WHERE pu.auth_uid = auth.uid()
            AND (
                jobs.assigned_partner_id = pu.id
                OR EXISTS (
                    SELECT 1 FROM job_applications ja
                    WHERE ja.job_id = jobs.id AND ja.partner_id = pu.id
                )
            )
        )
    );

-- 파트너는 미할당 작업 조회 가능 (지원 목적)
CREATE POLICY "partner_view_available_jobs" ON jobs
    FOR SELECT USING (
        jobs.status IN ('pending') 
        AND jobs.assigned_partner_id IS NULL
        AND EXISTS (
            SELECT 1 FROM partners_users pu
            WHERE pu.auth_uid = auth.uid() AND pu.availability_status = 'available'
        )
    );

-- 관리자는 모든 작업 접근 가능
CREATE POLICY "admin_access_jobs" ON jobs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE auth_uid = auth.uid() AND status = 'active'
        )
    );

-- =====================================================
-- 4. 작업 지원 테이블 RLS 정책
-- =====================================================

-- 파트너는 자신의 지원만 접근
CREATE POLICY "partner_own_applications" ON job_applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM partners_users pu
            WHERE pu.id = job_applications.partner_id AND pu.auth_uid = auth.uid()
        )
    );

-- 비즈니스는 자신의 작업에 대한 지원 조회 가능
CREATE POLICY "business_view_job_applications" ON job_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM jobs j
            JOIN business_users bu ON j.business_id = bu.id
            WHERE bu.auth_uid = auth.uid() AND j.id = job_applications.job_id
        )
    );

-- 비즈니스는 지원을 승인/거절 가능 (UPDATE만)
CREATE POLICY "business_update_job_applications" ON job_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM jobs j
            JOIN business_users bu ON j.business_id = bu.id
            WHERE bu.auth_uid = auth.uid() AND j.id = job_applications.job_id
        )
    );

-- 관리자는 모든 지원 접근 가능
CREATE POLICY "admin_access_job_applications" ON job_applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE auth_uid = auth.uid() AND status = 'active'
        )
    );

-- =====================================================
-- 5. 작업 상태 히스토리 RLS 정책
-- =====================================================

-- 관련 작업에 접근 권한이 있는 사용자만 히스토리 조회 가능
CREATE POLICY "job_history_access" ON job_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM jobs j
            WHERE j.id = job_status_history.job_id
            AND (
                -- 비즈니스 사용자
                EXISTS (
                    SELECT 1 FROM business_users bu
                    WHERE bu.id = j.business_id AND bu.auth_uid = auth.uid()
                )
                -- 할당된 파트너
                OR EXISTS (
                    SELECT 1 FROM partners_users pu
                    WHERE pu.id = j.assigned_partner_id AND pu.auth_uid = auth.uid()
                )
                -- 관리자
                OR EXISTS (
                    SELECT 1 FROM admin_users 
                    WHERE auth_uid = auth.uid() AND status = 'active'
                )
            )
        )
    );

-- 시스템에서만 히스토리 생성 (트리거를 통해)
-- INSERT는 애플리케이션 레벨에서 제어

-- =====================================================
-- 6. 리뷰 테이블 RLS 정책
-- =====================================================

-- 리뷰 작성자만 자신의 리뷰 수정/삭제 가능
CREATE POLICY "reviewer_own_reviews" ON reviews
    FOR ALL USING (
        (
            reviewer_type = 'business' AND
            EXISTS (
                SELECT 1 FROM business_users bu
                WHERE bu.id = reviews.reviewer_id AND bu.auth_uid = auth.uid()
            )
        )
        OR
        (
            reviewer_type = 'partner' AND
            EXISTS (
                SELECT 1 FROM partners_users pu
                WHERE pu.id = reviews.reviewer_id AND pu.auth_uid = auth.uid()
            )
        )
    );

-- 리뷰 대상자는 자신의 리뷰 조회 가능
CREATE POLICY "reviewee_view_reviews" ON reviews
    FOR SELECT USING (
        (
            reviewee_type = 'business' AND
            EXISTS (
                SELECT 1 FROM business_users bu
                WHERE bu.id = reviews.reviewee_id AND bu.auth_uid = auth.uid()
            )
        )
        OR
        (
            reviewee_type = 'partner' AND
            EXISTS (
                SELECT 1 FROM partners_users pu
                WHERE pu.id = reviews.reviewee_id AND pu.auth_uid = auth.uid()
            )
        )
    );

-- 관리자는 모든 리뷰 접근 가능
CREATE POLICY "admin_access_reviews" ON reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE auth_uid = auth.uid() AND status = 'active'
        )
    );

-- =====================================================
-- 7. 알림 테이블 RLS 정책
-- =====================================================

-- 사용자는 자신의 알림만 접근
CREATE POLICY "user_own_notifications" ON notifications
    FOR ALL USING (
        (
            user_type = 'business' AND
            EXISTS (
                SELECT 1 FROM business_users bu
                WHERE bu.id = notifications.user_id AND bu.auth_uid = auth.uid()
            )
        )
        OR
        (
            user_type = 'partner' AND
            EXISTS (
                SELECT 1 FROM partners_users pu
                WHERE pu.id = notifications.user_id AND pu.auth_uid = auth.uid()
            )
        )
        OR
        (
            user_type = 'admin' AND
            EXISTS (
                SELECT 1 FROM admin_users au
                WHERE au.id = notifications.user_id AND au.auth_uid = auth.uid()
            )
        )
    );

-- =====================================================
-- 8. 정산 테이블 RLS 정책
-- =====================================================

-- 파트너는 자신의 정산 내역만 접근
CREATE POLICY "partner_own_settlements" ON settlements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM partners_users pu
            WHERE pu.id = settlements.partner_id AND pu.auth_uid = auth.uid()
        )
    );

-- 비즈니스는 자신의 작업에 대한 정산 내역 조회 가능
CREATE POLICY "business_view_settlements" ON settlements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM business_users bu
            WHERE bu.id = settlements.business_id AND bu.auth_uid = auth.uid()
        )
    );

-- 관리자는 모든 정산 접근 가능
CREATE POLICY "admin_access_settlements" ON settlements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE auth_uid = auth.uid() AND status = 'active'
        )
    );

-- =====================================================
-- 9. 공개 조회 정책 (인증되지 않은 사용자용)
-- =====================================================

-- 공개 통계 조회 등을 위한 제한적 접근 (필요시 추가)
-- 현재 MVP에서는 모든 데이터가 인증 필요

-- =====================================================
-- 10. 유틸리티 함수 (RLS에서 사용)
-- =====================================================

-- 현재 사용자가 관리자인지 확인하는 함수
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE auth_uid = auth.uid() AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 현재 사용자의 비즈니스 ID 반환 함수
CREATE OR REPLACE FUNCTION current_business_id()
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT id FROM business_users 
        WHERE auth_uid = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 현재 사용자의 파트너 ID 반환 함수
CREATE OR REPLACE FUNCTION current_partner_id()
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT id FROM partners_users 
        WHERE auth_uid = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS 정책 설정 완료
-- =====================================================

SELECT 'RLS 정책 설정이 완료되었습니다.' as message;

-- 정책 확인 쿼리 (참고용)
/*
-- 모든 정책 조회
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 특정 테이블의 정책 조회
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'jobs';
*/