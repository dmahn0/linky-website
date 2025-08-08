-- =====================================================
-- Linky Platform MVP Schema
-- 버전: 1.0.0
-- 생성일: 2025-01-07
-- 설명: 핵심 기능만 포함한 MVP 스키마
-- =====================================================

-- 기존 테이블 정리 (필요시 백업 후 실행)
-- DROP TABLE IF EXISTS ... CASCADE;

-- =====================================================
-- 1. 사용자 관리 테이블
-- =====================================================

-- 1.1 비즈니스 사용자 (공간 운영자)
CREATE TABLE IF NOT EXISTS business_users (
    id BIGSERIAL PRIMARY KEY,
    auth_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50) NOT NULL, -- study, party, studio, meeting, other
    owner_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    business_registration_number VARCHAR(20),
    space_count INTEGER DEFAULT 1, -- 보유 공간/사업장 개수
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, inactive, suspended
    subscription_plan VARCHAR(20) DEFAULT 'basic', -- basic, standard, premium
    monthly_limit INTEGER DEFAULT 1000000, -- 월 사용 한도 (원)
    current_month_spent INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}', -- 확장 가능한 메타데이터
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 파트너 사용자 (서비스 제공자)  
CREATE TABLE IF NOT EXISTS partners_users (
    id BIGSERIAL PRIMARY KEY,
    auth_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    birth_date DATE,
    gender VARCHAR(10), -- male, female, other
    address TEXT,
    profile_image TEXT,
    bio TEXT,
    rating DECIMAL(2,1) DEFAULT 0.0,
    completed_jobs INTEGER DEFAULT 0,
    total_earnings BIGINT DEFAULT 0,
    this_month_earnings BIGINT DEFAULT 0,
    verification_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
    availability_status VARCHAR(20) DEFAULT 'offline', -- offline, available, busy
    preferred_job_types TEXT[], -- 선호 작업 유형 배열
    preferred_areas TEXT[], -- 선호 지역 배열
    skills TEXT[], -- 보유 스킬 배열
    available_hours JSONB DEFAULT '{}', -- 요일별 가능 시간
    emergency_contact JSONB DEFAULT '{}', -- 비상연락처 정보
    bank_info JSONB DEFAULT '{}', -- 정산 계좌 정보 (암호화 필요)
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, inactive, suspended  
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 관리자 사용자
CREATE TABLE IF NOT EXISTS admin_users (
    id BIGSERIAL PRIMARY KEY,
    auth_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin', -- admin, super_admin, cs
    permissions TEXT[] DEFAULT ARRAY['read'], -- 권한 배열
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. 공간 관리 테이블
-- =====================================================

-- 2.1 공간 정보
CREATE TABLE IF NOT EXISTS spaces (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT REFERENCES business_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    space_type VARCHAR(50) NOT NULL, -- study, party, studio, meeting, other
    address TEXT NOT NULL,
    size_sqm INTEGER, -- 평방미터
    capacity INTEGER, -- 수용 인원
    operating_hours JSONB DEFAULT '{}', -- 운영 시간
    cleaning_schedule VARCHAR(20) DEFAULT 'daily', -- daily, weekly, monthly
    cleaning_requirements JSONB DEFAULT '{}', -- 청소 요구사항
    access_info JSONB DEFAULT '{}', -- 출입 정보 (코드, 키 등)
    equipment_list TEXT[], -- 비치된 장비/가구 목록
    special_instructions TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, maintenance
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. 작업 관리 테이블
-- =====================================================

-- 3.1 작업 정보
CREATE TABLE IF NOT EXISTS jobs (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT REFERENCES business_users(id) ON DELETE CASCADE,
    space_id BIGINT REFERENCES spaces(id) ON DELETE CASCADE,
    assigned_partner_id BIGINT REFERENCES partners_users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    job_type VARCHAR(50) DEFAULT 'cleaning', -- cleaning, maintenance, setup
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    estimated_duration INTEGER DEFAULT 60, -- 예상 소요시간 (분)
    base_price INTEGER NOT NULL, -- 기본 요금 (원)
    final_price INTEGER, -- 최종 요금 (완료 시 확정)
    special_requirements JSONB DEFAULT '{}', -- 특별 요구사항
    status VARCHAR(20) DEFAULT 'pending', -- pending, assigned, in_progress, completed, cancelled
    completion_notes TEXT, -- 완료 시 작성 노트
    completion_photos TEXT[], -- 완료 사진 URL 배열
    completed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 작업 지원 (파트너의 작업 지원)
CREATE TABLE IF NOT EXISTS job_applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT REFERENCES jobs(id) ON DELETE CASCADE,
    partner_id BIGINT REFERENCES partners_users(id) ON DELETE CASCADE,
    message TEXT, -- 지원 메시지
    proposed_price INTEGER, -- 제안 가격
    estimated_completion_time INTEGER, -- 예상 완료 시간 (분)
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, withdrawn
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- 3.3 작업 상태 히스토리
CREATE TABLE IF NOT EXISTS job_status_history (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT REFERENCES jobs(id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by_type VARCHAR(20) NOT NULL, -- business, partner, system, admin
    changed_by_id BIGINT, -- 변경한 사용자 ID
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. 부가 기능 테이블
-- =====================================================

-- 4.1 리뷰 시스템
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT REFERENCES jobs(id) ON DELETE CASCADE,
    reviewer_type VARCHAR(20) NOT NULL, -- business, partner
    reviewer_id BIGINT NOT NULL, -- business_id 또는 partner_id
    reviewee_type VARCHAR(20) NOT NULL, -- business, partner
    reviewee_id BIGINT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    helpful_votes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, hidden, deleted
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 알림 시스템
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_type VARCHAR(20) NOT NULL, -- business, partner, admin
    user_id BIGINT NOT NULL, -- 해당 타입의 사용자 ID
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- job_assigned, job_completed, payment, etc.
    related_id BIGINT, -- 관련 레코드 ID (job_id, payment_id 등)
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    priority VARCHAR(10) DEFAULT 'normal', -- low, normal, high, urgent
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3 정산 시스템 (간단한 버전)
CREATE TABLE IF NOT EXISTS settlements (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT REFERENCES jobs(id) ON DELETE CASCADE,
    partner_id BIGINT REFERENCES partners_users(id) ON DELETE CASCADE,
    business_id BIGINT REFERENCES business_users(id) ON DELETE CASCADE,
    job_amount INTEGER NOT NULL, -- 작업 금액
    platform_fee INTEGER NOT NULL, -- 플랫폼 수수료
    partner_amount INTEGER NOT NULL, -- 파트너 지급액 (job_amount - platform_fee)
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, refunded
    payment_method VARCHAR(20) DEFAULT 'bank_transfer',
    payment_date TIMESTAMPTZ,
    transaction_id VARCHAR(100), -- 외부 결제 시스템 거래 ID
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. 인덱스 생성 (성능 최적화)
-- =====================================================

-- 사용자 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_business_users_auth_uid ON business_users(auth_uid);
CREATE INDEX IF NOT EXISTS idx_business_users_email ON business_users(email);
CREATE INDEX IF NOT EXISTS idx_business_users_status ON business_users(status);

CREATE INDEX IF NOT EXISTS idx_partners_users_auth_uid ON partners_users(auth_uid);
CREATE INDEX IF NOT EXISTS idx_partners_users_email ON partners_users(email);
CREATE INDEX IF NOT EXISTS idx_partners_users_status ON partners_users(status);
CREATE INDEX IF NOT EXISTS idx_partners_users_availability ON partners_users(availability_status);
CREATE INDEX IF NOT EXISTS idx_partners_users_verification ON partners_users(verification_status);

-- 공간 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_spaces_business_id ON spaces(business_id);
CREATE INDEX IF NOT EXISTS idx_spaces_status ON spaces(status);

-- 작업 테이블 인덱스  
CREATE INDEX IF NOT EXISTS idx_jobs_business_id ON jobs(business_id);
CREATE INDEX IF NOT EXISTS idx_jobs_space_id ON jobs(space_id);
CREATE INDEX IF NOT EXISTS idx_jobs_partner_id ON jobs(assigned_partner_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_status_date ON jobs(status, scheduled_date);

-- 작업 지원 인덱스
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_partner_id ON job_applications(partner_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- 알림 인덱스 (읽지 않은 알림 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_type, user_id, is_read) 
WHERE is_read = FALSE;

-- 정산 인덱스
CREATE INDEX IF NOT EXISTS idx_settlements_partner_id ON settlements(partner_id);
CREATE INDEX IF NOT EXISTS idx_settlements_business_id ON settlements(business_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(payment_status);

-- =====================================================
-- 6. 업데이트 트리거 함수
-- =====================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
CREATE TRIGGER update_business_users_updated_at 
    BEFORE UPDATE ON business_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_users_updated_at 
    BEFORE UPDATE ON partners_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaces_updated_at 
    BEFORE UPDATE ON spaces 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
    BEFORE UPDATE ON jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settlements_updated_at 
    BEFORE UPDATE ON settlements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. 도우미 함수들
-- =====================================================

-- 사용자 타입 확인 함수
CREATE OR REPLACE FUNCTION get_user_type(user_auth_uid UUID)
RETURNS TEXT AS $$
DECLARE
    user_type TEXT;
BEGIN
    -- business_users 확인
    IF EXISTS (SELECT 1 FROM business_users WHERE auth_uid = user_auth_uid) THEN
        RETURN 'business';
    END IF;
    
    -- partners_users 확인  
    IF EXISTS (SELECT 1 FROM partners_users WHERE auth_uid = user_auth_uid) THEN
        RETURN 'partners';
    END IF;
    
    -- admin_users 확인
    IF EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = user_auth_uid) THEN
        RETURN 'admin';
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 파트너 통계 업데이트 함수
CREATE OR REPLACE FUNCTION update_partner_stats(partner_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE partners_users SET
        completed_jobs = (
            SELECT COUNT(*) FROM jobs 
            WHERE assigned_partner_id = partner_id AND status = 'completed'
        ),
        total_earnings = (
            SELECT COALESCE(SUM(partner_amount), 0) FROM settlements 
            WHERE partner_id = update_partner_stats.partner_id AND payment_status = 'paid'
        ),
        this_month_earnings = (
            SELECT COALESCE(SUM(partner_amount), 0) FROM settlements 
            WHERE partner_id = update_partner_stats.partner_id 
            AND payment_status = 'paid'
            AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
        ),
        rating = (
            SELECT COALESCE(AVG(rating), 0.0) FROM reviews 
            WHERE reviewee_type = 'partner' AND reviewee_id = partner_id
        )
    WHERE id = partner_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. 초기 데이터 (관리자 계정 등)
-- =====================================================

-- 기본 관리자 계정은 별도로 생성하거나 Supabase 대시보드에서 수동 추가

-- =====================================================
-- 스키마 생성 완료
-- =====================================================

COMMENT ON TABLE business_users IS '비즈니스 운영자 사용자 테이블';
COMMENT ON TABLE partners_users IS '파트너(서비스 제공자) 사용자 테이블';  
COMMENT ON TABLE admin_users IS '관리자 사용자 테이블';
COMMENT ON TABLE spaces IS '공간 정보 테이블';
COMMENT ON TABLE jobs IS '작업/청소 주문 테이블';
COMMENT ON TABLE job_applications IS '작업 지원 테이블';
COMMENT ON TABLE job_status_history IS '작업 상태 변경 히스토리';
COMMENT ON TABLE reviews IS '리뷰/평가 테이블';
COMMENT ON TABLE notifications IS '알림 테이블';
COMMENT ON TABLE settlements IS '정산 테이블';

SELECT 'MVP 스키마 생성이 완료되었습니다.' as message;